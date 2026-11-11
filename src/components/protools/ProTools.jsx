import { useEffect, useRef, useState } from "react";
import styles from "./ProTools.module.css";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const TOTAL_BARS = 24;

const TRACKS = [
  { id: 1, name: "Kick", type: "audio", color: "#c0392b" },
  { id: 2, name: "Snare", type: "audio", color: "#d35400" },
  { id: 3, name: "Bass DI", type: "audio", color: "#f39c12" },
  { id: 4, name: "Gtr L", type: "audio", color: "#27ae60" },
  { id: 5, name: "Gtr R", type: "audio", color: "#16a085" },
  { id: 6, name: "Vocals", type: "audio", color: "#2980b9" },
  { id: 7, name: "Piano", type: "instrument", color: "#8e44ad" },
  { id: 8, name: "Pad", type: "instrument", color: "#c2185b" },
  { id: 9, name: "Reverb", type: "aux", color: "#795548" },
  { id: 10, name: "Master", type: "master", color: "#95a5a6" },
];

const CLIPS = [
  { trackId: 1, start: 0, length: 8 },
  { trackId: 1, start: 8, length: 8 },
  { trackId: 1, start: 16, length: 8 },
  { trackId: 2, start: 4, length: 4 },
  { trackId: 2, start: 12, length: 4 },
  { trackId: 2, start: 20, length: 4 },
  { trackId: 3, start: 0, length: 24 },
  { trackId: 4, start: 8, length: 12 },
  { trackId: 5, start: 8, length: 12 },
  { trackId: 6, start: 16, length: 8 },
  { trackId: 6, start: 4, length: 8 },
  { trackId: 7, start: 4, length: 16 },
  { trackId: 8, start: 0, length: 24 },
];

