import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./About.module.css";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const SKILLS = [
  {
    category: "Réseau",
    icon: "◈",
    color: "#4da6ff",
    items: [
      { name: "Cisco IOS / IOS XR", level: 90 },
      { name: "Configuration switch / routeur", level: 95 },
      { name: "VLAN, STP, OSPF, BGP", level: 85 },
      { name: "Firewall FortiGate", level: 80 },
      { name: "Mellanox / NVIDIA Networking", level: 75 },
    ],
  },
  {
    category: "Web / Dev",
    icon: "◉",
    color: "#7fd0ff",
    items: [
      { name: "React / Next.js", level: 90 },
      { name: "JavaScript / TypeScript", level: 85 },
      { name: "HTML / CSS avancé", level: 95 },
      { name: "Node.js / Express", level: 80 },
      { name: "GSAP / Animations", level: 85 },
    ],
  },
  {
    category: "DevOps",
    icon: "◈",
    color: "#ff9500",
    items: [
      { name: "Docker / Kubernetes", level: 80 },
      { name: "GitLab CI / GitHub Actions", level: 85 },
      { name: "Linux / Bash", level: 90 },
      { name: "Monitoring (Prometheus, Grafana)", level: 75 },
      { name: "Git / Versioning", level: 95 },
    ],
  },
  {
    category: "Sécurité",
    icon: "◉",
    color: "#00ff88",
    items: [
      { name: "Audit / Pentest réseaux", level: 75 },
      { name: "Cryptographie / VPN", level: 80 },
      { name: "SSH / Certificats", level: 85 },
      { name: "Politique de sécurité", level: 80 },
    ],
  },
];

const TIMELINE = [
  {
    year: "2025",
    title: "Concepteur Développeur d'Applications",
    place: "Portfolio & projets web",
    desc: "Développement du portfolio cinématique, du simulateur data center et de composants React avancés. Spécialisation en animations GSAP et scènes 3D en CSS.",
    icon: "◉",
    color: "#7fd0ff",
  },
  {
    year: "2024",
    title: "DevOps & Infrastructure",
    place: "Pipelines CI/CD, Kubernetes",
    desc: "Mise en place de chaînes de déploiement automatisées, monitoring Prometheus/Grafana, orchestration de containers sur clusters Kubernetes.",
    icon: "◈",
    color: "#ff9500",
  },
  {
    year: "2023",
    title: "Administrateur Réseau",
    place: "Cisco, Fortinet, Mellanox",
    desc: "Configuration de routeurs Cisco N540, switches Mellanox MCS7520, pare-feux FortiGate 121G. Déploiement de VLANs, routage OSPF/BGP et sécurité réseau.",
    icon: "◈",
    color: "#4da6ff",
  },
  {
    year: "2022",
    title: "Ingénieur du Son",
    place: "Production musicale & live",
    desc: "Production audio, mixage live, setup de système de retours IEM. Exploration des ponts entre le son et l'informatique temps réel.",
    icon: "◉",
    color: "#ff6b9d",
  },
];

const VALUES = [
  {
    icon: "◈",
    title: "Précision technique",
    desc: "Chaque configuration, chaque ligne de code est testée et documentée. Pas de place pour le hasard.",
  },
  {
    icon: "◉",
    title: "Esthétique fonctionnelle",
    desc: "Une interface doit être belle ET efficace. Le design n'est pas décoratif, il sert l'utilisateur.",
  },
  {
    icon: "◈",
    title: "Sécurité par défaut",
    desc: "Toute infrastructure est pensée avec la sécurité comme fondation, jamais comme ajout.",
  },
  {
    icon: "◉",
    title: "Apprentissage continu",
    desc: "Nouvelles technologies, nouveaux protocoles, nouvelles pratiques : je reste en veille permanente.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════
export default function About() {
  const heroRef = useRef(null);
  const bioRef = useRef(null);
  const skillsRef = useRef(null);
  const timelineRef = useRef(null);
  const valuesRef = useRef(null);

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
        gsap.fromTo(title, { y: 80, opacity: 0, skewY: 5 }, { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: "power4.out", delay: 0.3 });
      }
      if (subtitle) {
        gsap.fromTo(subtitle, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 });
      }
    });

    return () => ctx.revert();
  }, []);

  // Animation skills bars au scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = skillsRef.current?.querySelectorAll(`.${styles.skillBar}`);
      if (bars?.length) {
        bars.forEach((bar) => {
          const level = parseInt(bar.dataset.level || "0", 10);
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: `${level}%`,
              duration: 1.4,
              ease: "power3.out",
              scrollTrigger: { trigger: bar, start: "top 85%", toggleActions: "play none none reverse" },
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Animation timeline items
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = timelineRef.current?.querySelectorAll(`.${styles.timelineItem}`);
      if (items?.length) {
        gsap.set(items, { opacity: 0, x: -40 });
        items.forEach((item) => {
          gsap.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 82%", toggleActions: "play none none reverse" },
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Animation values
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = valuesRef.current?.querySelectorAll(`.${styles.valueCard}`);
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 40 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: valuesRef.current, start: "top 75%", toggleActions: "play none none reverse" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.page}>

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
            Ingénieur réseau, développeur web, DevOps et ingénieur du son.
            Je construis des infrastructures fiables et des interfaces qui ont du caractère.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4</span>
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
              Un parcours entre <span>infrastructure</span> et <span>création</span>
            </h2>
            <p className={styles.bioText}>
              Mon parcours est né d'une double passion : comprendre comment les données circulent
              (réseau, DevOps) et comment elles se racontent (web, design, son).
            </p>
            <p className={styles.bioText}>
              J'ai commencé par l'ingénierie du son, avant de plonger dans l'administration
              réseau puis le développement web. Aujourd'hui, je conçois des architectures
              complètes : de la configuration d'un routeur Cisco jusqu'aux animations qui
              font vibrer une interface.
            </p>
            <p className={styles.bioText}>
              Ce portfolio est un terrain d'expérimentation permanent. Chaque composant
              reproduit fidèlement du matériel réel (routeurs, switchs, pare-feux),
              chaque animation explore les limites du CSS et de GSAP.
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
          {SKILLS.map((group) => (
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
          {TIMELINE.map((item, i) => (
            <div
              key={i}
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
        <p>Un projet réseau, web ou DevOps ? Discutons de ce que je peux apporter.</p>
        <div className={styles.ctaButtons}>
          <Link to="/projets" className={styles.ctaBtnPrimary}>
            Voir mes projets
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a href="mailto:contact@calixte-stephane.fr" className={styles.ctaBtnSecondary}>
            Me contacter
          </a>
        </div>
      </section>
    </div>
  );
}