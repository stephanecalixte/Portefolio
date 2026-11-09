import { useEffect, useState } from "react";
import styles from "./CinemaBackground.module.css";

const EFFECTS = ["vertigo", "bulletTime", "kuleshov", "rotoscope"];

export default function CinemaBackground({
  effect = null,       // null → cycle auto, sinon "vertigo" | "bulletTime" | "kuleshov" | "rotoscope"
  interval = 8000,     // durée de chaque effet (ms)
  showLabel = true,    // affiche le nom en bas
  className = "",
}) {
  const [current, setCurrent] = useState(0);
  const activeEffect = effect || EFFECTS[current];

  useEffect(() => {
    if (effect) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % EFFECTS.length);
    }, interval);
    return () => clearInterval(timer);
  }, [effect, interval]);

  return (
    <div
      className={`${styles.scene} ${className}`.trim()}
      data-effect={activeEffect}
      aria-hidden="true"
    >
      {activeEffect === "vertigo"    && <VertigoEffect />}
      {activeEffect === "bulletTime" && <BulletTimeEffect />}
      {activeEffect === "kuleshov"   && <KuleshovEffect />}
      {activeEffect === "rotoscope"  && <RotoscopeEffect />}

      {showLabel && (
        <div className={styles.label}>
          <span className={styles.labelDot} />
          <span className={styles.labelText}>
            {{
              vertigo: "EFFET VERTIGO — Dolly Zoom",
              bulletTime: "BULLET TIME — Ralenti extrême",
              kuleshov: "EFFET KULESHOV — Contexte / Émotion",
              rotoscope: "ROTOSCOPE — Traçage image par image",
            }[activeEffect]}
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. VERTIGO — Tunnel en perspective (dolly zoom simulé)
   ═══════════════════════════════════════════════════════════════ */
function VertigoEffect() {
  return (
    <div className={styles.vertigo}>
      <div className={styles.vortex}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={styles.ring}
            style={{ "--i": i }}
          />
        ))}
      </div>
      <div className={styles.vertigoSubject}>
        <div className={styles.subjectCore} />
        <div className={styles.subjectHalo} />
      </div>
      <div className={styles.vertigoSpeedLines}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className={styles.speedLine} style={{ "--i": i }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. BULLET TIME — Sujet figé + caméra qui orbite
   ═══════════════════════════════════════════════════════════════ */
function BulletTimeEffect() {
  return (
    <div className={styles.bulletTime}>
      {/* Particules gelées en orbite */}
      <div className={styles.btOrbit}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className={styles.btParticle}
            style={{
              "--angle": `${(i / 48) * 360}deg`,
              "--radius": `${140 + (i % 4) * 70}px`,
              "--size": `${2 + (i % 4)}px`,
              "--dur": `${18 + (i % 5) * 4}s`,
              "--delay": `${(i / 48) * -8}s`,
            }}
          />
        ))}
      </div>

      {/* Anneaux de temps figé */}
      <div className={styles.btRings}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={styles.btRing}
            style={{ "--i": i }}
          />
        ))}
      </div>

      {/* Sujet central figé */}
      <div className={styles.btSubject}>
        <div className={styles.btCore} />
        <div className={styles.btGlow} />
        <div className={styles.btSpark} />
      </div>

      {/* Motion blur overlay */}
      <div className={styles.btMotionBlur} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. KULESHOV — Visage neutre + contexte changeant
   ═══════════════════════════════════════════════════════════════ */
function KuleshovEffect() {
  const contexts = ["fire", "desert", "feast", "skull"];
  return (
    <div className={styles.kuleshov}>
      {/* 4 contextes qui se relaient */}
      {contexts.map((ctx, i) => (
        <div
          key={ctx}
          className={`${styles.kContext} ${styles[`k_${ctx}`]}`}
          style={{ "--delay": `${i * 2}s` }}
          data-ctx={ctx}
        />
      ))}

      {/* Visage neutre fixe au centre */}
      <div className={styles.kFace}>
        <svg viewBox="0 0 200 260" className={styles.kFaceSvg}>
          <ellipse
            cx="100" cy="130" rx="62" ry="82"
            fill="none"
            stroke="rgba(230, 240, 250, 0.85)"
            strokeWidth="2"
          />
          <circle cx="78" cy="118" r="4.5" fill="rgba(230, 240, 250, 0.9)" />
          <circle cx="122" cy="118" r="4.5" fill="rgba(230, 240, 250, 0.9)" />
          <path
            d="M 84 172 Q 100 178 116 172"
            fill="none"
            stroke="rgba(230, 240, 250, 0.7)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 100 96 L 100 130"
            fill="none"
            stroke="rgba(230, 240, 250, 0.35)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Indicateur de contexte courant */}
      <div className={styles.kContextLabel}>
        <span>CONTEXTE</span>
        <span className={styles.kCtxWord}>
          <span className={styles.kCtxFire}>FEU</span>
          <span className={styles.kCtxDesert}>DÉSERT</span>
          <span className={styles.kCtxFeast}>FESTIN</span>
          <span className={styles.kCtxSkull}>MORT</span>
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. ROTOSCOPE — Traçage ligne par ligne (image par image)
   ═══════════════════════════════════════════════════════════════ */
function RotoscopeEffect() {
  return (
    <div className={styles.rotoscope}>
      {/* Fond "footage" subtile */}
      <div className={styles.rotoFootage} />

      {/* Dessin au trait qui se trace */}
      <svg
        viewBox="0 0 1000 800"
        className={styles.rotoSvg}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="rotoGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          filter="url(#rotoGlow)"
          className={styles.rotoLayer}
          fill="none"
          stroke="rgba(127, 208, 255, 0.9)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Profil de tête (silhouette) */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "0s" }}
            d="M 500 720 Q 500 570 480 470 Q 460 360 520 310 Q 600 260 680 330 Q 720 390 700 470 Q 680 530 620 570 Q 580 600 560 630 Q 540 670 540 720"
          />
          {/* Œil */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "0.8s" }}
            d="M 555 430 Q 590 410 625 430 Q 590 445 555 430 Z"
          />
          {/* Arcade sourcilière */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "1.2s" }}
            d="M 548 415 Q 590 400 632 415"
          />
          {/* Nez */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "1.6s" }}
            d="M 620 470 L 635 500 L 610 510"
          />
          {/* Bouche */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "2s" }}
            d="M 590 555 Q 620 565 645 548"
          />
          {/* Cou / épaules */}
          <path
            pathLength="1"
            className={styles.rotoPath}
            style={{ "--delay": "2.4s" }}
            d="M 540 720 Q 540 660 500 640 M 540 720 Q 545 660 600 640"
          />

          {/* Traits de construction (comme un vrai rotoscope) */}
          <g
            stroke="rgba(127, 208, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 6"
          >
            <line x1="500" y1="260" x2="500" y2="750" />
            <line x1="450" y1="430" x2="700" y2="430" />
            <line x1="450" y1="555" x2="700" y2="555" />
          </g>
        </g>
      </svg>

      {/* Compteur "frame by frame" */}
      <div className={styles.rotoFrameCounter}>
        <span className={styles.rotoFrameDot} />
        <span>FRAME 001 / 024</span>
      </div>
    </div>
  );
}