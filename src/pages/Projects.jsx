import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Projects.module.css";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const PROJECTS = [
  {
    id: 1,
    title: "Data Center Simulator",
    category: "web",
    categoryLabel: "Web / 3D",
    year: "2025",
    shortDesc: "Simulateur interactif de data center en 3D avec racks animés, LEDs clignotantes et contrôle du refroidissement.",
    longDesc: "Une application web immersive qui recrée un data center complet. Les racks sont rendus en 3D via CSS, avec 4 rangées de serveurs empilés, des LEDs qui s'allument en séquence et un ventilateur contrôlable en temps réel (variateur de vitesse). Le tout dans une interface pensée pour être à la fois pédagogique et esthétique.",
    tech: ["React", "GSAP", "CSS 3D", "Vite"],
    status: "Terminé",
    color: "#4da6ff",
    icon: "🏢",
    features: [
      "4 rangées de racks en profondeur",
      "Séquence d'allumage des LEDs",
      "Ventilateur avec variateur fonctionnel",
      "Scroll-driven animations GSAP",
    ],
  },
  {
    id: 2,
    title: "Portfolio Cinematique",
    category: "web",
    categoryLabel: "Web / Animation",
    year: "2025",
    shortDesc: "Portfolio interactif avec 40 animations Awwwards enchaînées, effets 3D et scroll narratif.",
    longDesc: "Un portfolio qui met en scène le parcours professionnel via un système de scroll narratif : une scène SVG montre l'installation d'un routeur Cisco, le branchement d'un switch Mellanox et la configuration automatique des équipements, entrecoupée de 40 animations typographiques aléatoires.",
    tech: ["React", "GSAP", "ScrollTrigger", "CSS Modules"],
    status: "En cours",
    color: "#7fd0ff",
    icon: "🎬",
    features: [
      "40 animations typographiques",
      "ScrollTrigger pin de 300vh",
      "Terminal PowerShell animé",
      "Effets cinéma (Vertigo, Bullet Time)",
    ],
  },
  {
    id: 3,
    title: "RouterSisco N540",
    category: "network",
    categoryLabel: "Réseau",
    year: "2025",
    shortDesc: "Reproduction fidèle du routeur Cisco N540-24Z8Q2C-SYS en HTML/CSS pur, avec ports et LEDs.",
    longDesc: "Composant React 100% CSS qui reproduit le faceplate du routeur Cisco N540 : 24 ports Multi-Gig, 8 ports 100GE QSFP28, ports console, USB et LEDs. Aucune image, tout est généré via des dégradés et des pseudo-éléments.",
    tech: ["React", "CSS pur", "SVG"],
    status: "Terminé",
    color: "#1a73e8",
    icon: "🔷",
    features: [
      "24 ports Multi-Gig",
      "8 ports QSFP28",
      "LEDs d'état dynamiques",
      "Responsive mobile",
    ],
  },
  {
    id: 4,
    title: "Mellanox MCS7520",
    category: "network",
    categoryLabel: "Réseau",
    year: "2025",
    shortDesc: "Switch director InfiniBand 12U avec 216 ports QSFP28 rendus entièrement en CSS.",
    longDesc: "Reproduction du châssis Mellanox MCS7520 avec ses 6 modules Leaf et 216 ports QSFP28 EDR. Design NVIDIA (vert), animation des LEDs et intégration dans un SVG de scène réseau.",
    tech: ["React", "SVG", "CSS"],
    status: "Terminé",
    color: "#76b900",
    icon: "🟢",
    features: [
      "216 ports QSFP28",
      "6 modules Leaf",
      "Branding NVIDIA",
      "Intégré en foreignObject",
    ],
  },
  {
    id: 5,
    title: "Pipeline CI/CD Kubernetes",
    category: "devops",
    categoryLabel: "DevOps",
    year: "2024",
    shortDesc: "Pipeline automatisé GitLab CI → Docker → Kubernetes avec monitoring Prometheus.",
    longDesc: "Mise en place d'une chaîne CI/CD complète : build Docker multi-stage, tests automatiques, push vers registry, déploiement Helm sur un cluster Kubernetes avec rollback automatique et monitoring Prometheus/Grafana.",
    tech: ["GitLab CI", "Docker", "Kubernetes", "Helm", "Prometheus"],
    status: "Terminé",
    color: "#ff9500",
    icon: "⚙️",
    features: [
      "Build multi-stage",
      "Tests automatisés",
      "Déploiement Helm",
      "Monitoring temps réel",
    ],
  },
  {
    id: 6,
    title: "FortiGate 121G UI",
    category: "network",
    categoryLabel: "Réseau",
    year: "2025",
    shortDesc: "Interface de pare-feu FortiGate 121G reproduite avec ses 16 ports GE RJ45 et 8 SFP.",
    longDesc: "Reproduction du pare-feu FortiGate 121G avec 16 ports GE RJ45, 8 ports GE SFP, 4 ports 10GE SFP+ FortiLink, bloc management (MGMT / HA / Console / USB) et LEDs d'état. Composant utilisé dans la scène cinématique du portfolio.",
    tech: ["React", "CSS Modules", "forwardRef"],
    status: "Terminé",
    color: "#e60012",
    icon: "🛡️",
    features: [
      "16 ports RJ45",
      "8 ports SFP",
      "4 ports FortiLink",
      "Mode compact",
    ],
  },
  {
    id: 7,
    title: "API REST Sécurisée",
    category: "web",
    categoryLabel: "Web / Backend",
    year: "2024",
    shortDesc: "API Node.js avec authentification JWT, rôles, rate limiting et documentation Swagger.",
    longDesc: "API REST complète en Node.js / Express avec authentification JWT, gestion des rôles (admin / user), rate limiting par IP, validation des entrées (Zod), tests unitaires (Jest) et documentation Swagger auto-générée.",
    tech: ["Node.js", "Express", "JWT", "MongoDB", "Swagger"],
    status: "Terminé",
    color: "#00ff88",
    icon: "🔐",
    features: [
      "Auth JWT",
      "Rôles et permissions",
      "Rate limiting",
      "Doc Swagger",
    ],
  },
  {
    id: 8,
    title: "Ingénierie Sonore Live",
    category: "audio",
    categoryLabel: "Audio",
    year: "2023",
    shortDesc: "Setup de production musicale live avec Ableton et interface audio multi-canal.",
    longDesc: "Conception et exploitation d'un setup audio live : interface RME Fireface, Ableton Live, séquenceur hardware et système de retours in-ear. Utilisé pour plusieurs concerts et sessions studio.",
    tech: ["Ableton Live", "RME", "MIDI", "Mixage"],
    status: "Terminé",
    color: "#ff6b9d",
    icon: "🎵",
    features: [
      "16 canaux simultanés",
      "Retours IEM",
      "Séquenceur MIDI",
      "Mixage live",
    ],
  },
];

