function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    console.error("Binding D1 « DB » manquant pour /api/projects.");
    return jsonResponse(
      { error: "Les données des projets ne sont pas encore configurées." },
      500,
    );
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT
        id,
        title,
        category,
        category_label AS categoryLabel,
        year,
        short_desc AS shortDesc,
        long_desc AS longDesc,
        tech,
        status,
        color,
        icon,
        features
      FROM projects
      WHERE is_published = 1
      ORDER BY sort_order, id`,
    ).all();

    const projects = (results || []).map((row) => ({
      ...row,
      tech: parseList(row.tech),
      features: parseList(row.features),
    }));

    return jsonResponse(projects);
  } catch (error) {
    console.error("Erreur D1 sur /api/projects :", error?.message || "inconnue");
    return jsonResponse(
      { error: "Impossible de charger les projets. Veuillez réessayer." },
      500,
    );
  }
}
