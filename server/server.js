import "dotenv/config";
import express from "express";
import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import pool from "../sql/db.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const contactRequests = new Map();
const adminLoginAttempts = new Map();
const MAX_BODY_BYTES = "48kb";
const ADMIN_COOKIE = "portfolio_admin_session";
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_LOGIN_ATTEMPTS = 5;

const adminConfiguration = () => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;
  return ADMIN_USERNAME && ADMIN_PASSWORD && ADMIN_SESSION_SECRET?.length >= 32
    ? { username: ADMIN_USERNAME, password: ADMIN_PASSWORD, secret: ADMIN_SESSION_SECRET }
    : null;
};

const fixedTimeEqual = (left, right) =>
  timingSafeEqual(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest(),
  );

const createAdminSession = (configuration) => {
  const payload = Buffer.from(JSON.stringify({
    sub: configuration.username,
    exp: Date.now() + ADMIN_SESSION_MS,
  })).toString("base64url");
  const signature = createHmac("sha256", configuration.secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const hasValidAdminSession = (req, configuration) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  if (!cookie) return false;

  const [payload, signature, extra] = cookie.split(".");
  if (!payload || !signature || extra) return false;

  const expectedSignature = createHmac("sha256", configuration.secret)
    .update(payload)
    .digest("base64url");
  if (!fixedTimeEqual(signature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.sub === configuration.username &&
      Number.isFinite(session.exp) &&
      session.exp > Date.now();
  } catch {
    return false;
  }
};

const adminCookieOptions = (maxAge) =>
  `${ADMIN_COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

const requireAdmin = (req, res, next) => {
  const configuration = adminConfiguration();
  res.setHeader("Cache-Control", "no-store");
  if (!configuration) {
    return res.status(503).json({ error: "L’administration n’est pas configurée sur le serveur." });
  }
  if (!hasValidAdminSession(req, configuration)) {
    return res.status(401).json({ error: "Votre session a expiré. Reconnectez-vous." });
  }
  next();
};

const adminString = (value, maxLength, label) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`${label} est obligatoire et limité à ${maxLength} caractères.`);
  }
  return value.trim();
};

const adminStringList = (value, label, maxItems = 30) => {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${label} doit être une liste valide de ${maxItems} éléments maximum.`);
  }
  return value.map((item) => adminString(item, 180, label));
};

const adminProjectInput = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Les données du projet sont invalides.");
  }
  const year = Number(body.year);
  const sortOrder = Number(body.sortOrder);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("L’année doit être comprise entre 2000 et 2100.");
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) {
    throw new Error("L’ordre d’affichage doit être un nombre positif valide.");
  }
  if (typeof body.isPublished !== "boolean") {
    throw new Error("Le statut de publication est invalide.");
  }
  const color = adminString(body.color, 7, "La couleur");
  if (!/^#[\da-f]{6}$/i.test(color)) throw new Error("La couleur doit être au format hexadécimal.");

  return {
    title: adminString(body.title, 180, "Le titre"),
    category: adminString(body.category, 64, "La catégorie"),
    categoryLabel: adminString(body.categoryLabel, 100, "Le libellé de catégorie"),
    year,
    shortDesc: adminString(body.shortDesc, 500, "La description courte"),
    longDesc: adminString(body.longDesc, 20_000, "La description"),
    tech: adminStringList(body.tech, "Les technologies"),
    status: adminString(body.status, 40, "Le statut"),
    color,
    icon: adminString(body.icon, 16, "L’icône"),
    features: adminStringList(body.features, "Les fonctionnalités"),
    sortOrder,
    isPublished: body.isPublished,
  };
};

const parseAdminId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Identifiant invalide.");
  return id;
};

