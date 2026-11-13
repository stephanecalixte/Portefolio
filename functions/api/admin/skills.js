import {
  HttpError,
  handleError,
  jsonResponse,
  methodNotAllowed,
  noContent,
  notFound,
  parseId,
  readJson,
  requireInteger,
  requireString,
} from "./utils.js";

function serializeCategories(rows) {
  const categories = new Map();

  for (const row of rows || []) {
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
        name: row.skillName,
        level: row.level,
        sortOrder: row.skillSortOrder,
      });
    }
  }

  return [...categories.values()];
}

function skillInput(body) {
  return {
    categorySlug: requireString(body.categorySlug, 64, "La catégorie"),
    name: requireString(body.name, 180, "Le nom"),
    level: requireInteger(body.level, 0, 100, "Le niveau"),
    sortOrder: requireInteger(body.sortOrder ?? 0, 0, 65535, "L’ordre d’affichage"),
  };
}

async function assertCategory(env, slug) {
  const category = await env.DB.prepare(
    "SELECT slug FROM skill_categories WHERE slug = ?",
  ).bind(slug).first();

  if (!category) {
    throw new HttpError(400, "La catégorie sélectionnée est introuvable.");
  }
}

function isUniqueError(error) {
  return /UNIQUE constraint failed/i.test(String(error?.message || ""));
}

export async function handleSkills(request, env) {
  if (!env.DB) {
    return jsonResponse({ error: "La base D1 n’est pas configurée." }, 500);
  }

  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const itemMatch = /^\/api\/admin\/skills\/(\d+)$/.exec(path);

  try {
    if (path === "/api/admin/skills") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT
            c.slug AS categorySlug,
            c.name AS category,
            c.icon,
            c.color,
            c.sort_order AS categorySortOrder,
            s.id,
            s.name AS skillName,
            s.level,
            s.sort_order AS skillSortOrder
          FROM skill_categories c
          LEFT JOIN skills s ON s.category_slug = c.slug
          ORDER BY c.sort_order, s.sort_order, s.id
        `).all();

        return jsonResponse(serializeCategories(results));
      }

      if (request.method === "POST") {
        const skill = skillInput(await readJson(request));
        await assertCategory(env, skill.categorySlug);

        const result = await env.DB.prepare(`
          INSERT INTO skills (category_slug, name, level, sort_order)
          VALUES (?, ?, ?, ?)
        `).bind(
          skill.categorySlug,
          skill.name,
          skill.level,
          skill.sortOrder,
        ).run();

        return jsonResponse(
          { id: Number(result.meta?.last_row_id), ...skill },
          201,
        );
      }

      return methodNotAllowed("GET, POST");
    }

    if (itemMatch) {
      const id = parseId(itemMatch[1]);

      if (request.method === "PUT") {
        const skill = skillInput(await readJson(request));
        await assertCategory(env, skill.categorySlug);

        const result = await env.DB.prepare(`
          UPDATE skills
          SET category_slug = ?, name = ?, level = ?, sort_order = ?
          WHERE id = ?
        `).bind(
          skill.categorySlug,
          skill.name,
          skill.level,
          skill.sortOrder,
          id,
        ).run();

        if (!result.meta?.changes) {
          return notFound("Compétence introuvable.");
        }

        return jsonResponse({ id, ...skill });
      }

      if (request.method === "DELETE") {
        const result = await env.DB.prepare(
          "DELETE FROM skills WHERE id = ?",
        ).bind(id).run();

        if (!result.meta?.changes) {
          return notFound("Compétence introuvable.");
        }

        return noContent();
      }

      return methodNotAllowed("PUT, DELETE");
    }

    return notFound("Route admin introuvable.");
  } catch (error) {
    if (isUniqueError(error)) {
      return jsonResponse({ error: "Cette compétence existe déjà." }, 409);
    }
    return handleError(error, "Admin skills");
  }
}
