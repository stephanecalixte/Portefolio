import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./TVSection.module.css";
import ROLES from "../../data/roles";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES DES TVs
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_TVS = ROLES.map(({ title, description }) => ({
  titre: title,
  desc: description,
}));

function setPowerState(tv, isOn, animated = true) {
  const screen = tv.querySelector(`.${styles["tv-screen"]}`);
  const content = tv.querySelector(`.${styles["tv-content"]}`);
  const statusBar = tv.querySelector(`.${styles["tv-statusbar"]}`);
  const cursor = tv.querySelector(`.${styles["tv-cursor"]}`);
  const flash = tv.querySelector(`.${styles["tv-flash"]}`);
  const letters = content?.querySelectorAll(`.${styles["tv-letter"]}`) ?? [];
  const leds = tv.querySelectorAll(`.${styles["led-green"]}, .${styles["led-amber"]}, .${styles["led-blue"]}`);
  const powerButton = tv.querySelector(`.${styles["power-btn"]}`);
  if (!screen || !content || !statusBar || !cursor || !flash || !powerButton) return;

  const targets = [screen, content, statusBar, cursor, flash, ...letters, ...leds];
  gsap.killTweensOf(targets);
  tv.dataset.power = isOn ? "on" : "off";
  powerButton.setAttribute("aria-pressed", String(isOn));
  powerButton.setAttribute(
    "aria-label",
    isOn ? "Éteindre le téléviseur" : "Allumer le téléviseur",
  );

  if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(screen, { filter: isOn ? "brightness(1.1) grayscale(0)" : "brightness(0.12) grayscale(1)" });
    gsap.set([content, statusBar], { autoAlpha: isOn ? 1 : 0.18, y: 0 });
    gsap.set(letters, { autoAlpha: isOn ? 1 : 0 });
    gsap.set(cursor, { autoAlpha: isOn ? 1 : 0 });
    gsap.set(flash, { autoAlpha: 0 });
    gsap.set(leds, { autoAlpha: isOn ? 1 : 0.2 });
    return;
  }

  const timeline = gsap.timeline();
  if (isOn) {
    gsap.set(flash, { opacity: 0 });
    gsap.set([content, statusBar], { y: 8 });
    gsap.set(cursor, { autoAlpha: 0 });
    timeline
      .to(screen, { filter: "brightness(1.1) grayscale(0)", duration: 0.42, ease: "power2.out" })
      .to(flash, { opacity: 0.72, duration: 0.055, ease: "none" }, 0)
      .to(flash, { opacity: 0, duration: 0.38, ease: "power2.out" }, 0.055)
      .to([content, statusBar], { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.06, ease: "power3.out" }, 0.16)
      .fromTo(
        letters,
        { autoAlpha: 0, y: 3, filter: "blur(2px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.12,
          stagger: 0.018,
          ease: "power1.out",
        },
        0.38,
      )
      .to(leds, { autoAlpha: 1, duration: 0.22, stagger: 0.055, ease: "power1.out" }, 0.2)
      .to(cursor, { autoAlpha: 1, duration: 0.16 }, 0.55);
  } else {
    timeline
      .to(letters, { autoAlpha: 0, duration: 0.06, stagger: { each: 0.004, from: "end" }, ease: "none" }, 0)
      .to([content, statusBar, cursor], { autoAlpha: 0.18, y: 2, duration: 0.16, stagger: 0.025, ease: "power1.in" })
      .to(screen, { filter: "brightness(0.12) grayscale(1)", duration: 0.38, ease: "power2.in" }, "-=0.05")
      .to(leds, { autoAlpha: 0.2, duration: 0.18, stagger: 0.035 }, 0)
      .to(flash, { opacity: 0.35, duration: 0.045, ease: "none" }, 0)
      .to(flash, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0.045);
  }
}

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

    const tvs = section.querySelectorAll(`.${styles.tv}`);
    tvs.forEach((tv) => setPowerState(tv, false, false));

    if (!("IntersectionObserver" in window)) {
      tvs.forEach((tv) => setPowerState(tv, true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          const tv = target.closest(`.${styles.tv}`);
          if (tv) setPowerState(tv, isIntersecting);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    tvs.forEach((tv) => observer.observe(tv));

    return () => observer.disconnect();
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
  const renderLetters = (text) =>
    Array.from(text, (letter, letterIndex) => (
      <span className={styles["tv-letter"]} aria-hidden="true" key={`${letter}-${letterIndex}`}>
        {letter}
      </span>
    ));

  return (
    <div className={styles.tv} data-power="off">
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
            <h3 aria-label={item.titre}>{renderLetters(item.titre)}</h3>
            <p aria-label={item.desc}>{renderLetters(item.desc)}</p>
          </div>

          <div className={styles["tv-cursor"]}>▊</div>
          <div className={styles["tv-flash"]} />
        </div>

        <div className={styles["tv-controls"]}>
          <button
            className={styles["power-btn"]}
            type="button"
            aria-label="Allumer le téléviseur"
            aria-pressed="false"
            onClick={(event) => {
              const tv = event.currentTarget.closest(`.${styles.tv}`);
              if (tv) setPowerState(tv, tv.dataset.power !== "on");
            }}
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