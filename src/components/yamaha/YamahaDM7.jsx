import { useEffect, useRef, useState } from "react";
import styles from "./YamahaDM7.module.css";

const BAY_L_CHANNELS = Array.from({ length: 12 }, (_, i) => i + 1);
const BAY_C_CHANNELS = Array.from({ length: 12 }, (_, i) => i + 13);
const MAIN_CHANNELS = ["C", "D", "A", "B"];

// Valeurs de fader initiales (0-100)
const INITIAL_FADERS = {
  ...Object.fromEntries(BAY_L_CHANNELS.map((c) => [c, 60 + Math.random() * 25])),
  ...Object.fromEntries(BAY_C_CHANNELS.map((c) => [c, 60 + Math.random() * 25])),
  C: 78,
  D: 78,
  A: 82,
  B: 82,
};

export default function YamahaDM7({ className = "" }) {
  const [faders, setFaders] = useState(INITIAL_FADERS);
  const [activeScreen, setActiveScreen] = useState(0);
  const screenRefs = useRef([]);

  // Petit "battement" des meters à l'écran
  const [meters, setMeters] = useState(() =>
    Object.fromEntries(
      [...BAY_L_CHANNELS, ...BAY_C_CHANNELS].map((c) => [c, 20 + Math.random() * 70])
    )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMeters((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          const delta = (Math.random() - 0.5) * 30;
          next[k] = Math.max(5, Math.min(100, next[k] + delta));
        });
        return next;
      });
    }, 280);
    return () => clearInterval(interval);
  }, []);

  const setFader = (ch, value) => {
    setFaders((prev) => ({ ...prev, [ch]: Math.max(0, Math.min(100, value)) }));
  };

  return (
    <div className={`${styles.dm7} ${className}`.trim()}>
      {/* ═══════════ TOP BAR ═══════════ */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandYamaha}>YAMAHA</span>
          <span className={styles.brandModel}>DM7</span>
        </div>

        <div className={styles.topButtons}>
          {["HOME", "FADER BANK", "SENDS ON FADER", "ENCODER MODE", "SHIFT"].map((b) => (
            <button key={b} type="button" className={styles.topBtn}>
              {b}
            </button>
          ))}
        </div>

        <div className={styles.topRight}>
          <span className={styles.led} data-on="true" />
          <span className={styles.topLabel}>POWER</span>
          <span className={styles.led} data-on="true" data-color="green" />
          <span className={styles.topLabel}>DANTE</span>
        </div>
      </div>

      {/* ═══════════ SCREEN SECTION ═══════════ */}
      <div className={styles.screenSection}>
        {/* Écran utilitaire 7" */}
        <div className={styles.utilityScreen}>
          <div className={styles.screenHeader}>
            <span className={styles.screenDot} />
            <span className={styles.screenTitle}>UTILITY</span>
            <span className={styles.screenClock}>00:00:00</span>
          </div>
          <div className={styles.utilityContent}>
            <div className={styles.utilityRow}>
              <span>SCENE</span>
              <span className={styles.utilityValue}>001 · INITIAL</span>
            </div>
            <div className={styles.utilityRow}>
              <span>BANK</span>
              <span className={styles.utilityValue}>A · 1-12</span>
            </div>
            <div className={styles.utilityRow}>
              <span>INPUT</span>
              <span className={styles.utilityValue}>120 ch</span>
            </div>
            <div className={styles.utilityRow}>
              <span>DANTE</span>
              <span className={styles.utilityValue}>144×144</span>
            </div>
          </div>
        </div>

        {/* Écran Bay L — 12.1" */}
        <div
          ref={(el) => (screenRefs.current[0] = el)}
          className={`${styles.bayScreen} ${activeScreen === 0 ? styles.bayScreenActive : ""}`}
          onClick={() => setActiveScreen(0)}
        >
          <div className={styles.screenHeader}>
            <span className={styles.screenDot} data-active={activeScreen === 0} />
            <span className={styles.screenTitle}>BAY L · 1-12</span>
            <span className={styles.screenMeta}>OVERVIEW</span>
          </div>
          <div className={styles.channelGrid}>
            {BAY_L_CHANNELS.map((ch) => (
              <div key={ch} className={styles.channelCell}>
                <span className={styles.channelNum}>{String(ch).padStart(2, "0")}</span>
                <div className={styles.channelMeter}>
                  <div className={styles.meterFill} style={{ height: `${meters[ch]}%` }} />
                </div>
                <span className={styles.channelName}>CH {ch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Écran Bay C — 12.1" */}
        <div
          ref={(el) => (screenRefs.current[1] = el)}
          className={`${styles.bayScreen} ${activeScreen === 1 ? styles.bayScreenActive : ""}`}
          onClick={() => setActiveScreen(1)}
        >
          <div className={styles.screenHeader}>
            <span className={styles.screenDot} data-active={activeScreen === 1} />
            <span className={styles.screenTitle}>BAY C · 13-24</span>
            <span className={styles.screenMeta}>OVERVIEW</span>
          </div>
          <div className={styles.channelGrid}>
            {BAY_C_CHANNELS.map((ch) => (
              <div key={ch} className={styles.channelCell}>
                <span className={styles.channelNum}>{String(ch).padStart(2, "0")}</span>
                <div className={styles.channelMeter}>
                  <div className={styles.meterFill} style={{ height: `${meters[ch]}%` }} />
                </div>
                <span className={styles.channelName}>CH {ch}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ ENCODER SECTION ═══════════ */}
      <div className={styles.encoderSection}>
        {[...BAY_L_CHANNELS, ...BAY_C_CHANNELS].map((ch) => (
          <div key={`enc-${ch}`} className={styles.encoderStrip}>
            <button type="button" className={styles.encBtn} data-active="false" />
            <div className={styles.encoderKnob}>
              <div className={styles.knobInner} />
            </div>
            <span className={styles.encLabel}>{ch}</span>
          </div>
        ))}
      </div>

      {/* ═══════════ CHANNEL STRIP SECTION ═══════════ */}
      <div className={styles.channelStripSection}>
        {[...BAY_L_CHANNELS, ...BAY_C_CHANNELS].map((ch) => {
          const isOn = faders[ch] > 5;
          return (
            <div key={`strip-${ch}`} className={styles.channelStrip}>
              <button
                type="button"
                className={styles.selBtn}
                data-active="false"
                aria-label={`Select channel ${ch}`}
              />
              <button
                type="button"
                className={styles.onBtn}
                data-on={isOn}
                aria-label={`Channel ${ch} on`}
              />
              <button
                type="button"
                className={styles.cueBtn}
                aria-label={`Cue channel ${ch}`}
              />
            </div>
          );
        })}
      </div>

      {/* ═══════════ FADER SECTION ═══════════ */}
      <div className={styles.faderSection}>
        {/* Bay L + Bay C faders */}
        <div className={styles.faderBank}>
          {[...BAY_L_CHANNELS, ...BAY_C_CHANNELS].map((ch) => (
            <Fader
              key={`fader-${ch}`}
              value={faders[ch]}
              onChange={(v) => setFader(ch, v)}
              label={String(ch)}
            />
          ))}
        </div>

        {/* Main faders (4) */}
        <div className={styles.mainFaderBank}>
          <span className={styles.mainLabel}>MAIN</span>
          {MAIN_CHANNELS.map((ch) => (
            <Fader
              key={`main-${ch}`}
              value={faders[ch]}
              onChange={(v) => setFader(ch, v)}
              label={ch}
              isMain
            />
          ))}
        </div>
      </div>

      {/* ═══════════ BOTTOM BAR ═══════════ */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomLeft}>
          <span className={styles.statusDot} data-on="true" />
          <span className={styles.statusText}>READY</span>
        </div>
        <div className={styles.bottomCenter}>
          <span className={styles.bottomInfo}>28 FADERS · 120 INPUTS · DANTE 144×144</span>
        </div>
        <div className={styles.bottomRight}>
          <span className={styles.bottomInfo}>YAMAHA DM7</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Fader réutilisable ─── */
function Fader({ value, onChange, label, isMain = false }) {
  const trackRef = useRef(null);

  const handlePointer = (e) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = 1 - (e.clientY - rect.top) / rect.height;
    onChange(Math.round(ratio * 100));
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    handlePointer(e);
    const move = (ev) => handlePointer(ev);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className={`${styles.fader} ${isMain ? styles.faderMain : ""}`}>
      <div
        ref={trackRef}
        className={styles.faderTrack}
        onPointerDown={onPointerDown}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={`Fader ${label}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onChange(Math.min(100, value + 2));
          if (e.key === "ArrowDown") onChange(Math.max(0, value - 2));
        }}
      >
        <div className={styles.faderRail} />
        <div className={styles.faderFill} style={{ height: `${value}%` }} />
        <div className={styles.faderCap} style={{ bottom: `calc(${value}% - 8px)` }}>
          <div className={styles.faderCapLine} />
        </div>
      </div>
      <span className={styles.faderLabel}>{label}</span>
    </div>
  );
}