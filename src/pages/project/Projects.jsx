import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Projects.module.css";
import { getProjects } from "../../api";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
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
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getProjects(controller.signal)
      .then(setProjects)
      .catch((error) => {
        if (error.name !== "AbortError") setProjectsError(error.message);
      })
      .finally(() => setProjectsLoading(false));
    return () => controller.abort();
  }, []);

  const filteredProjects = useMemo(
    () =>
      activeCategory === "all"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory, projects]
  );

  const counts = useMemo(() => {
    const c = { all: projects.length };
    projects.forEach((p) => {
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, [projects]);

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
  }, [activeCategory, projects]);

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
              <span className={styles.statValue}>{projects.length}</span>
              <span className={styles.statLabel}>Projets</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles.statValue}>{CATEGORIES.length - 1}</span>
              <span className={styles.statLabel}>Catégories</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles.statValue}>
                {new Set(projects.flatMap((p) => p.tech)).size}+
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
        {projectsLoading && <p className={styles.dataState}>Chargement des projets…</p>}
        {!projectsLoading && projectsError && (
          <p className={styles.dataError} role="alert">{projectsError}</p>
        )}
        {!projectsLoading && !projectsError && filteredProjects.length === 0 && (
          <p className={styles.dataState}>Aucun projet dans cette catégorie.</p>
        )}
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