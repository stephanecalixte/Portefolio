const LIMITS = Object.freeze({
  name: 120,
  email: 254,
  subject: 200,
  message: 10000,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

const INVALID_FORM_MESSAGE =
  "Le formulaire envoyé n’est pas valide. Veuillez réessayer.";
const SEND_ERROR_MESSAGE =
  "L’envoi du message a échoué. Veuillez réessayer dans quelques instants.";
const SUCCESS_MESSAGE = "Votre message a bien été envoyé.";

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

function allowedOrigins(env) {
  const origins = [...DEV_ORIGINS];
  if (env.ALLOWED_ORIGIN) {
    for (const value of String(env.ALLOWED_ORIGIN).split(",")) {
      const origin = value.trim().replace(/\/+$/, "");
      if (origin && !origins.includes(origin)) origins.push(origin);
    }
  }
  return origins;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || !allowedOrigins(env).includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function hasInvalidControlCharacters(value, allowLineBreaks = false) {
  return [...value].some((character) => {
    const code = character.codePointAt(0);
    if (code === 127 || code < 9 || (code > 13 && code < 32)) return true;
    return !allowLineBreaks && (code === 9 || code === 10 || code === 13);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function readPayload(request) {
  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }

  return null;
}

function validate(payload) {
  const data = {
    name: asText(payload.name),
    email: asText(payload.email),
    subject: asText(payload.subject),
    message: asText(payload.message),
  };

  if (!data.name) {
    return { error: "Veuillez saisir votre nom." };
  }
  if (data.name.length > LIMITS.name || hasInvalidControlCharacters(data.name)) {
    return {
      error: `Le nom est limité à ${LIMITS.name} caractères et ne doit pas contenir de caractères invalides.`,
    };
  }
  if (
    !data.email ||
    data.email.length > LIMITS.email ||
    !EMAIL_PATTERN.test(data.email)
  ) {
    return {
      error: `Veuillez saisir une adresse e-mail valide de ${LIMITS.email} caractères maximum.`,
    };
  }
  if (
    data.subject.length > LIMITS.subject ||
    hasInvalidControlCharacters(data.subject)
  ) {
    return {
      error: `Le sujet est limité à ${LIMITS.subject} caractères et ne doit pas contenir de caractères invalides.`,
    };
  }
  if (!data.message) {
    return { error: "Veuillez écrire votre message." };
  }
  if (
    data.message.length > LIMITS.message ||
    hasInvalidControlCharacters(data.message, true)
  ) {
    return {
      error: `Le message est limité à ${LIMITS.message} caractères et ne doit pas contenir de caractères invalides.`,
    };
  }

  return { data };
}

function buildEmail(data) {
  const subject = data.subject
    ? `${data.subject} — message de ${data.name}`
    : `Nouveau message de ${data.name}`;

  const text = [
    "Nouveau message depuis le portfolio",
    "",
    `Nom : ${data.name}`,
    `E-mail : ${data.email}`,
    data.subject ? `Sujet : ${data.subject}` : null,
    "",
    data.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#1c2530;">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #dde3ea;border-radius:8px;background:#ffffff;">
      <p style="margin:0 0 16px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6b7c8f;">Portfolio — formulaire de contact</p>
      <h1 style="margin:0 0 20px;font-size:20px;">Nouveau message</h1>
      <p style="margin:0 0 8px;"><strong>Nom :</strong> ${escapeHtml(data.name)}</p>
      <p style="margin:0 0 8px;"><strong>E-mail :</strong> ${escapeHtml(data.email)}</p>
      ${
        data.subject
          ? `<p style="margin:0 0 8px;"><strong>Sujet :</strong> ${escapeHtml(data.subject)}</p>`
          : ""
      }
      <hr style="margin:20px 0;border:0;border-top:1px solid #dde3ea;">
      <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(data.message)}</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

export async function onRequestOptions({ request, env }) {
  const headers = corsHeaders(request, env);
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestPost({ request, env }) {
  const headers = corsHeaders(request, env);

  let payload;
  try {
    payload = await readPayload(request);
  } catch {
    return jsonResponse({ error: INVALID_FORM_MESSAGE }, 400, headers);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ error: INVALID_FORM_MESSAGE }, 400, headers);
  }

  // Honeypot : un humain ne remplit jamais ce champ. On simule un succès
  // pour ne pas indiquer au bot que sa soumission a été rejetée.
  if (asText(payload._honey)) {
    return jsonResponse({ ok: true, message: SUCCESS_MESSAGE }, 200, headers);
  }

  const { data, error } = validate(payload);
  if (error) {
    return jsonResponse({ error }, 400, headers);
  }

  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Configuration Resend manquante : RESEND_API_KEY, RESEND_FROM_EMAIL ou CONTACT_TO_EMAIL.");
    return jsonResponse(
      {
        error:
          "Le formulaire de contact n’est pas encore configuré. Veuillez réessayer plus tard.",
      },
      500,
      headers,
    );
  }

  const recipients = String(to)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  const email = buildEmail(data);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: data.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    if (!response.ok) {
      console.error("Resend a refusé la requête avec le statut", response.status);
      return jsonResponse({ error: SEND_ERROR_MESSAGE }, 502, headers);
    }

    // Persiste le message en D1 pour l'admin (non bloquant)
    try {
      const cleanName = String(data.name).slice(0, 200);
      const cleanEmail = String(data.email).slice(0, 320);
      const cleanSubject = String(data.subject || "").slice(0, 200);
      const cleanMessage = String(data.message).slice(0, 5000);
      await env.DB.prepare(
        "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      )
        .bind(cleanName, cleanEmail, cleanSubject, cleanMessage)
        .run();
    } catch (dbError) {
      console.error("D1 insert failed:", dbError?.message || "erreur inconnue");
    }

    return jsonResponse({ ok: true, message: SUCCESS_MESSAGE }, 200, headers);
  } catch (error) {
    console.error("Échec de l’appel à Resend :", error?.name || "erreur inconnue");
    return jsonResponse({ error: SEND_ERROR_MESSAGE }, 502, headers);
  }
}