app.use(express.json({ limit: MAX_BODY_BYTES }));
app.use(express.urlencoded({ extended: true, limit: MAX_BODY_BYTES }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/login", (req, res) => {
  const configuration = adminConfiguration();
  res.setHeader("Cache-Control", "no-store");
  if (!configuration) {
    return res.status(503).json({ error: "L’administration n’est pas configurée sur le serveur." });
  }

  const now = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const attempts = adminLoginAttempts.get(clientIp);
  if (attempts && now - attempts.startedAt < ADMIN_LOGIN_WINDOW_MS &&
      attempts.count >= ADMIN_MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ error: "Trop de tentatives. Réessayez dans 15 minutes." });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Les identifiants sont invalides." });
  }

  const username = typeof req.body.username === "string" ? req.body.username : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!fixedTimeEqual(username, configuration.username) ||
      !fixedTimeEqual(password, configuration.password)) {
    const current = attempts && now - attempts.startedAt < ADMIN_LOGIN_WINDOW_MS
      ? attempts
      : { startedAt: now, count: 0 };
    current.count += 1;
    adminLoginAttempts.set(clientIp, current);
    if (adminLoginAttempts.size > 1000) {
      for (const [ip, entry] of adminLoginAttempts) {
        if (now - entry.startedAt >= ADMIN_LOGIN_WINDOW_MS) adminLoginAttempts.delete(ip);
      }
    }
    return res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
  }

  adminLoginAttempts.delete(clientIp);
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${createAdminSession(configuration)}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_MS / 1000}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  res.json({ authenticated: true, username: configuration.username });
});

app.post("/api/admin/logout", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", adminCookieOptions(0));
  res.json({ authenticated: false });
});

app.get("/api/admin/session", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const configuration = adminConfiguration();
  if (!configuration) {
    return res.status(503).json({ error: "L’administration n’est pas configurée sur le serveur." });
  }
  if (!hasValidAdminSession(req, configuration)) {
    return res.status(401).json({ error: "Votre session a expiré. Reconnectez-vous." });
  }
  res.json({ authenticated: true, username: configuration.username });
});

app.use("/api/admin", requireAdmin);

