const configuredMediaUrl = import.meta.env.VITE_MEDIA_SERVER_URL?.trim().replace(/\/+$/, "");

async function fetchCatalog(endpoint, signal) {
  const response = await fetch(endpoint, { signal });
  const catalog = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(catalog?.error || "Impossible de charger le catalogue média.");
  }
  if (!catalog || !Array.isArray(catalog.images) || !Array.isArray(catalog.videos)) {
    throw new Error("Le catalogue média est invalide.");
  }

  return catalog;
}

export async function getMediaCatalog(signal) {
  const base = configuredMediaUrl || "";
  let catalog;

  try {
    catalog = await fetchCatalog(`${base}/media/catalog`, signal);
  } catch (error) {
    if (error.name === "AbortError") throw error;

    // En production statique (Cloudflare Pages), le catalogue est généré au build
    // dans public/media/catalog.json : le serveur média Express n'existe pas.
    try {
      catalog = await fetchCatalog(`${base}/media/catalog.json`, signal);
    } catch (fallbackError) {
      if (fallbackError.name === "AbortError") throw fallbackError;
      throw new Error(
        import.meta.env.DEV
          ? "Serveur média indisponible. Lancez `npm run dev:media`."
          : "Impossible de charger les médias. Veuillez réessayer.",
        { cause: fallbackError },
      );
    }
  }

  const mediaOrigin = configuredMediaUrl || window.location.origin;
  return {
    images: catalog.images.map((item) => ({
      ...item,
      url: new URL(item.url, mediaOrigin).href,
    })),
    videos: catalog.videos.map((item) => ({
      ...item,
      url: new URL(item.url, mediaOrigin).href,
    })),
  };
}
