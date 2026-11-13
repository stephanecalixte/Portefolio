import {
  handleError,
  jsonResponse,
  methodNotAllowed,
  noContent,
  notFound,
  parseId,
  parseList,
  readJson,
  requireBoolean,
  requireColor,
  requireInteger,
  requireString,
  requireStringList,
} from "./utils.js";

const PROJECT_SELECT = `
  SELECT
    id, title, category, category_label AS categoryLabel, year,
    short_desc AS shortDesc, long_desc AS longDesc, tech, status,
    color, icon, features, sort_order AS sortOrder, is_published AS isPublished
  FROM projects
`;

function serializeProject(row) {
  return {
    ...row,
    tech: parseList(row.tech),
    features: parseList(row.features),
    isPublished: Boolean(row.isPublished),
  };
}

function projectInput(body) {
  return {
    title: requireString(body.title, 180, "Le titre"),
    category: requireString(body.category, 64, "La catégorie"),
    categoryLabel: requireString(body.categoryLabel, 100, "Le libellé de catégorie"),
    year: requireInteger(body.year, 2000, 2100, "L’année"),
    shortDesc: requireString(body.shortDesc, 500, "La description courte"),
    longDesc: requireString(body.longDesc, 20_000, "La description"),
    tech: requireStringList(body.tech, "Les technologies"),
    status: requireString(body.status, 40, "Le statut"),
    color: requireColor(body.color),
    icon: requireString(body.icon, 16, "L’icône"),
    features: requireStringList(body.features, "Les fonctionnalités"),
    sortOrder: requireInteger(body.sortOrder, 0, 65535, "L’ordre d’affichage"),
    isPublished: requireBoolean(body.isPublished, "Le statut de publication"),
  };
}

export async function handleProjects(request, env) {
  if (!env.DB) {
    return jsonResponse({ error: "La base D1 n’est pas configurée." }, 500);
  }

  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const itemMatch = /^\/api\/admin\/projects\/(\d+)$/.exec(path);

  try {
    if (path === "/api/admin/projects") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(
          `${PROJECT_SELECT} ORDER BY sort_order, id`,
        ).all();
        return jsonResponse((results || []).map(serializeProject));
      }

      if (request.method === "POST") {
        const project = projectInput(await readJson(request));
        const next = await env.DB.prepare(
          "SELECT COALESCE(MAX(id), 0) + 1 AS id FROM projects",
        ).first();
        const id = Number(next?.id) || 1;

        await env.DB.prepare(`
          INSERT INTO projects (
            id, title, category, category_label, year, short_desc, long_desc,
            tech, status, color, icon, features, sort_order, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          project.title,
          project.category,
          project.categoryLabel,
          project.year,
          project.shortDesc,
          project.longDesc,
          JSON.stringify(project.tech),
          project.status,
          project.color,
          project.icon,
          JSON.stringify(project.features),
          project.sortOrder,
          project.isPublished ? 1 : 0,
        ).run();

        return jsonResponse({ id, ...project }, 201);
      }

      return methodNotAllowed("GET, POST");
    }

    if (itemMatch) {
      const id = parseId(itemMatch[1]);

      if (request.method === "PUT") {
        const project = projectInput(await readJson(request));
        const result = await env.DB.prepare(`
          UPDATE projects SET
            title = ?, category = ?, category_label = ?, year = ?,
            short_desc = ?, long_desc = ?, tech = ?, status = ?,
            color = ?, icon = ?, features = ?, sort_order = ?, is_published = ?
          WHERE id = ?
        `).bind(
          project.title,
          project.category,
          project.categoryLabel,
          project.year,
          project.shortDesc,
          project.longDesc,
          JSON.stringify(project.tech),
          project.status,
          project.color,
          project.icon,
          JSON.stringify(project.features),
          project.sortOrder,
          project.isPublished ? 1 : 0,
          id,
        ).run();

        if (!result.meta?.changes) {
          return notFound("Projet introuvable.");
        }

        return jsonResponse({ id, ...project });
      }

      if (request.method === "DELETE") {
        const result = await env.DB.prepare(
          "DELETE FROM projects WHERE id = ?",
        ).bind(id).run();

        if (!result.meta?.changes) {
          return notFound("Projet introuvable.");
        }

        return noContent();
      }

      return methodNotAllowed("PUT, DELETE");
    }

    return notFound("Route admin introuvable.");
  } catch (error) {
    return handleError(error, "Admin projects");
  }
}
