import { onRequest as adminMiddleware } from "../functions/_middleware.js";
import {
  onRequestOptions as contactOptions,
  onRequestPost as contactPost,
} from "../functions/api/contact.js";
import { onRequestGet as projectsGet } from "../functions/api/projects.js";
import { onRequestGet as skillsGet } from "../functions/api/skills.js";

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