const CATEGORIES = [
  { key: "all", label: "Tous", icon: "◈" },
  { key: "web", label: "Web", icon: "◉" },
  { key: "network", label: "Réseau", icon: "◈" },
  { key: "devops", label: "DevOps", icon: "◉" },
  { key: "audio", label: "Audio", icon: "◈" },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════
export default function Projects() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = useMemo(
    () =>
      activeCategory === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const counts = useMemo(() => {
    const c = { all: PROJECTS.length };
    PROJECTS.forEach((p) => {
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, []);

  // Animation hero
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      const title = hero.querySelector(`.${styles["hero-title"]}`);
      const subtitle = hero.querySelector(`.${styles["hero-subtitle"]}`);
      const stats = hero.querySelectorAll(`.${styles["stat-item"]}`);

      if (title) {
        gsap.fromTo(
          title,
          { y: 80, opacity: 0, skewY: 5 },
          { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: "power4.out", delay: 0.2 }
        );
      }
      if (subtitle) {
        gsap.fromTo(
          subtitle,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
        );
      }
      if (stats.length) {
        gsap.fromTo(
          stats,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.8,
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Animation grid
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(`.${styles["project-card"]}`);
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { y: 40, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      }
    );
  }, [activeCategory]);

  // Lock scroll modal
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  // Escape modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.gridBg} />
        <div className={styles.glow} />

        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <span className={styles.tagDot} />
            <span>PORTFOLIO · 2023 — 2025</span>
          </div>

          <h1 className={styles["hero-title"]}>
            MES <span>PROJETS</span>
          </h1>

          <p className={styles["hero-subtitle"]}>
            Une sélection de projets mêlant infrastructure réseau, développement web,
            DevOps et ingénierie sonore. Chaque projet est une exploration technique
            et esthétique.
          </p>

          <div className={styles.heroStats}>
            <div className={styles["stat-item"]}>
              <span className={styles.statValue}>{PROJECTS.length}</span>
              <span className={styles.statLabel}>Projets</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles.statValue}>{CATEGORIES.length - 1}</span>
              <span className={styles.statLabel}>Catégories</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles.statValue}>
                {new Set(PROJECTS.flatMap((p) => p.tech)).size}+
              </span>
              <span className={styles.statLabel}>Technologies</span>
            </div>
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span>Découvrir</span>
          <div className={styles.arrowDown} />
        </div>
      </section>

      {/* FILTRES */}
      <div className={styles.filterBar}>
        <div className={styles.filterInner}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`${styles.filterBtn} ${
                activeCategory === cat.key ? styles.filterBtnActive : ""
              }`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className={styles.filterIcon}>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={styles.filterCount}>{counts[cat.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GRILLE */}
      <section ref={gridRef} className={styles.grid}>
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className={styles["project-card"]}
            style={{ "--accent": project.color }}
            onClick={() => setSelectedProject(project)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedProject(project);
              }
            }}
          >
            <div className={styles.cardGlow} />

            <header className={styles.cardHeader}>
              <div className={styles.cardIcon}>{project.icon}</div>
              <div className={styles.cardMeta}>
                <span className={styles.cardCategory}>{project.categoryLabel}</span>
                <span className={styles.cardYear}>{project.year}</span>
              </div>
              <span
                className={styles.cardStatus}
                data-status={project.status.toLowerCase().replace(/\s/g, "-")}
              >
                {project.status}
              </span>
            </header>

            <h2 className={styles.cardTitle}>{project.title}</h2>
            <p className={styles.cardDesc}>{project.shortDesc}</p>

            <ul className={styles.cardTech}>
              {project.tech.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <footer className={styles.cardFooter}>
              <span className={styles.cardMore}>
                Voir les détails
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </footer>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Un projet en tête ?</h2>
        <p>Discutons de votre infrastructure, de votre site web ou de votre pipeline DevOps.</p>
        <Link to="/#contact" className={styles.ctaBtn}>
          Me contacter
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>

      {/* MODAL */}
      {selectedProject && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={styles.modal}
            style={{ "--accent": selectedProject.color }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedProject(null)}
              aria-label="Fermer"
            >
              ×
            </button>

            <header className={styles.modalHeader}>
              <div className={styles.modalIcon}>{selectedProject.icon}</div>
              <div>
                <span className={styles.modalCategory}>
                  {selectedProject.categoryLabel} · {selectedProject.year}
                </span>
                <h2 className={styles.modalTitle}>{selectedProject.title}</h2>
              </div>
            </header>

            <div className={styles.modalBody}>
              <p className={styles.modalDesc}>{selectedProject.longDesc}</p>

              <h3 className={styles.modalSectionTitle}>Fonctionnalités</h3>
              <ul className={styles.modalFeatures}>
                {selectedProject.features.map((f) => (
                  <li key={f}>
                    <span className={styles.featureDot} />
                    {f}
                  </li>
                ))}
              </ul>

              <h3 className={styles.modalSectionTitle}>Technologies</h3>
              <div className={styles.modalTech}>
                {selectedProject.tech.map((t) => (
                  <span key={t} className={styles.modalTechTag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}