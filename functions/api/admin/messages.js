import {
  handleError,
  jsonResponse,
  methodNotAllowed,
  noContent,
  notFound,
  parseId,
} from "./utils.js";

async function hasMessagesTable(env) {
  const table = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'contact_messages'",
  ).first();
  return Boolean(table);
}

export async function handleMessages(request, env) {
  if (!env.DB) {
    return jsonResponse({ error: "La base D1 n’est pas configurée." }, 500);
  }

  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const itemMatch = /^\/api\/admin\/messages\/(\d+)$/.exec(path);

  try {
    // La table n’existe pas encore en production : on renvoie une boîte vide
    // au lieu de casser le tableau de bord. Voir sql/d1-contact-messages.sql.
    if (path === "/api/admin/messages") {
      if (request.method !== "GET") {
        return methodNotAllowed("GET");
      }

      if (!(await hasMessagesTable(env))) {
        return jsonResponse([]);
      }

      const { results } = await env.DB.prepare(`
        SELECT id, name, email, subject, message, created_at AS createdAt
        FROM contact_messages
        ORDER BY created_at DESC, id DESC
      `).all();

      return jsonResponse(results || []);
    }

    if (itemMatch) {
      if (request.method !== "DELETE") {
        return methodNotAllowed("DELETE");
      }

      if (!(await hasMessagesTable(env))) {
        return notFound("Message introuvable.");
      }

      const id = parseId(itemMatch[1]);
      const result = await env.DB.prepare(
        "DELETE FROM contact_messages WHERE id = ?",
      ).bind(id).run();

      if (!result.meta?.changes) {
        return notFound("Message introuvable.");
      }

      return noContent();
    }

    return notFound("Route admin introuvable.");
  } catch (error) {
    return handleError(error, "Admin messages");
  }
}
