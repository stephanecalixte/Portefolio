import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import animStyles from "../animations/calixteAnimations/CalixteAnimations.module.css";
import styles from "./NavBar.module.css";

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
  "liquidMorph", "glitchGrid", "asciiArt", "massSpring",
];

const MAIN_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/projects", label: "Mes Projets" },
  { to: "/about", label: "A propos" },

];
const Contact={to:"/contact",label:"Contact"}

const SOCIAL_LINKS = [
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://github.com", label: "GitHub" },
  { href: "https://twitter.com", label: "Twitter" },
];

// AnimatedText — parent porte .anim_XXX, lettres enfants portent .char
function AnimatedText({ text, animation, offset = 0 }) {
  const animClass = animStyles[`anim_${animation}`] || animStyles.anim_splitReveal3D;
  return (
    <span className={animClass}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={`${animStyles.char} ${styles.letter}`}
          style={{ "--i": String(i + offset) }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function Navbar() {
  const hamburgerRef = useRef(null);
  const navBarRef = useRef(null);
  const location = useLocation();

  // Cycle des animations — 1 tick toutes les 2.5s
  const [tick, setTick] = useState(0);
  const [hamburgerShape, setHamburgerShape] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shapeTimer = setInterval(() => {
      setHamburgerShape((shape) => (shape + 1) % 7);
    }, 120000);
    return () => clearInterval(shapeTimer);
  }, []);

  // Toggle menu — EXACTEMENT comme l'original
  useEffect(() => {
    const h = hamburgerRef.current;
    const n = navBarRef.current;
    if (!h || !n) return;

    const click = () => {
      const open = n.classList.toggle(styles.navBarOpen);
      h.classList.toggle(styles.hamburgerOpen, open);
      h.setAttribute("aria-expanded", String(open));
      h.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };

    h.setAttribute("aria-expanded", "false");
    h.setAttribute("aria-controls", "nav-bar");
    h.addEventListener("click", click);
    return () => h.removeEventListener("click", click);
  }, []);

  const closeMenu = () => {
    const h = hamburgerRef.current;
    const n = navBarRef.current;
    if (n) n.classList.remove(styles.navBarOpen);
    if (h) {
      h.classList.remove(styles.hamburgerOpen);
      h.setAttribute("aria-expanded", "false");
      h.setAttribute("aria-label", "Ouvrir le menu");
    }
  };

  // Chaque élément reçoit une animation DIFFÉRENTE, qui change toutes les 2.5s
  // (tick * 8 + i) % 40 → en 5 ticks (12.5s), les 40 animations ont défilé
  const getAnim = (i) => ANIMATIONS[(tick * 8 + i) % ANIMATIONS.length];

  const isActive = (link) => {
    if (link.to === "/") return location.pathname === "/";
    return location.pathname.startsWith(link.to.split("#")[0]);
  };

  return (
    <>
      <button
        ref={hamburgerRef}
        className={`${styles.hamburger} ${hamburgerShape ? styles[`hamburgerShape${hamburgerShape}`] : ""}`}
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded="false"
        aria-controls="nav-bar"
      >
        <span></span><span></span><span></span>
      </button>

      <nav id="nav-bar" ref={navBarRef} className={styles.navBar}>

        {/* BRAND */}
        <div className={styles.brand}>
          <span className={styles.brandGreeting}>
            <AnimatedText text="Good morning" animation={getAnim(0)} offset={0} />
          </span>
          <span className={styles.brandName}>
            <AnimatedText text="CS." animation={getAnim(1)} offset={12} />
          </span>
        </div>

        {/* MAIN LINKS */}
        <div className={styles.mainLinks}>
          {MAIN_LINKS.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${isActive(link) ? styles.navLinkActive : ""}`}
              onClick={closeMenu}
            >
              <AnimatedText
                text={link.label}
                animation={getAnim(i + 2)}
                offset={i * 3}
              />
            </Link>
          ))}
        </div>

        {/* SOCIAL */}
        <div className={styles.socialLinks}>
          {SOCIAL_LINKS.map((social, i) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <AnimatedText text={social.label} animation={getAnim(i + 5)} offset={i * 4} />
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to={Contact.to}
          className={styles.ctaBtn}
          onClick={closeMenu}
        >
          <AnimatedText text="Pouvons-nous en parler ?" animation={getAnim(8)} offset={10} />
        </Link>
      </nav>
    </>
  );
}