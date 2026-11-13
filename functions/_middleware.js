// Protège /admin et /admin/* par HTTP Basic Auth.
// Les identifiants viennent de ADMIN_USER / ADMIN_PASSWORD (jamais du code).
// Toutes les autres routes passent immédiatement à context.next().

const REALM = 'Basic realm="Admin", charset="UTF-8"';
let configurationErrorLogged = false;

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function unauthorized() {
  return new Response("Authentification requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function decodeBasicCredentials(header) {
  if (!header) return null;

  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header);
  if (!match) return null;

  let binary;
  try {
    binary = atob(match[1]);
  } catch {
    return null;
  }

  let decoded;
  try {
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return null;

  return {
    username: decoded.slice(0, separator),
    password: decoded.slice(separator + 1),
  };
}

function timingSafeEqual(left, right) {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  let difference = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const { pathname } = new URL(request.url);

  if (!isAdminPath(pathname)) {
    return next();
  }

  const expectedUser = env.ADMIN_USER;
  const expectedPassword = env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    if (!configurationErrorLogged) {
      console.error("ADMIN_USER or ADMIN_PASSWORD not configured");
      configurationErrorLogged = true;
    }
    return new Response("ADMIN_USER or ADMIN_PASSWORD not configured", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const credentials = decodeBasicCredentials(request.headers.get("Authorization"));
  if (!credentials) return unauthorized();

  const userMatches = timingSafeEqual(credentials.username, String(expectedUser));
  const passwordMatches = timingSafeEqual(credentials.password, String(expectedPassword));

  if (!userMatches || !passwordMatches) {
    return unauthorized();
  }

  return next();
}
