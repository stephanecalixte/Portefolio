const MAX_BODY_BYTES = 48 * 1024;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export function noContent() {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export function methodNotAllowed(allow) {
  return jsonResponse({ error: "Méthode non autorisée." }, 405, { Allow: allow });
}

export function notFound(message = "Ressource introuvable.") {
  return jsonResponse({ error: message }, 404);
}

export async function readJson(request) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    throw new HttpError(415, "Le corps de la requête doit être du JSON.");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new HttpError(413, "Le formulaire envoyé est trop volumineux.");
  }

  let body;
  try {
    body = JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Le formulaire envoyé n’est pas valide.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Les données envoyées sont invalides.");
  }

  return body;
}

export function handleError(error, label) {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  console.error(`${label} :`, error?.message || "inconnue");
  return jsonResponse(
    { error: "Une erreur est survenue. Veuillez réessayer plus tard." },
    500,
  );
}

export function requireString(value, maxLength, label) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(
      400,
      `${label} est obligatoire et limité à ${maxLength} caractères.`,
    );
  }
  return value.trim();
}

export function requireInteger(value, min, max, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(400, `${label} doit être compris entre ${min} et ${max}.`);
  }
  return number;
}

export function requireBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${label} est invalide.`);
  }
  return value;
}

export function requireStringList(value, label, maxItems = 30) {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new HttpError(
      400,
      `${label} doit être une liste valide de ${maxItems} éléments maximum.`,
    );
  }
  return value.map((item) => requireString(item, 180, label));
}

export function requireColor(value) {
  const color = requireString(value, 7, "La couleur");
  if (!/^#[\da-f]{6}$/i.test(color)) {
    throw new HttpError(400, "La couleur doit être au format hexadécimal.");
  }
  return color;
}

export function requireSlug(value) {
  const slug = requireString(value, 64, "Le slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new HttpError(
      400,
      "Le slug doit contenir uniquement des minuscules, chiffres et tirets.",
    );
  }
  return slug;
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, "Identifiant invalide.");
  }
  return id;
}

export function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
