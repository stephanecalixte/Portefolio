async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
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

export function getSkills(signal) {
  return request("/skills", { signal });
}

export function getProjects(signal) {
  return request("/projects", { signal });
}

export function sendContactMessage(data) {
  return request("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
