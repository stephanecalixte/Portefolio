import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "media");
const outputRoot = path.join(projectRoot, "public", "media");
const filesRoot = path.join(outputRoot, "files");
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_TYPES = new Map([
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

async function collect(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(absolutePath)));
      continue;
    }
    if (!entry.isFile()) continue;

    const type = ALLOWED_TYPES.get(path.extname(entry.name).toLowerCase());
    if (!type) continue;

    const relativePath = path.relative(sourceRoot, absolutePath).split(path.sep).join("/");
    const { size } = await stat(absolutePath);
    if (size > MAX_FILE_SIZE) {
      console.warn(
        `⚠️  ${relativePath} pèse ${(size / 1024 / 1024).toFixed(1)} Mo : au-delà de la limite de 25 Mo par fichier de Cloudflare Pages.`,
      );
    }

    files.push({
      absolutePath,
      relativePath,
      name: entry.name,
      kind: type.kind,
      contentType: type.contentType,
      size,
    });
  }

  return files;
}

const files = await collect(sourceRoot);
files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));

// Dossier généré : il est recréé à chaque build et ignoré par Git.
await rm(outputRoot, { recursive: true, force: true });
await mkdir(filesRoot, { recursive: true });

for (const file of files) {
  const destination = path.join(filesRoot, ...file.relativePath.split("/"));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(file.absolutePath, destination);
}

const toCatalogEntry = (file) => ({
  name: file.name,
  path: file.relativePath,
  kind: file.kind,
  contentType: file.contentType,
  size: file.size,
  url: `/media/files/${file.relativePath.split("/").map(encodeURIComponent).join("/")}`,
});

const catalog = {
  images: files.filter((file) => file.kind === "image").map(toCatalogEntry),
  videos: files.filter((file) => file.kind === "video").map(toCatalogEntry),
};

await writeFile(
  path.join(outputRoot, "catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
  "utf8",
);

console.log(
  `Médias copiés dans public/media : ${catalog.images.length} image(s), ${catalog.videos.length} vidéo(s).`,
);
