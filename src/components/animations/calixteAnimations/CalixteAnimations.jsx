import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./CalixteAnimations.module.css";
import { getSkills } from "../../../api";
import EXPERIENCES from "../../../data/experiences";
import ROLES from "../../../data/roles";

// ─── 40 animations ───
const ANIMATIONS = [
  "splitReveal3D", "elasticSnap", "gravityFall", "sliceSlide",
  "depthBlur", "perspectiveTilt", "kaleidoscope", "typewriter",
  "origami", "mirrorReflect", "waveMorph", "neonPulse",
  "glitchRGB", "hologram", "matrixRain", "morseCode",
  "halftone", "strobe", "vaporize", "explosion",
  "iceShatter", "smokeRise", "fireBurn", "pixelate",
  "turbulence", "magneticCursor", "scramble", "vortex",
  "rotateCylinder", "windShake", "bassDrop", "ripple",
  "chromaticAberration", "chromaticBlur", "staggerBlur", "liquidFill",
  "liquidMorph", "glitchGrid", "asciiArt", "massSpring"
];

// ─── 50 polices tendance 2025/2026 ───
// Mélange de Google Fonts (gratuites) + polices système + display populaires.
const FONTS = [
  // ── Google Fonts ──
  "Inter, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "Raleway, sans-serif",
  "Space Grotesk, sans-serif",
  "Syne, sans-serif",
  "Bebas Neue, sans-serif",
  "Oswald, sans-serif",
  "Anton, sans-serif",
  "Archivo Black, sans-serif",
  "League Spartan, sans-serif",
  "Chakra Petch, sans-serif",
  "Staatliches, sans-serif",
  "Fraunces, serif",
  "Cormorant Garamond, serif",
  "Playfair Display, serif",
  "DM Serif Display, serif",
  "Libre Baskerville, serif",
  "Lora, serif",
  "EB Garamond, serif",
  "Crimson Pro, serif",
  "Merriweather, serif",
  "Work Sans, sans-serif",
  "Mulish, sans-serif",
  "Manrope, sans-serif",
  "Outfit, sans-serif",
  "Sora, sans-serif",
  "Urbanist, sans-serif",
  "Plus Jakarta Sans, sans-serif",
  "Figtree, sans-serif",
  "Onest, sans-serif",
  "Geologica, sans-serif",
  "Gabarito, sans-serif",
  "Bricolage Grotesque, sans-serif",
  "Unbounded, sans-serif",
  "Climate Crisis, sans-serif",
  "Rubik, sans-serif",
  "Karla, sans-serif",
  "Public Sans, sans-serif",
  "Schibsted Grotesk, sans-serif",
  // ── Polices système / classiques ──
  "Helvetica, Arial, sans-serif",
  "Futura, 'Trebuchet MS', sans-serif",
  "Avenir, 'Segoe UI', sans-serif",
  "Arial Black, sans-serif",
  "Impact, 'Arial Black', sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Consolas, 'Courier New', monospace",
  "'Trebuchet MS', sans-serif"
];

