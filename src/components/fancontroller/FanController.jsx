import { useMemo, useState } from "react";
import styles from "./FanController.module.css";

export default function FanController({
  className = "",
  isOn: isOnProp,
  speed: speedProp,
  initialOn = true,
  initialSpeed = 50,
  onIsOnChange,
  onSpeedChange,
}) {
  const [isOnInternal, setIsOnInternal] = useState(initialOn);
  const [speedInternal, setSpeedInternal] = useState(initialSpeed);

  const controlled = isOnProp !== undefined && speedProp !== undefined;

  const isOn = controlled ? isOnProp : isOnInternal;
  const speed = controlled ? speedProp : speedInternal;

  const setIsOn = (v) => {
    const next = typeof v === "function" ? v(isOn) : v;
    if (controlled) onIsOnChange?.(next);
    else setIsOnInternal(next);
  };
  const setSpeed = (v) => {
    const next = typeof v === "function" ? v(speed) : v;
    if (controlled) onSpeedChange?.(next);
    else setSpeedInternal(next);
  };

  const spinDuration = useMemo(() => {
    if (!isOn || speed === 0) return 0;
    const minDur = 0.4;
    const maxDur = 8;
    return maxDur - (speed / 100) * (maxDur - minDur);
  }, [speed, isOn]);

  const rpm = useMemo(() => {
    if (!isOn || speed === 0) return 0;
    return Math.round(60 / spinDuration);
  }, [spinDuration, isOn, speed]);

  const isSpinning = isOn && speed > 0;

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <div className={styles.fanAssembly}>
        <div className={styles.frame}>
          <div className={styles.guard}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.guardRing} style={{ "--i": i }} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`spoke-${i}`} className={styles.guardSpoke} style={{ "--i": i }} />
            ))}
            <div className={styles.guardCenter} />
          </div>

          <div
            className={styles.rotor}
            style={{
              animationDuration: `${spinDuration}s`,
              animationPlayState: isSpinning ? "running" : "paused",
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.blade} style={{ "--i": i }} />
            ))}
            <div className={styles.hub}>
              <div className={styles.hubCore} />
            </div>
          </div>

          <div
            className={styles.motionBlur}
            style={{ opacity: isSpinning ? (speed / 100) * 0.6 : 0 }}
          />
          <div className={styles.ledRing} data-on={isOn} />
        </div>

        <div className={styles.stand}>
          <div className={styles.standNeck} />
          <div className={styles.standBase} />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.display} data-fan-display>
          <div className={styles.displayRow}>
            <span className={styles.displayLabel}>STATUT</span>
            <span className={styles.statusDot} data-on={isSpinning} />
            <span className={styles.displayValue}>
              {isOn ? (speed === 0 ? "ARRÊT" : "EN MARCHE") : "OFF"}
            </span>
          </div>
          <div className={styles.displayRow}>
            <span className={styles.displayLabel}>VITESSE</span>
            <span className={styles.displayBig}>{speed}%</span>
          </div>
          <div className={styles.displayRow}>
            <span className={styles.displayLabel}>RPM</span>
            <span className={styles.displayValue}>{rpm} tr/min</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.powerBtn}
          data-on={isOn}
          data-fan-btn
          onClick={() => setIsOn((v) => !v)}
          aria-label={isOn ? "Éteindre" : "Allumer"}
        >
          <span className={styles.powerIcon} />
          <span>{isOn ? "ON" : "OFF"}</span>
        </button>

        <div className={styles.sliderWrap}>
          <label className={styles.sliderLabel} htmlFor="fan-speed">VARIATEUR</label>
          <input
            id="fan-speed"
            type="range"
            min="0"
            max="100"
            step="1"
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSpeed(v);
              if (!isOn && v > 0) setIsOn(true);
            }}
            className={styles.slider}
            style={{ "--val": `${speed}%` }}
          />
          <div className={styles.sliderMarks}>
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>

        <div className={styles.presets}>
          {[
            { label: "ARRÊT", v: 0 },
            { label: "DOUX", v: 25 },
            { label: "MOYEN", v: 50 },
            { label: "FORT", v: 75 },
            { label: "MAX", v: 100 },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              className={styles.presetBtn}
              data-active={speed === p.v ? "true" : "false"}
              onClick={() => {
                setSpeed(p.v);
                if (p.v > 0 && !isOn) setIsOn(true);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}