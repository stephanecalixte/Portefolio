const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

async function requestUrl(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Impossible de joindre le serveur. Vérifiez qu’il est démarré.", {
      cause: error,
    });
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error || "La requête a échoué. Veuillez réessayer.");
  }

  return result;
}

function request(path, options = {}) {
  return requestUrl(`/api${path}`, options);
}

export function getSkills(signal) {
  return request("/skills", { signal });
}

export function getProjects(signal) {
  return request("/projects", { signal });
}

export function sendContactMessage(data) {
  return requestUrl(CONTACT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