const DURATION = 2500; // ms par animation

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CalixteAnimations() {
  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const [currentOrder, setCurrentOrder] = useState(() => shuffle(ANIMATIONS));
  const [index, setIndex] = useState(0);
  const [skillIndex, setSkillIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [font, setFont] = useState(() => FONTS[Math.floor(Math.random() * FONTS.length)]);

  const containerRef = useRef(null);
  const textRef = useRef(null);

  const currentAnim = currentOrder[index];
  const skillItems = skills.flatMap(({ category, items }) =>
    items.map(({ name }) => ({ category, name }))
  );
  const rotationItems = [
    ...skillItems,
    ...EXPERIENCES.map(({ year, title }) => ({
      category: `EXPÉRIENCE · ${year}`,
      name: title,
    })),
    ...ROLES.map(({ title }) => ({
      category: "MÉTIER",
      name: title,
    })),
  ];
  const currentSkill = rotationItems[skillIndex] || {
    category: skillsError ? "ERREUR" : "CHARGEMENT",
    name: skillsError ? "BASE DE DONNÉES" : "COMPÉTENCES",
  };

  useEffect(() => {
    const controller = new AbortController();
    getSkills(controller.signal)
      .then(setSkills)
      .catch((error) => {
        if (error.name !== "AbortError") setSkillsError(error.message);
      });
    return () => controller.abort();
  }, []);

  // ─── Timer : changement d'animation + nouvelle police aléatoire ───
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rotationItems.length) {
        setSkillIndex((i) => (i + 1) % rotationItems.length);
      }
      setIndex((i) => {
        // Nouvelle police à chaque étape
        setFont(FONTS[Math.floor(Math.random() * FONTS.length)]);

        if (i + 1 >= currentOrder.length) {
          setCurrentOrder(shuffle(ANIMATIONS));
          setCycle((c) => c + 1);
          return 0;
        }
        return i + 1;
      });
    }, DURATION);
    return () => clearTimeout(timer);
  }, [index, currentOrder, rotationItems.length]);

  // ─── Magnetic cursor (GSAP) ───
  useEffect(() => {
    if (currentAnim !== "magneticCursor") return;
    const target = containerRef.current;
    const text = textRef.current;
    if (!target || !text) return;
    const chars = text.querySelectorAll(`.${styles.char}`);

    const move = (e) => {
      chars.forEach((char) => {
        const r = char.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = 260;
        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 50;
          const angle = Math.atan2(dy, dx);
          gsap.to(char, {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(char, { x: 0, y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        }
      });
    };

    const leave = () => {
      gsap.to(chars, { x: 0, y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    };

    target.addEventListener("mousemove", move);
    target.addEventListener("mouseleave", leave);
    return () => {
      target.removeEventListener("mousemove", move);
      target.removeEventListener("mouseleave", leave);
      gsap.killTweensOf(chars);
    };
  }, [currentAnim, index, skillIndex]);

  // ─── Scramble (texte brouillé) ───
  useEffect(() => {
    if (currentAnim !== "scramble") return;
    const text = textRef.current;
    if (!text) return;
    const spans = text.querySelectorAll(`.${styles.char}`);
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const start = Date.now();
    const durations = Array.from(spans).map((_, i) => 800 + i * 60 + Math.random() * 300);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      let allDone = true;
      spans.forEach((span, i) => {
        const orig = span.dataset.original;
        if (elapsed < durations[i]) {
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          allDone = false;
        } else {
          span.textContent = orig;
        }
      });
      if (allDone) clearInterval(interval);
    }, 40);

    return () => {
      clearInterval(interval);
      spans.forEach((s) => (s.textContent = s.dataset.original));
    };
  }, [currentAnim, index, skillIndex]);

  // ─── Rendu des lettres ───
  const renderLine = (text, offset, lineKey) => (
    <div className={styles.line} key={lineKey}>
      {text.split("").map((char, i) => (
        <span
          key={`${lineKey}-${i}`}
          className={styles.char}
          style={{ "--i": String(i + offset) }}
          data-original={char === " " ? "\u00A0" : char}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        key={`${cycle}-${index}-${currentAnim}-${skillIndex}`}
        ref={textRef}
        className={`${styles.calixteText} ${styles[`anim_${currentAnim}`]}`}
        style={{
          fontFamily: font,
          fontSize: `clamp(1.4rem, ${Math.min(8, 68 / Math.max(currentSkill.category.length, currentSkill.name.length))}vw, 7.5rem)`,
        }}
        data-anim={currentAnim}
        aria-label={`${currentSkill.category} : ${currentSkill.name}`}
      >
        {renderLine(currentSkill.category.toUpperCase(), 0, "line1")}
        {renderLine(currentSkill.name.toUpperCase(), currentSkill.category.length, "line2")}
      </div>

      {/* Indicateur (optionnel) */}
      <div className={styles.indicator}>
        <span className={styles.animName}>{currentAnim}</span>
        <span className={styles.counter}>{index + 1} / {currentOrder.length}</span>
        <span className={styles.cycle}>Cycle {cycle + 1}</span>
        {skillsError && <span role="alert">{skillsError}</span>}
      </div>
    </div>
  );
}