const configuredMediaUrl = import.meta.env.VITE_MEDIA_SERVER_URL?.trim().replace(/\/+$/, "");

export async function getMediaCatalog(signal) {
  const endpoint = `${configuredMediaUrl || ""}/media/catalog`;
  let response;

  try {
    response = await fetch(endpoint, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Serveur média indisponible. Lancez `npm run dev:media`.", {
      cause: error,
    });
  }

  const catalog = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(catalog?.error || "Impossible de charger le catalogue média.");
  }
  if (!catalog || !Array.isArray(catalog.images) || !Array.isArray(catalog.videos)) {
    throw new Error("Le serveur média a renvoyé un catalogue invalide.");
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
