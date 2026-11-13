function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    console.error("Binding D1 « DB » manquant pour /api/skills.");
    return jsonResponse(
      { error: "Les données des compétences ne sont pas encore configurées." },
      500,
    );
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT
        c.slug AS categorySlug,
        c.name AS category,
        c.icon,
        c.color,
        s.name AS skill,
        s.level
      FROM skill_categories c
      LEFT JOIN skills s ON s.category_slug = c.slug
      ORDER BY c.sort_order, s.sort_order`,
    ).all();

    const categories = new Map();
    for (const row of results || []) {
      if (!categories.has(row.categorySlug)) {
        categories.set(row.categorySlug, {
          category: row.category,
          icon: row.icon,
          color: row.color,
          items: [],
        });
      }

      if (row.skill) {
        categories.get(row.categorySlug).items.push({
          name: row.skill,
          level: row.level,
        });
      }
    }

    return jsonResponse([...categories.values()]);
  } catch (error) {
    console.error("Erreur D1 sur /api/skills :", error?.message || "inconnue");
    return jsonResponse(
      { error: "Impossible de charger les compétences. Veuillez réessayer." },
      500,
    );
  }
}
