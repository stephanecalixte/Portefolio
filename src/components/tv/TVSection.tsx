import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./TVSection.module.css";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES DES TVs
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_TVS = [
  { titre: "Développeur Web", desc: "Compétences en développement web et administration d'infrastructures sécurisées." },
  { titre: "Concepteur développeur d'applications", desc: "Compétences en conception et développement d'applications sécurisées." },
  { titre: "DevOps", desc: "Compétences en DevOps et automatisation." },
  { titre: "Administrateur réseau", desc: "Compétences en administration de réseaux." },
  { titre: "Ingénieur du son", desc: "Compétences en ingénierie du son et production musicale." },
];

const TVSection = forwardRef(function TVSection(
  { tvs = DEFAULT_TVS, id = "projets", className = "" },
  ref
) {
  const sectionRef = useRef(null);
  const localRef = useRef(null);

  // Expose la ref au parent ET à l'usage interne
  const setRefs = (el) => {
    localRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  // ═══════════════════════════════════════════════════════════════
  // Animation GSAP des TVs
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const section = localRef.current;
    if (!section) return;

    let ctx;
    const rafId = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const screens = section.querySelectorAll(`.${styles["tv-screen"]}`);
        const flashes = section.querySelectorAll(`.${styles["tv-flash"]}`);

        if (!screens.length) return;

        gsap.set(screens, { opacity: 0 });
        gsap.set(flashes, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        screens.forEach((screen, i) => {
          const flash = flashes[i];
          const delay = i * 0.3;

          tl.fromTo(
            flash,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, yoyo: true, repeat: 1 },
            delay
          );

          tl.to(
            screen,
            { opacity: 1, duration: 0.3, ease: "power2.out" },
            delay + 0.1
          );
        });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      ref={setRefs}
      className={`${styles["tv-section"]} ${className}`.trim()}
      id={id}
    >
      {tvs.map((item, i) => (
        <TVCard key={i} item={item} index={i} />
      ))}
    </section>
  );
});

// ═══════════════════════════════════════════════════════════════════
// TV CARD — un seul écran
// ═══════════════════════════════════════════════════════════════════
function TVCard({ item, index }) {
  return (
    <div className={styles.tv}>
      <div className={styles["tv-body"]}>
        <div className={styles.vents}>
          {Array.from({ length: 10 }).map((_, j) => (
            <span key={j} />
          ))}
        </div>

        <div className={styles["tv-screen"]}>
          <div className={styles["tv-statusbar"]}>
            <span className={styles["status-dot"]} />
            <span className={styles["status-label"]}>SERVER-0{index + 1}</span>
            <span className={styles["status-ip"]}>192.168.1.{10 + index}</span>
          </div>

          <div className={styles["tv-content"]}>
            <h3>{item.titre}</h3>
            <p>{item.desc}</p>
          </div>

          <div className={styles["tv-cursor"]}>▊</div>
          <div className={styles["tv-flash"]} />
        </div>

        <div className={styles["tv-controls"]}>
          <button
            className={styles["power-btn"]}
            type="button"
            aria-label="Power"
          >
            <span className={styles["power-icon"]} />
          </button>

          <div className={styles["led-group"]}>
            <span className={styles["led-green"]} title="Power" />
            <span className={styles["led-amber"]} title="Activity" />
            <span className={styles["led-blue"]} title="Network" />
          </div>

          <div className={styles.ports}>
            <span className={styles.port} />
            <span className={styles.port} />
          </div>
        </div>
      </div>

      <div className={styles["tv-legs"]}>
        <div className={styles["tv-leg"]} />
        <div className={styles["tv-leg"]} />
      </div>
    </div>
  );
}

export default TVSection;