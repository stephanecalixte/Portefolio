CREATE TABLE IF NOT EXISTS skill_categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (category_slug, name),
  FOREIGN KEY (category_slug) REFERENCES skill_categories (slug)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  year INTEGER NOT NULL,
  short_desc TEXT NOT NULL,
  long_desc TEXT NOT NULL,
  tech TEXT NOT NULL,
  status TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  features TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);
