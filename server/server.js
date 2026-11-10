import "dotenv/config";
import express from "express";
import process from "node:process";
import pool from "../sql/db.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const contactRequests = new Map();
const MAX_BODY_BYTES = "48kb";

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

  if (previousRequest && now - previousRequest < 60_000) {
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
    contactRequests.set(clientIp, now);
    if (contactRequests.size > 1000) {
      for (const [ip, timestamp] of contactRequests) {
        if (now - timestamp >= 60_000) contactRequests.delete(ip);
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
