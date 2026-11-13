import {
  handleError,
  jsonResponse,
  methodNotAllowed,
  noContent,
  notFound,
  readJson,
  requireColor,
  requireInteger,
  requireSlug,
  requireString,
} from "./utils.js";

function categoryInput(body, slug = null) {
  return {
    slug: slug ?? requireSlug(body.slug),
    name: requireString(body.name, 100, "Le nom"),
    icon: requireString(body.icon, 16, "L’icône"),
    color: requireColor(body.color),
    sortOrder: requireInteger(body.sortOrder ?? 0, 0, 65535, "L’ordre d’affichage"),
  };
}

function isUniqueError(error) {
  return /UNIQUE constraint failed/i.test(String(error?.message || ""));
}

export async function handleCategories(request, env) {
  if (!env.DB) {
    return jsonResponse({ error: "La base D1 n’est pas configurée." }, 500);
  }

  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const itemMatch = /^\/api\/admin\/categories\/([^/]+)$/.exec(path);

  try {
    if (path === "/api/admin/categories") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT slug, name, icon, color, sort_order AS sortOrder
          FROM skill_categories
          ORDER BY sort_order, slug
        `).all();

        return jsonResponse(results || []);
      }

      if (request.method === "POST") {
        const category = categoryInput(await readJson(request));

        await env.DB.prepare(`
          INSERT INTO skill_categories (slug, name, icon, color, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          category.slug,
          category.name,
          category.icon,
          category.color,
          category.sortOrder,
        ).run();

        return jsonResponse(category, 201);
      }

      return methodNotAllowed("GET, POST");
    }

    if (itemMatch) {
      const slug = decodeURIComponent(itemMatch[1]);

      if (request.method === "PUT") {
        const category = categoryInput(await readJson(request), slug);
        const result = await env.DB.prepare(`
          UPDATE skill_categories
          SET name = ?, icon = ?, color = ?, sort_order = ?
          WHERE slug = ?
        `).bind(
          category.name,
          category.icon,
          category.color,
          category.sortOrder,
          slug,
        ).run();

        if (!result.meta?.changes) {
          return notFound("Catégorie introuvable.");
        }

        return jsonResponse(category);
      }

      if (request.method === "DELETE") {
        const results = await env.DB.batch([
          env.DB.prepare("DELETE FROM skills WHERE category_slug = ?").bind(slug),
          env.DB.prepare("DELETE FROM skill_categories WHERE slug = ?").bind(slug),
        ]);

        if (!results[1]?.meta?.changes) {
          return notFound("Catégorie introuvable.");
        }

        return noContent();
      }

      return methodNotAllowed("PUT, DELETE");
    }

    return notFound("Route admin introuvable.");
  } catch (error) {
    if (isUniqueError(error)) {
      return jsonResponse({ error: "Cette catégorie existe déjà." }, 409);
    }
    return handleError(error, "Admin categories");
  }
}