// ═══════════════════════════════════════════════════════════════════
// WAVEFORM
// ═══════════════════════════════════════════════════════════════════
function Waveform({ seed, color }) {
  const bars = [];
  const numBars = 80;
  let s = seed;

  for (let i = 0; i < numBars; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const centerBias = Math.abs(i - numBars / 2) / numBars;
    const h = (0.15 + r * 0.85) * (1 - centerBias * 0.3) * 90;
    bars.push(h);
  }

  return (
    <svg
      viewBox={`0 0 ${numBars} 100`}
      preserveAspectRatio="none"
      className={styles.waveform}
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i + 0.15}
          y={50 - h / 2}
          width={0.7}
          height={h}
          fill={color}
        />
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function ProTools({ className = "" }) {
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playhead, setPlayhead] = useState(4);
  const [bpm, setBpm] = useState(120);
  const [activeView, setActiveView] = useState("edit");
  const [selectedTrack, setSelectedTrack] = useState(1);
  const [editMode, setEditMode] = useState("slip");
  const [editTool, setEditTool] = useState("selector");
  const [timeMode, setTimeMode] = useState("bars");
  const [loop, setLoop] = useState(false);
  const [trackStates, setTrackStates] = useState(() =>
    TRACKS.reduce(
      (acc, t) => ({ ...acc, [t.id]: { mute: false, solo: false, rec: false, vol: 72 } }),
      {}
    )
  );

  const timelineRef = useRef(null);

  // Playhead
  useEffect(() => {
    if (!playing) return;
    const speed = (bpm / 60) / 4; // bars per 100ms
    const id = setInterval(() => {
      setPlayhead((p) => {
        const next = p + speed * 0.1;
        if (next >= TOTAL_BARS) return loop ? 0 : TOTAL_BARS;
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, bpm, loop]);

  const setTrack = (id, patch) =>
    setTrackStates((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const handleRulerClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setPlayhead(Math.max(0, Math.min(TOTAL_BARS, ratio * TOTAL_BARS)));
  };

  const barToTime = (bar) => {
    const totalSec = (bar * 4 * 60) / bpm;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 1000);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  const currentBar = Math.floor(playhead) + 1;
  const currentBeat = Math.floor((playhead % 1) * 4) + 1;
  const currentTick = Math.floor(((playhead * 4) % 1) * 960);

  return (
    <div className={`${styles.pt} ${className}`.trim()}>

      {/* ═══════════════════════════════════════════════════════
          MENU BAR
         ═══════════════════════════════════════════════════════ */}
      <div className={styles.menuBar}>
        <div className={styles.menuLeft}>
          {["File", "Edit", "View", "Track", "Clip", "Event", "AudioSuite", "Options", "Setup", "Window", "Help"].map((m) => (
            <button key={m} type="button" className={styles.menuItem}>{m}</button>
          ))}
        </div>
        <div className={styles.menuRight}>
          <span className={styles.sessionName}>Session: <strong>MonProjet.ptx</strong></span>
          <span className={styles.sessionSampleRate}>48 kHz · 24-bit</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TOOLBAR
         ═══════════════════════════════════════════════════════ */}
      <div className={styles.toolbar}>

        {/* Transport */}
        <div className={styles.transportGroup}>
          <button
            type="button"
            className={styles.transportBtn}
            onClick={() => setPlayhead(0)}
            title="Return to Zero"
          >
            ⏮
          </button>
          <button type="button" className={styles.transportBtn} title="Rewind">◀◀</button>
          <button type="button" className={styles.transportBtn} title="Fast Forward">▶▶</button>
          <button
            type="button"
            className={`${styles.transportBtn} ${styles.stopBtn}`}
            onClick={() => { setPlaying(false); setRecording(false); }}
            title="Stop"
          >
            ■
          </button>
          <button
            type="button"
            className={`${styles.transportBtn} ${styles.playBtn} ${playing ? styles.playBtnActive : ""}`}
            onClick={() => { setPlaying(true); setRecording(false); }}
            title="Play"
          >
            ▶
          </button>
          <button
            type="button"
            className={`${styles.transportBtn} ${styles.recBtn} ${recording ? styles.recBtnActive : ""}`}
            onClick={() => { setRecording(true); setPlaying(true); }}
            title="Record"
          >
            ●
          </button>
          <button
            type="button"
            className={`${styles.transportBtn} ${loop ? styles.loopBtnActive : ""}`}
            onClick={() => setLoop((l) => !l)}
            title="Loop Playback"
          >
            ⟲
          </button>
        </div>

        {/* Time Display */}
        <div
          className={styles.timeDisplay}
          onClick={() => setTimeMode((m) => (m === "bars" ? "time" : "bars"))}
          title="Click to toggle Bars|Beats / Min:Sec"
        >
          <div className={styles.timeBig}>
            {timeMode === "bars"
              ? `${String(currentBar).padStart(3, "0")}|${currentBeat}|${String(currentTick).padStart(3, "0")}`
              : barToTime(playhead)}
          </div>
          <div className={styles.timeSmall}>
            {timeMode === "bars" ? barToTime(playhead) : `${String(currentBar).padStart(3, "0")}|${currentBeat}`}
          </div>
          <div className={styles.timeBpm}>{bpm} BPM</div>
        </div>

        {/* Tempo */}
        <div className={styles.tempoBlock}>
          <div className={styles.blockLabel}>TEMPO</div>
          <div className={styles.tempoControls}>
            <button type="button" onClick={() => setBpm((b) => Math.max(40, b - 1))} className={styles.tempoBtn}>−</button>
            <span className={styles.tempoValue}>{bpm}</span>
            <button type="button" onClick={() => setBpm((b) => Math.min(240, b + 1))} className={styles.tempoBtn}>+</button>
          </div>
        </div>

        {/* Edit Modes */}
        <div className={styles.modesBlock}>
          <div className={styles.blockLabel}>EDIT MODES</div>
          <div className={styles.modesRow}>
            {["shuffle", "spot", "slip", "grid"].map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.modeBtn} ${editMode === m ? styles.modeBtnActive : ""}`}
                onClick={() => setEditMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Tools */}
        <div className={styles.toolsBlock}>
          <div className={styles.blockLabel}>TOOLS</div>
          <div className={styles.toolsRow}>
            {[
              { id: "zoom", label: "Zoom", icon: "🔍" },
              { id: "trim", label: "Trim", icon: "⌐" },
              { id: "selector", label: "Selector", icon: "I" },
              { id: "grabber", label: "Grabber", icon: "✋" },
              { id: "scrubber", label: "Scrub", icon: "👂" },
              { id: "pencil", label: "Pencil", icon: "✏" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.toolBtn} ${editTool === t.id ? styles.toolBtnActive : ""}`}
                onClick={() => setEditTool(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewBtn} ${activeView === "edit" ? styles.viewBtnActive : ""}`}
            onClick={() => setActiveView("edit")}
          >
            EDIT
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${activeView === "mix" ? styles.viewBtnActive : ""}`}
            onClick={() => setActiveView("mix")}
          >
            MIX
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          EDIT VIEW
         ═══════════════════════════════════════════════════════ */}
      {activeView === "edit" && (
        <div className={styles.editView}>
          {/* Track List (left) */}
          <div className={styles.trackList}>
            <div className={styles.trackListHeader}>
              <span>TRACKS</span>
              <span className={styles.trackCount}>{TRACKS.length}</span>
            </div>
            {TRACKS.map((track) => {
              const ts = trackStates[track.id];
              const isSelected = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  className={`${styles.trackHeader} ${isSelected ? styles.trackHeaderSelected : ""}`}
                  onClick={() => setSelectedTrack(track.id)}
                  style={{ "--track-color": track.color }}
                >
                  <div className={styles.trackColorBar} />
                  <div className={styles.trackInfo}>
                    <span className={styles.trackName}>{track.name}</span>
                    <span className={styles.trackType}>{track.type.toUpperCase()}</span>
                  </div>
                  <div className={styles.trackButtons}>
                    <button
                      type="button"
                      className={`${styles.trackBtn} ${styles.muteBtn} ${ts.mute ? styles.active : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { mute: !ts.mute }); }}
                      title="Mute"
                    >M</button>
                    <button
                      type="button"
                      className={`${styles.trackBtn} ${styles.soloBtn} ${ts.solo ? styles.active : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { solo: !ts.solo }); }}
                      title="Solo"
                    >S</button>
                    <button
                      type="button"
                      className={`${styles.trackBtn} ${styles.recBtnSmall} ${ts.rec ? styles.active : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { rec: !ts.rec }); }}
                      title="Record Enable"
                    >●</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className={styles.timelineArea} ref={timelineRef}>

            {/* Ruler */}
            <div className={styles.ruler} onClick={handleRulerClick}>
              {Array.from({ length: TOTAL_BARS }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.rulerBar} ${(i + 1) % 4 === 0 ? styles.rulerBarMajor : ""}`}
                >
                  <span className={styles.rulerNumber}>{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className={styles.playhead}
              style={{ left: `${(playhead / TOTAL_BARS) * 100}%` }}
            >
              <div className={styles.playheadFlag} />
              <div className={styles.playheadLine} />
            </div>

            {/* Tracks with clips */}
            <div className={styles.tracksContainer}>
              {TRACKS.map((track) => {
                const clips = CLIPS.filter((c) => c.trackId === track.id);
                const isSelected = selectedTrack === track.id;
                return (
                  <div
                    key={track.id}
                    className={`${styles.trackRow} ${isSelected ? styles.trackRowSelected : ""}`}
                    style={{ "--track-color": track.color }}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    {clips.map((clip, i) => (
                      <div
                        key={i}
                        className={styles.clip}
                        style={{
                          left: `${(clip.start / TOTAL_BARS) * 100}%`,
                          width: `${(clip.length / TOTAL_BARS) * 100}%`,
                          background: `linear-gradient(180deg, ${track.color}dd 0%, ${track.color}88 100%)`,
                          borderColor: track.color,
                        }}
                      >
                        <div className={styles.clipHeader}>
                          <span className={styles.clipName}>{track.name}_{String(i + 1).padStart(2, "0")}</span>
                          <span className={styles.clipFade}>◢</span>
                        </div>
                        <Waveform seed={track.id * 137 + i * 31} color={`${track.color}ff`} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MIX VIEW
         ═══════════════════════════════════════════════════════ */}
      {activeView === "mix" && (
        <div className={styles.mixView}>
          <div className={styles.mixStrips}>
            {TRACKS.map((track) => {
              const ts = trackStates[track.id];
              const isSelected = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  className={`${styles.mixStrip} ${isSelected ? styles.mixStripSelected : ""}`}
                  style={{ "--track-color": track.color }}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  {/* Insert section */}
                  <div className={styles.mixInserts}>
                    {["EQ3 7-Band", "Compressor", "", "", ""].map((plug, i) => (
                      <div
                        key={i}
                        className={`${styles.insertSlot} ${plug ? styles.insertSlotFilled : ""}`}
                      >
                        {plug || "—"}
                      </div>
                    ))}
                  </div>

                  {/* Sends */}
                  <div className={styles.mixSends}>
                    <div className={styles.sendSlot}>
                      <span className={styles.sendLabel}>A</span>
                      <span className={styles.sendValue}>Reverb</span>
                    </div>
                  </div>

                  {/* Pan */}
                  <div className={styles.mixPanBlock}>
                    <span className={styles.mixPanLabel}>PAN</span>
                    <div className={styles.panKnob}>
                      <div className={styles.panKnobIndicator} />
                    </div>
                    <span className={styles.mixPanValue}>C</span>
                  </div>

                  {/* Meter + Fader */}
                  <div className={styles.mixFaderArea}>
                    <div className={styles.mixMeter}>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const active =
                          playing && !ts.mute && (ts.solo || !Object.values(trackStates).some((t) => t.solo))
                            ? 24 - i < 8 + ((track.id + Math.floor(playhead * 3)) % 12)
                            : false;
                        return (
                          <div
                            key={i}
                            className={styles.meterSegment}
                            data-active={active ? "true" : "false"}
                            data-color={i < 3 ? "red" : i < 10 ? "amber" : "green"}
                          />
                        );
                      })}
                    </div>
                    <div className={styles.faderTrack}>
                      <div
                        className={styles.faderFill}
                        style={{ height: `${ts.vol}%` }}
                      />
                      <div
                        className={styles.faderCap}
                        style={{ bottom: `calc(${ts.vol}% - 8px)` }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          const startY = e.clientY;
                          const startVol = ts.vol;
                          const move = (ev) => {
                            const delta = (startY - ev.clientY) / 2;
                            const newVol = Math.max(0, Math.min(100, startVol + delta));
                            setTrack(track.id, { vol: newVol });
                          };
                          const up = () => {
                            window.removeEventListener("pointermove", move);
                            window.removeEventListener("pointerup", up);
                          };
                          window.addEventListener("pointermove", move);
                          window.addEventListener("pointerup", up);
                        }}
                      />
                    </div>
                  </div>

                  {/* Mute/Solo */}
                  <div className={styles.mixButtons}>
                    <button
                      type="button"
                      className={`${styles.mixSmallBtn} ${ts.mute ? styles.muteActive : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { mute: !ts.mute }); }}
                    >M</button>
                    <button
                      type="button"
                      className={`${styles.mixSmallBtn} ${ts.solo ? styles.soloActive : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { solo: !ts.solo }); }}
                    >S</button>
                  </div>

                  {/* Name */}
                  <div className={styles.mixName}>
                    <span className={styles.mixNameText}>{track.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STATUS BAR
         ═══════════════════════════════════════════════════════ */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span
            className={styles.statusLed}
            data-active={playing ? "true" : "false"}
            data-rec={recording ? "true" : "false"}
          />
          <span className={styles.statusText}>
            {recording ? "RECORDING" : playing ? "PLAYING" : "STOPPED"}
          </span>
          {loop && <span className={styles.statusTag}>LOOP</span>}
        </div>
        <div className={styles.statusCenter}>
          <span>Mode: {editMode.toUpperCase()}</span>
          <span>Tool: {editTool.toUpperCase()}</span>
          <span>Grid: 1/16</span>
          <span>Nudge: 1/4</span>
        </div>
        <div className={styles.statusRight}>
          Pro Tools 2024 · Studio
        </div>
      </div>
    </div>
  );
}