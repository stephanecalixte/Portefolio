CREATE TABLE IF NOT EXISTS skill_categories (
  slug VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(16) NOT NULL,
  color CHAR(7) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_slug VARCHAR(64) NOT NULL,
  name VARCHAR(180) NOT NULL,
  level TINYINT UNSIGNED NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_skills_category_name (category_slug, name),
  CONSTRAINT fk_skills_category
    FOREIGN KEY (category_slug) REFERENCES skill_categories (slug)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_skills_level CHECK (level <= 100)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(64) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  short_desc VARCHAR(500) NOT NULL,
  long_desc TEXT NOT NULL,
  tech JSON NOT NULL,
  status VARCHAR(40) NOT NULL,
  color CHAR(7) NOT NULL,
  icon VARCHAR(16) NOT NULL,
  features JSON NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_messages_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO skill_categories (slug, name, icon, color, sort_order) VALUES
  ('reseau', 'Réseau', '◈', '#4da6ff', 1),
  ('web-dev', 'Web / Dev', '◉', '#7fd0ff', 2),
  ('devops', 'DevOps', '◈', '#ff9500', 3),
  ('securite', 'Sécurité', '◉', '#00ff88', 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), icon = VALUES(icon), color = VALUES(color), sort_order = VALUES(sort_order);

INSERT INTO skills (category_slug, name, level, sort_order) VALUES
  ('reseau', 'Cisco IOS / IOS XR', 90, 1),
  ('reseau', 'Configuration switch / routeur', 95, 2),
  ('reseau', 'VLAN, STP, OSPF, BGP', 85, 3),
  ('reseau', 'Firewall FortiGate', 80, 4),
  ('reseau', 'Mellanox / NVIDIA Networking', 75, 5),
  ('web-dev', 'React / Next.js', 90, 1),
  ('web-dev', 'JavaScript / TypeScript', 85, 2),
  ('web-dev', 'HTML / CSS avancé', 95, 3),
  ('web-dev', 'Node.js / Express', 80, 4),
  ('web-dev', 'GSAP / Animations', 85, 5),
  ('devops', 'Docker / Kubernetes', 80, 1),
  ('devops', 'GitLab CI / GitHub Actions', 85, 2),
  ('devops', 'Linux / Bash', 90, 3),
  ('devops', 'Monitoring (Prometheus, Grafana)', 75, 4),
  ('devops', 'Git / Versioning', 95, 5),
  ('securite', 'Audit / Pentest réseaux', 75, 1),
  ('securite', 'Cryptographie / VPN', 80, 2),
  ('securite', 'SSH / Certificats', 85, 3),
  ('securite', 'Politique de sécurité', 80, 4)
ON DUPLICATE KEY UPDATE level = VALUES(level), sort_order = VALUES(sort_order);

INSERT INTO projects (
  id, title, category, category_label, year, short_desc, long_desc,
  tech, status, color, icon, features, sort_order, is_published
) VALUES
  (1, 'Data Center Simulator', 'web', 'Web / 3D', 2025,
   'Simulateur interactif de data center en 3D avec racks animés, LEDs clignotantes et contrôle du refroidissement.',
   'Une application web immersive qui recrée un data center complet. Les racks sont rendus en 3D via CSS, avec 4 rangées de serveurs empilés, des LEDs qui s''allument en séquence et un ventilateur contrôlable en temps réel (variateur de vitesse). Le tout dans une interface pensée pour être à la fois pédagogique et esthétique.',
   JSON_ARRAY('React', 'GSAP', 'CSS 3D', 'Vite'), 'Terminé', '#4da6ff', '🏢',
   JSON_ARRAY('4 rangées de racks en profondeur', 'Séquence d''allumage des LEDs', 'Ventilateur avec variateur fonctionnel', 'Scroll-driven animations GSAP'), 1, TRUE),
  (2, 'Portfolio Cinematique', 'web', 'Web / Animation', 2025,
   'Portfolio interactif avec 40 animations Awwwards enchaînées, effets 3D et scroll narratif.',
   'Un portfolio qui met en scène le parcours professionnel via un système de scroll narratif : une scène SVG montre l''installation d''un routeur Cisco, le branchement d''un switch Mellanox et la configuration automatique des équipements, entrecoupée de 40 animations typographiques aléatoires.',
   JSON_ARRAY('React', 'GSAP', 'ScrollTrigger', 'CSS Modules'), 'En cours', '#7fd0ff', '🎬',
   JSON_ARRAY('40 animations typographiques', 'ScrollTrigger pin de 300vh', 'Terminal PowerShell animé', 'Effets cinéma (Vertigo, Bullet Time)'), 2, TRUE),
  (3, 'RouterSisco N540', 'network', 'Réseau', 2025,
   'Reproduction fidèle du routeur Cisco N540-24Z8Q2C-SYS en HTML/CSS pur, avec ports et LEDs.',
   'Composant React 100% CSS qui reproduit le faceplate du routeur Cisco N540 : 24 ports Multi-Gig, 8 ports 100GE QSFP28, ports console, USB et LEDs. Aucune image, tout est généré via des dégradés et des pseudo-éléments.',
   JSON_ARRAY('React', 'CSS pur', 'SVG'), 'Terminé', '#1a73e8', '🔷',
   JSON_ARRAY('24 ports Multi-Gig', '8 ports QSFP28', 'LEDs d''état dynamiques', 'Responsive mobile'), 3, TRUE),
  (4, 'Mellanox MCS7520', 'network', 'Réseau', 2025,
   'Switch director InfiniBand 12U avec 216 ports QSFP28 rendus entièrement en CSS.',
   'Reproduction du châssis Mellanox MCS7520 avec ses 6 modules Leaf et 216 ports QSFP28 EDR. Design NVIDIA (vert), animation des LEDs et intégration dans un SVG de scène réseau.',
   JSON_ARRAY('React', 'SVG', 'CSS'), 'Terminé', '#76b900', '🟢',
   JSON_ARRAY('216 ports QSFP28', '6 modules Leaf', 'Branding NVIDIA', 'Intégré en foreignObject'), 4, TRUE),
  (5, 'Pipeline CI/CD Kubernetes', 'devops', 'DevOps', 2024,
   'Pipeline automatisé GitLab CI → Docker → Kubernetes avec monitoring Prometheus.',
   'Mise en place d''une chaîne CI/CD complète : build Docker multi-stage, tests automatiques, push vers registry, déploiement Helm sur un cluster Kubernetes avec rollback automatique et monitoring Prometheus/Grafana.',
   JSON_ARRAY('GitLab CI', 'Docker', 'Kubernetes', 'Helm', 'Prometheus'), 'Terminé', '#ff9500', '⚙️',
   JSON_ARRAY('Build multi-stage', 'Tests automatisés', 'Déploiement Helm', 'Monitoring temps réel'), 5, TRUE),
  (6, 'FortiGate 121G UI', 'network', 'Réseau', 2025,
   'Interface de pare-feu FortiGate 121G reproduite avec ses 16 ports GE RJ45 et 8 SFP.',
   'Reproduction du pare-feu FortiGate 121G avec 16 ports GE RJ45, 8 ports GE SFP, 4 ports 10GE SFP+ FortiLink, bloc management (MGMT / HA / Console / USB) et LEDs d''état. Composant utilisé dans la scène cinématique du portfolio.',
   JSON_ARRAY('React', 'CSS Modules', 'forwardRef'), 'Terminé', '#e60012', '🛡️',
   JSON_ARRAY('16 ports RJ45', '8 ports SFP', '4 ports FortiLink', 'Mode compact'), 6, TRUE),
  (7, 'API REST Sécurisée', 'web', 'Web / Backend', 2024,
   'API Node.js avec authentification JWT, rôles, rate limiting et documentation Swagger.',
   'API REST complète en Node.js / Express avec authentification JWT, gestion des rôles (admin / user), rate limiting par IP, validation des entrées (Zod), tests unitaires (Jest) et documentation Swagger auto-générée.',
   JSON_ARRAY('Node.js', 'Express', 'JWT', 'MongoDB', 'Swagger'), 'Terminé', '#00ff88', '🔐',
   JSON_ARRAY('Auth JWT', 'Rôles et permissions', 'Rate limiting', 'Doc Swagger'), 7, TRUE),
  (8, 'Ingénierie Sonore Live', 'audio', 'Audio', 2023,
   'Setup de production musicale live avec Ableton et interface audio multi-canal.',
   'Conception et exploitation d''un setup audio live : interface RME Fireface, Ableton Live, séquenceur hardware et système de retours in-ear. Utilisé pour plusieurs concerts et sessions studio.',
   JSON_ARRAY('Ableton Live', 'RME', 'MIDI', 'Mixage'), 'Terminé', '#ff6b9d', '🎵',
   JSON_ARRAY('16 canaux simultanés', 'Retours IEM', 'Séquenceur MIDI', 'Mixage live'), 8, TRUE)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  category = VALUES(category),
  category_label = VALUES(category_label),
  year = VALUES(year),
  short_desc = VALUES(short_desc),
  long_desc = VALUES(long_desc),
  tech = VALUES(tech),
  status = VALUES(status),
  color = VALUES(color),
  icon = VALUES(icon),
  features = VALUES(features),
  sort_order = VALUES(sort_order),
  is_published = VALUES(is_published);
