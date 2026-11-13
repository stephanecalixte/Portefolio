import { onRequest as adminMiddleware } from "../functions/_middleware.js";
import {
  onRequestOptions as contactOptions,
  onRequestPost as contactPost,
} from "../functions/api/contact.js";
import { onRequestGet as projectsGet } from "../functions/api/projects.js";
import { onRequestGet as skillsGet } from "../functions/api/skills.js";
import { handleProjects } from "../functions/api/admin/projects.js";
import { handleSkills } from "../functions/api/admin/skills.js";
import { handleCategories } from "../functions/api/admin/categories.js";
import { handleMessages } from "../functions/api/admin/messages.js";

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function methodNotAllowed(allow) {
  return jsonResponse({ error: "Méthode non autorisée." }, 405, { Allow: allow });
}

function isPath(pathname, expected) {
  return pathname === expected || pathname === `${expected}/`;
}

async function handleAdminApi(request, env) {
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

  if (path === "/api/admin/projects" || path.startsWith("/api/admin/projects/")) {
    return handleProjects(request, env);
  }
  if (path === "/api/admin/skills" || path.startsWith("/api/admin/skills/")) {
    return handleSkills(request, env);
  }
  if (path === "/api/admin/categories" || path.startsWith("/api/admin/categories/")) {
    return handleCategories(request, env);
  }
  if (path === "/api/admin/messages" || path.startsWith("/api/admin/messages/")) {
    return handleMessages(request, env);
  }

  return jsonResponse({ error: "Route admin introuvable." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const context = {
      request,
      env,
      params: {},
      data: {},
      next: () => env.ASSETS.fetch(request),
      waitUntil: (promise) => ctx.waitUntil(promise),
      passThroughOnException: () => ctx.passThroughOnException(),
    };

    if (!env.ASSETS?.fetch) {
      console.error("Binding ASSETS manquant : vérifiez [assets] dans wrangler.toml.");
      return jsonResponse({ error: "Configuration des assets manquante." }, 500);
    }

    try {
      if (isPath(pathname, "/api/contact")) {
        if (request.method === "OPTIONS") return await contactOptions(context);
        if (request.method !== "POST") return methodNotAllowed("POST, OPTIONS");
        return await contactPost(context);
      }

      if (isPath(pathname, "/api/projects")) {
        if (request.method !== "GET") return methodNotAllowed("GET");
        return await projectsGet(context);
      }

      if (isPath(pathname, "/api/skills")) {
        if (request.method !== "GET") return methodNotAllowed("GET");
        return await skillsGet(context);
      }

      if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
        return await adminMiddleware({
          ...context,
          next: () => handleAdminApi(request, env),
        });
      }

      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return await adminMiddleware(context);
      }

      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Erreur du Worker :", error?.message || "inconnue");
      return jsonResponse({ error: "Erreur interne du serveur." }, 500);
    }
  },
};
