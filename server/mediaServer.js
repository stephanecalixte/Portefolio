import "dotenv/config";
import express from "express";
import { readdir, mkdir, lstat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.MEDIA_PORT || 3001);
const mediaRoot = path.resolve(
  process.env.MEDIA_DIR || fileURLToPath(new URL("../media", import.meta.url)),
);

const allowedTypes = new Map([
  [".avif", { kind: "image", contentType: "image/avif" }],
  [".gif", { kind: "image", contentType: "image/gif" }],
  [".jpeg", { kind: "image", contentType: "image/jpeg" }],
  [".jpg", { kind: "image", contentType: "image/jpeg" }],
  [".png", { kind: "image", contentType: "image/png" }],
  [".webp", { kind: "image", contentType: "image/webp" }],
  [".m4v", { kind: "video", contentType: "video/x-m4v" }],
  [".mov", { kind: "video", contentType: "video/quicktime" }],
  [".mp4", { kind: "video", contentType: "video/mp4" }],
  [".ogv", { kind: "video", contentType: "video/ogg" }],
  [".webm", { kind: "video", contentType: "video/webm" }],
]);

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

async function collectMedia(directory = mediaRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMedia(absolutePath)));
      continue;
    }

    if (!entry.isFile()) continue;
    const type = allowedTypes.get(path.extname(entry.name).toLowerCase());
    if (!type) continue;

    const relativePath = path.relative(mediaRoot, absolutePath).split(path.sep).join("/");
    const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
    const { size } = await lstat(absolutePath);
    files.push({
      name: entry.name,
      path: relativePath,
      kind: type.kind,
      contentType: type.contentType,
      size,
      url: `/media/files/${encodedPath}`,
    });
  }

  return files;
}

app.get("/media/catalog", async (_req, res, next) => {
  try {
    const files = await collectMedia();
    files.sort((left, right) => left.path.localeCompare(right.path));
    res.setHeader("Cache-Control", "no-store");
    res.json({
      images: files.filter((file) => file.kind === "image"),
      videos: files.filter((file) => file.kind === "video"),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/media/files/*mediaPath", async (req, res, next) => {
  try {
    const segments = Array.isArray(req.params.mediaPath)
      ? req.params.mediaPath
      : [req.params.mediaPath];
    if (
      segments.length === 0 ||
      segments.some(
        (segment) =>
          !segment ||
          segment.startsWith(".") ||
          segment.includes("/") ||
          segment.includes("\\"),
      )
    ) {
      return res.status(404).json({ error: "Média introuvable." });
    }

    const type = allowedTypes.get(path.extname(segments.at(-1)).toLowerCase());
    if (!type) return res.status(404).json({ error: "Format média non autorisé." });

    let currentPath = mediaRoot;
    for (const segment of segments) {
      currentPath = path.join(currentPath, segment);
      const details = await lstat(currentPath);
      if (details.isSymbolicLink()) return res.status(404).json({ error: "Média introuvable." });
    }

    const details = await lstat(currentPath);
    if (!details.isFile()) return res.status(404).json({ error: "Média introuvable." });

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Content-Type", type.contentType);
    return res.sendFile(currentPath, { acceptRanges: true }, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return res.status(404).json({ error: "Média introuvable." });
    }
    return next(error);
  }
});

app.use((error, _req, res, next) => {
  console.error("Erreur du serveur média :", error.message);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: "Impossible de charger les médias locaux." });
});

await mkdir(mediaRoot, { recursive: true });

const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Serveur média local démarré sur le port ${port} (${mediaRoot}).`);
});

server.on("error", (error) => {
  console.error("Impossible de démarrer le serveur média :", error.message);
  process.exitCode = 1;
});

const shutdown = () => {
  server.close((error) => {
    if (error) {
      console.error("Erreur lors de l’arrêt du serveur média :", error.message);
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