app.get("/api/admin/projects", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id, title, category, category_label AS categoryLabel, year,
        short_desc AS shortDesc, long_desc AS longDesc, tech, status,
        color, icon, features, sort_order AS sortOrder, is_published AS isPublished
      FROM projects
      ORDER BY sort_order, id
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/projects", async (req, res, next) => {
  let project;
  try {
    project = adminProjectInput(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const [rows] = await pool.query("SELECT COALESCE(MAX(id), 0) + 1 AS id FROM projects");
    const id = rows[0].id;
    await pool.execute(
      `INSERT INTO projects (
        id, title, category, category_label, year, short_desc, long_desc,
        tech, status, color, icon, features, sort_order, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, project.title, project.category, project.categoryLabel, project.year,
        project.shortDesc, project.longDesc, JSON.stringify(project.tech),
        project.status, project.color, project.icon, JSON.stringify(project.features),
        project.sortOrder, project.isPublished,
      ],
    );
    res.status(201).json({ id, ...project });
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/projects/:id", async (req, res, next) => {
  let id;
  let project;
  try {
    id = parseAdminId(req.params.id);
    project = adminProjectInput(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE projects SET
        title = ?, category = ?, category_label = ?, year = ?, short_desc = ?,
        long_desc = ?, tech = ?, status = ?, color = ?, icon = ?, features = ?,
        sort_order = ?, is_published = ?
      WHERE id = ?`,
      [
        project.title, project.category, project.categoryLabel, project.year,
        project.shortDesc, project.longDesc, JSON.stringify(project.tech),
        project.status, project.color, project.icon, JSON.stringify(project.features),
        project.sortOrder, project.isPublished, id,
      ],
    );
    if (!result.affectedRows) {
      const [existing] = await pool.execute("SELECT id FROM projects WHERE id = ?", [id]);
      if (!existing.length) return res.status(404).json({ error: "Projet introuvable." });
    }
    res.json({ id, ...project });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/projects/:id", async (req, res, next) => {
  let id;
  try {
    id = parseAdminId(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const [result] = await pool.execute("DELETE FROM projects WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Projet introuvable." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/skills", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.slug AS categorySlug, c.name AS category, c.icon, c.color,
        c.sort_order AS categorySortOrder, s.id, s.name, s.level,
        s.sort_order AS sortOrder
      FROM skill_categories c
      LEFT JOIN skills s ON s.category_slug = c.slug
      ORDER BY c.sort_order, s.sort_order, s.id
    `);
    const categories = new Map();
    for (const row of rows) {
      if (!categories.has(row.categorySlug)) {
        categories.set(row.categorySlug, {
          slug: row.categorySlug,
          category: row.category,
          icon: row.icon,
          color: row.color,
          sortOrder: row.categorySortOrder,
          items: [],
        });
      }
      if (row.id !== null) {
        categories.get(row.categorySlug).items.push({
          id: row.id,
          name: row.name,
          level: row.level,
          sortOrder: row.sortOrder,
        });
      }
    }
    res.json([...categories.values()]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/skills", async (req, res, next) => {
  let skill;
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      throw new Error("Les données de la compétence sont invalides.");
    }
    const level = Number(req.body.level);
    const sortOrder = Number(req.body.sortOrder ?? 0);
    if (!Number.isInteger(level) || level < 0 || level > 100) {
      throw new Error("Le niveau doit être compris entre 0 et 100.");
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) {
      throw new Error("L’ordre d’affichage doit être un nombre positif valide.");
    }
    skill = {
      categorySlug: adminString(req.body.categorySlug, 64, "La catégorie"),
      name: adminString(req.body.name, 180, "Le nom"),
      level,
      sortOrder,
    };
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const [result] = await pool.execute(
      "INSERT INTO skills (category_slug, name, level, sort_order) VALUES (?, ?, ?, ?)",
      [skill.categorySlug, skill.name, skill.level, skill.sortOrder],
    );
    res.status(201).json({ id: result.insertId, ...skill });
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/skills/:id", async (req, res, next) => {
  let id;
  let skill;
  try {
    id = parseAdminId(req.params.id);
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      throw new Error("Les données de la compétence sont invalides.");
    }
    const level = Number(req.body.level);
    const sortOrder = Number(req.body.sortOrder ?? 0);
    if (!Number.isInteger(level) || level < 0 || level > 100) {
      throw new Error("Le niveau doit être compris entre 0 et 100.");
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) {
      throw new Error("L’ordre d’affichage doit être un nombre positif valide.");
    }
    skill = {
      categorySlug: adminString(req.body.categorySlug, 64, "La catégorie"),
      name: adminString(req.body.name, 180, "Le nom"),
      level,
      sortOrder,
    };
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const [result] = await pool.execute(
      "UPDATE skills SET category_slug = ?, name = ?, level = ?, sort_order = ? WHERE id = ?",
      [skill.categorySlug, skill.name, skill.level, skill.sortOrder, id],
    );
    if (!result.affectedRows) {
      const [existing] = await pool.execute("SELECT id FROM skills WHERE id = ?", [id]);
      if (!existing.length) return res.status(404).json({ error: "Compétence introuvable." });
    }
    res.json({ id, ...skill });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/skills/:id", async (req, res, next) => {
  let id;
  try {
    id = parseAdminId(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const [result] = await pool.execute("DELETE FROM skills WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Compétence introuvable." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/messages", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, email, subject, message, created_at AS createdAt
      FROM contact_messages
      ORDER BY created_at DESC, id DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/messages/:id", async (req, res, next) => {
  let id;
  try {
    id = parseAdminId(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const [result] = await pool.execute("DELETE FROM contact_messages WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Message introuvable." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/skills", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.slug AS categorySlug,
        c.name AS category,
        c.icon,
        c.color,
        s.name AS skill,
        s.level
      FROM skill_categories c
      LEFT JOIN skills s ON s.category_slug = c.slug
      ORDER BY c.sort_order, s.sort_order
    `);

    const categories = new Map();
    for (const row of rows) {
      if (!categories.has(row.categorySlug)) {
        categories.set(row.categorySlug, {
          category: row.category,
          icon: row.icon,
          color: row.color,
          items: [],
        });
      }

      if (row.skill) {
        categories.get(row.categorySlug).items.push({
          name: row.skill,
          level: row.level,
        });
      }
    }

    res.json([...categories.values()]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/projects", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id, title, category, category_label AS categoryLabel, year,
        short_desc AS shortDesc, long_desc AS longDesc, tech, status,
        color, icon, features
      FROM projects
      WHERE is_published = TRUE
      ORDER BY sort_order, id
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/contact", async (req, res, next) => {
  const now = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const previousRequest = contactRequests.get(clientIp);

  if (previousRequest && now - previousRequest.timestamp < 60_000) {
    return res.status(429).json({ error: "Veuillez patienter une minute avant de renvoyer un message." });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Le formulaire est invalide." });
  }

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const subject = typeof req.body.subject === "string" ? req.body.subject.trim() : "";
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  const hasInvalidControls = (value, allowLineBreaks = false) => [...value].some((character) => {
    const code = character.codePointAt(0);
    if (code === 127 || code < 9 || (code > 13 && code < 32)) return true;
    return !allowLineBreaks && (code === 9 || code === 10 || code === 13);
  });

  if (!name || name.length > 120 || hasInvalidControls(name)) {
    return res.status(400).json({ error: "Le nom est obligatoire, limité à 120 caractères et ne doit pas contenir de caractères de contrôle." });
  }
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Veuillez saisir une adresse e-mail valide de 254 caractères maximum." });
  }
  if (!subject || subject.length > 200 || hasInvalidControls(subject)) {
    return res.status(400).json({ error: "Le sujet est obligatoire, limité à 200 caractères et ne doit pas contenir de caractères de contrôle." });
  }
  if (!message || message.length > 10_000 || hasInvalidControls(message, true)) {
    return res.status(400).json({ error: "Le message est obligatoire, limité à 10 000 caractères et ne doit pas contenir de caractères de contrôle." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );
    if (previousRequest) clearTimeout(previousRequest.expiryTimer);
    const expiryTimer = setTimeout(() => {
      if (contactRequests.get(clientIp)?.timestamp === now) {
        contactRequests.delete(clientIp);
      }
    }, 60_000);
    expiryTimer.unref();
    contactRequests.set(clientIp, { timestamp: now, expiryTimer });
    if (contactRequests.size > 1000) {
      for (const [ip, request] of contactRequests) {
        if (now - request.timestamp >= 60_000) {
          clearTimeout(request.expiryTimer);
          contactRequests.delete(ip);
        }
      }
    }

    res.status(201).json({ id: result.insertId, message: "Votre message a bien été enregistré." });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, next) => {
  console.error("Erreur API :", error.code || error.type || "ERREUR_INTERNE");
  if (res.headersSent) return next(error);
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Cet élément existe déjà." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Le formulaire envoyé est trop volumineux." });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Le formulaire envoyé n’est pas valide." });
  }
  res.status(500).json({ error: "Une erreur est survenue. Veuillez réessayer plus tard." });
});

const server = app.listen(port, () => {
  console.log(`API portfolio démarrée sur le port ${port}.`);
});

const purgeExpiredMessages = async () => {
  try {
    const [result] = await pool.query(
      "DELETE FROM contact_messages WHERE created_at < CURRENT_TIMESTAMP - INTERVAL 12 MONTH"
    );
    if (result.affectedRows > 0) {
      console.log(`${result.affectedRows} ancien(s) message(s) de contact supprimé(s).`);
    }
  } catch (error) {
    console.error("Échec du nettoyage des anciens messages de contact :", error.message);
  }
};

void purgeExpiredMessages();
const retentionTimer = setInterval(purgeExpiredMessages, 24 * 60 * 60 * 1000);
retentionTimer.unref();

server.on("error", (error) => {
  console.error("Impossible de démarrer l'API :", error.message);
  process.exitCode = 1;
});

const shutdown = async () => {
  clearInterval(retentionTimer);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
