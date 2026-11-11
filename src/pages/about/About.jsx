import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./About.module.css";
import { getSkills } from "../../api";
import EXPERIENCES from "../../data/experiences";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const VALUES = [
  {
    icon: "◈",
    title: "Précision technique",
    desc: "Chaque fonctionnalité et chaque ligne de code sont testées et documentées.",
  },
  {
    icon: "◉",
    title: "Esthétique fonctionnelle",
    desc: "Une interface doit être belle ET efficace. Le design n'est pas décoratif, il sert l'utilisateur.",
  },
  {
    icon: "◈",
    title: "Sécurité par défaut",
    desc: "La sécurité est intégrée dès la conception, jamais ajoutée au dernier moment.",
  },
  {
    icon: "◉",
    title: "Apprentissage continu",
    desc: "Nouvelles technologies et nouvelles pratiques : je reste en veille permanente.",
  },
];

const PROCESS_PHASES = [
  {
    number: "01",
    title: "Comprendre & concevoir",
    description:
      "Échanger avec le client, analyser les besoins et poser les bases d’une solution adaptée.",
    steps: [
      "Recueillir le besoin et les contraintes",
      "Décrire les parcours et fonctionnalités",
      "Maquetter des interfaces accessibles",
      "Définir une architecture logicielle sécurisée",
      "Modéliser les données",
    ],
    accent: "#7fd0ff",
  },
  {
    number: "02",
    title: "Développer & sécuriser",
    description:
      "Construire l’application par couches, de l’interface aux traitements et aux données.",
    steps: [
      "Préparer les outils de développement",
      "Développer les interfaces utilisateur",
      "Implémenter les composants métier",
      "Créer les accès SQL et NoSQL",
    ],
    accent: "#a78bfa",
  },
  {
    number: "03",
    title: "Tester & améliorer",
    description:
      "Vérifier le résultat, documenter le travail et améliorer l’application en continu.",
    steps: [
      "Préparer et exécuter les tests",
      "Vérifier l’accessibilité et la sécurité",
      "Documenter les choix et les résultats",
      "Corriger les anomalies et faire de la veille",
    ],
    accent: "#00ff88",
  },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════
export default function About() {
  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const bioRef = useRef(null);
  const skillsRef = useRef(null);
  const timelineRef = useRef(null);
  const valuesRef = useRef(null);
  const processRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    getSkills(controller.signal)
      .then((groups) => setSkills(groups.filter((group) => group.category === "Web / Dev")))
      .catch((error) => {
        if (error.name !== "AbortError") setSkillsError(error.message);
      });
    return () => controller.abort();
  }, []);

  // Animation hero
  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = heroRef.current?.querySelector(`.${styles["hero-title"]}`);
      const subtitle = heroRef.current?.querySelector(`.${styles["hero-subtitle"]}`);
      const tag = heroRef.current?.querySelector(`.${styles.heroTag}`);

      if (tag) {
        gsap.fromTo(tag, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 });
      }
      if (title) {
        gsap.fromTo(title, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.3 });
      }
      if (subtitle) {
        gsap.fromTo(subtitle, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 });
      }
    });

    return () => ctx.revert();
  }, []);

  // Reveal éditorial des cartes et des textes au défilement.
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const heroContent = root.querySelector(`.${styles.heroContent}`);
      if (heroContent && heroRef.current) {
        gsap.fromTo(
          heroContent,
          { y: 0, autoAlpha: 1 },
          {
            y: -64,
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      }

      const heroTitle = root.querySelector(`.${styles["hero-title"]}`);
      if (heroTitle && heroRef.current) {
        gsap.fromTo(
          heroTitle,
          { rotateX: 9, transformPerspective: 900, transformOrigin: "50% 50%" },
          {
            rotateX: 0,
            transformPerspective: 900,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      }

      const cardSelector = [
        `.${styles.statItem}`,
        `.${styles.bioAvatar}`,
        `.${styles.bioMetaItem}`,
        `.${styles.processCard}`,
        `.${styles.skillCard}`,
        `.${styles.timelineItem}`,
        `.${styles.valueCard}`,
        `.${styles.ctaButtons} > a`,
      ].join(", ");

      root.querySelectorAll(cardSelector).forEach((card, index) => {
        const isProcessCard = card.classList.contains(styles.processCard);
        gsap.fromTo(
          card,
          {
            autoAlpha: 0,
            ...(isProcessCard ? {} : { y: 54, x: index % 2 ? 14 : -14, scale: 0.97 }),
            filter: "blur(7px)",
          },
          {
            autoAlpha: 1,
            ...(isProcessCard ? {} : { y: 0, x: 0, scale: 1 }),
            filter: "blur(0px)",
            duration: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 78%",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      const textSelector = [
        `.${styles.statLabel}`,
        `.${styles.bioLabel}`,
        `.${styles.bioTitle}`,
        `.${styles.bioText}`,
        `.${styles.bioMetaLabel}`,
        `.${styles.bioMetaValue}`,
        `.${styles.processEyebrow}`,
        `.${styles.processTitleText}`,
        `.${styles.processLead}`,
        `.${styles.processNumber}`,
        `.${styles.processCardTitle}`,
        `.${styles.processCardDescription}`,
        `.${styles.processSteps} li`,
        `.${styles.processFooter} > p`,
        `.${styles.processLink}`,
        `.${styles.sectionLabel}`,
        `.${styles.sectionTitle}`,
        `.${styles.skillCategory}`,
        `.${styles.skillItem}`,
        `.${styles.timelineHeader}`,
        `.${styles.timelineTitle}`,
        `.${styles.timelineDesc}`,
        `.${styles.valueIcon}`,
        `.${styles.valueTitle}`,
        `.${styles.valueDesc}`,
        `.${styles.cta} h2`,
        `.${styles.cta} p`,
        "[role='alert']",
      ].join(", ");

      root.querySelectorAll(textSelector).forEach((text, index) => {
        const isHeading =
          text.matches("h1, h2, h3") ||
          text.classList.contains(styles.processTitleText);
        gsap.fromTo(
          text,
          {
            autoAlpha: 0,
            y: 18,
            x: index % 2 ? 5 : -5,
            ...(isHeading ? { rotateX: index % 2 ? 7 : -7, transformPerspective: 900 } : {}),
            filter: "blur(4px)",
          },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            ...(isHeading ? { rotateX: 0, transformPerspective: 900 } : {}),
            filter: "blur(0px)",
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: text,
              start: "top 94%",
              end: "top 72%",
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      const bars = skillsRef.current?.querySelectorAll(`.${styles.skillBar}`);
      bars?.forEach((bar) => {
        const level = parseInt(bar.dataset.level || "0", 10);
        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: `${level}%`,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, [skills, skillsError]);

  // Les cartes échangent leurs positions dans une séquence liée au scroll.
  useEffect(() => {
    if (!processRef.current) return undefined;

    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = processRef.current.querySelector(`.${styles.processPhases}`);
      const cards = gsap.utils.toArray(
        processRef.current.querySelectorAll(`.${styles.processCard}`),
      );
      if (!stage || cards.length !== 3) return;

      const getOffsets = () => {
        const slots = cards.map((card) => ({
          x: card.offsetLeft + card.offsetWidth / 2,
          y: card.offsetTop + card.offsetHeight / 2,
        }));
        return {
          slots,
          offsets: slots.map((slot) => ({
            x: slot.x - slots[0].x,
            y: slot.y - slots[0].y,
          })),
        };
      };

      gsap.set(cards, { transformOrigin: "50% 50%", zIndex: 1 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "center center",
          end: () => `+=${window.innerHeight * 1.25}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const midpoint = (from, to, origin, axis) => {
        const { offsets } = getOffsets();
        const distance = (offsets[from][axis] + offsets[to][axis]) / 2 - offsets[origin][axis];
        return axis === "y"
          ? distance - Math.min(42, window.innerHeight * 0.055)
          : distance;
      };
      const relativeOffset = (from, to, axis) => {
        const { offsets } = getOffsets();
        return offsets[to][axis] - offsets[from][axis];
      };

      timeline
        .to(cards[0], {
          x: () => midpoint(0, 1, 0, "x"),
          y: () => midpoint(0, 1, 0, "y"),
          rotation: 2,
          scale: 1.035,
          zIndex: 3,
          duration: 0.5,
          ease: "none",
        }, 0)
        .to(cards[1], {
          x: () => midpoint(1, 0, 1, "x"),
          y: () => midpoint(1, 0, 1, "y"),
          rotation: -2,
          scale: 0.985,
          zIndex: 2,
          duration: 0.5,
          ease: "none",
        }, 0)
        .to(cards[0], {
          x: () => getOffsets().offsets[1].x,
          y: () => getOffsets().offsets[1].y,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: "none",
        }, 0.5)
        .to(cards[1], {
          x: () => -getOffsets().offsets[1].x,
          y: () => -getOffsets().offsets[1].y,
          rotation: 0,
          scale: 1,
          zIndex: 1,
          duration: 0.5,
          ease: "none",
        }, 0.5)
        .to(cards[0], {
          x: () => midpoint(1, 2, 0, "x"),
          y: () => midpoint(1, 2, 0, "y"),
          rotation: 2,
          scale: 1.035,
          zIndex: 3,
          duration: 0.5,
          ease: "none",
        }, 1)
        .to(cards[2], {
          x: () => midpoint(2, 1, 2, "x"),
          y: () => midpoint(2, 1, 2, "y"),
          rotation: -2,
          scale: 0.985,
          zIndex: 2,
          duration: 0.5,
          ease: "none",
        }, 1)
        .to(cards[0], {
          x: () => getOffsets().offsets[2].x,
          y: () => getOffsets().offsets[2].y,
          rotation: 0,
          scale: 1,
          zIndex: 1,
          duration: 0.5,
          ease: "none",
        }, 1.5)
        .to(cards[2], {
          x: () => relativeOffset(2, 1, "x"),
          y: () => relativeOffset(2, 1, "y"),
          rotation: 0,
          scale: 1,
          zIndex: 2,
          duration: 0.5,
          ease: "none",
        }, 1.5);

      return () => timeline.scrollTrigger?.kill();
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={pageRef} className={styles.page}>

      {/* ═══════════════════════════════════════════════════════
          HERO
         ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.gridBg} />
        <div className={styles.glow} />

        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <span className={styles.tagDot} />
            <span>À PROPOS · CALIXTE STÉPHANE</span>
          </div>

          <h1 className={styles["hero-title"]}>
            QUI <span>SUIS-JE</span> ?
          </h1>

          <p className={styles["hero-subtitle"]}>
            Développeur web, concepteur développeur d’applications et ingénieur du son.
            Je crée des expériences numériques fiables, soignées et expressives.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Domaines</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>20+</span>
              <span className={styles.statLabel}>Technologies</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>3+</span>
              <span className={styles.statLabel}>Années d'expérience</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BIO
         ═══════════════════════════════════════════════════════ */}
      <section ref={bioRef} className={styles.bioSection}>
        <div className={styles.bioGrid}>
          <div className={styles.bioAvatar}>
            <div className={styles.avatarRing} />
            <div className={styles.avatarInner}>
              <span className={styles.avatarInitials}>CS</span>
            </div>
            <div className={styles.avatarGlow} />
          </div>

          <div className={styles.bioContent}>
            <span className={styles.bioLabel}>BIOGRAPHIE</span>
            <h2 className={styles.bioTitle}>
              Un parcours entre <span>développement</span> et <span>création</span>
            </h2>
            <p className={styles.bioText}>
              Mon parcours est né d’une double passion : concevoir des applications web
              utiles et imaginer des expériences sonores et visuelles singulières.
            </p>
            <p className={styles.bioText}>
              Après un premier parcours en ingénierie du son, je me suis orienté vers le
              développement web et la conception d’applications. J’aime transformer une
              idée en une interface claire, vivante et agréable à utiliser.
            </p>
            <p className={styles.bioText}>
              Ce portfolio est un terrain d’expérimentation permanent : j’y explore la
              création d’interfaces, les animations et les liens entre le design et le son.
            </p>

            <div className={styles.bioMeta}>
              <div className={styles.bioMetaItem}>
                <span className={styles.bioMetaLabel}>Localisation</span>
                <span className={styles.bioMetaValue}>France</span>
              </div>
              <div className={styles.bioMetaItem}>
                <span className={styles.bioMetaLabel}>Disponibilité</span>
                <span className={styles.bioMetaValue} data-available="true">
                  Missions freelance
                </span>
              </div>
              <div className={styles.bioMetaItem}>
                <span className={styles.bioMetaLabel}>Langues</span>
                <span className={styles.bioMetaValue}>FR · EN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DÉMARCHE DE CONCEPTION ET DE DÉVELOPPEMENT
         ═══════════════════════════════════════════════════════ */}
      <section
        ref={processRef}
        className={styles.processSection}
        aria-labelledby="process-title"
      >
        <div className={styles.processAtmosphere} aria-hidden="true" />
        <div className={styles.processInner}>
          <header className={styles.processHeader}>
            <span className={`${styles.processEyebrow} ${styles.processReveal}`}>
              Ma démarche · du besoin à l’amélioration continue
            </span>
            <h2 id="process-title" className={styles.processTitle}>
              <span className={styles.processTitleLine}>
                <span className={styles.processTitleText}>Concevoir avec sens.</span>
              </span>
              <span className={styles.processTitleLine}>
                <span className={styles.processTitleText}>
                  Développer avec <span className={styles.processAccent}>exigence.</span>
                </span>
              </span>
            </h2>
            <p className={`${styles.processLead} ${styles.processReveal}`}>
              Chaque projet avance par étapes : comprendre les personnes et leurs besoins,
              concevoir une application accessible et sécurisée, puis la tester et
              l’améliorer.
            </p>
          </header>

          <div className={styles.processPhases}>
            {PROCESS_PHASES.map((phase) => (
              <article
                key={phase.number}
                className={styles.processCard}
                style={{ "--process-accent": phase.accent }}
              >
                <div className={styles.processCardTop}>
                  <span className={styles.processNumber}>{phase.number}</span>
                  <span className={styles.processRule} aria-hidden="true" />
                </div>
                <h3 className={styles.processCardTitle}>{phase.title}</h3>
                <p className={styles.processCardDescription}>{phase.description}</p>
                <ol className={styles.processSteps}>
                  {phase.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </article>
            ))}
          </div>

          <div className={`${styles.processFooter} ${styles.processReveal}`}>
            <p>
              La sécurité, l’accessibilité, la confidentialité des données et la
              collaboration accompagnent l’ensemble du parcours.
            </p>
            <Link to="/processPage" className={styles.processLink}>
              Découvrir toutes les étapes
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPÉTENCES
         ═══════════════════════════════════════════════════════ */}
      <section ref={skillsRef} className={styles.skillsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>COMPÉTENCES</span>
          <h2 className={styles.sectionTitle}>
            Ce que je <span>maîtrise</span>
          </h2>
        </div>

        <div className={styles.skillsGrid}>
          {skillsError && <p role="alert">{skillsError}</p>}
          {skills.map((group) => (
            <div key={group.category} className={styles.skillCard} style={{ "--accent": group.color }}>
              <div className={styles.skillHeader}>
                <span className={styles.skillIcon}>{group.icon}</span>
                <h3 className={styles.skillCategory}>{group.category}</h3>
              </div>
              <ul className={styles.skillList}>
                {group.items.map((item) => (
                  <li key={item.name} className={styles.skillItem}>
                    <div className={styles.skillTop}>
                      <span className={styles.skillName}>{item.name}</span>
                      <span className={styles.skillLevel}>{item.level}%</span>
                    </div>
                    <div className={styles.skillTrack}>
                      <div className={styles.skillBar} data-level={item.level} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARCOURS
         ═══════════════════════════════════════════════════════ */}
      <section ref={timelineRef} className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>PARCOURS</span>
          <h2 className={styles.sectionTitle}>
            Mon <span>chemin</span>
          </h2>
        </div>

        <div className={styles.timeline}>
          {EXPERIENCES
            .filter((item) =>
              ["Concepteur Développeur d'Applications", "Ingénieur du Son"].includes(item.title),
            )
            .map((item) => (
              <div
                key={`${item.year}-${item.title}`}
                className={styles.timelineItem}
                style={{ "--accent": item.color }}
              >
                <div className={styles.timelineDot}>
                  <span className={styles.timelineIcon}>{item.icon}</span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineYear}>{item.year}</span>
                    <span className={styles.timelinePlace}>{item.place}</span>
                  </div>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VALEURS
         ═══════════════════════════════════════════════════════ */}
      <section ref={valuesRef} className={styles.valuesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>VALEURS</span>
          <h2 className={styles.sectionTitle}>
            Ce qui me <span>guide</span>
          </h2>
        </div>

        <div className={styles.valuesGrid}>
          {VALUES.map((value, i) => (
            <div key={i} className={styles.valueCard}>
              <span className={styles.valueIcon}>{value.icon}</span>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueDesc}>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
         ═══════════════════════════════════════════════════════ */}
      <section className={styles.cta}>
        <h2>Travaillons ensemble</h2>
        <p>Un projet web, une application ou une création sonore ? Discutons-en.</p>
        <div className={styles.ctaButtons}>
          <Link to="/projects" className={styles.ctaBtnPrimary}>
            Voir mes projets
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/contact" className={styles.ctaBtnSecondary}>
            Me contacter
          </Link>
        </div>
      </section>
    </div>
  );
}