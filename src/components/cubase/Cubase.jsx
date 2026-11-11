import { useEffect, useRef, useState } from "react";
import styles from "./Cubase.module.css";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const TOTAL_BARS = 32;

const TRACKS = [
  { id: 1, name: "Drums", type: "instrument", color: "#e74c3c", icon: "♬" },
  { id: 2, name: "Bass", type: "audio", color: "#e67e22", icon: "◐" },
  { id: 3, name: "Guitar L", type: "audio", color: "#f1c40f", icon: "◐" },
  { id: 4, name: "Guitar R", type: "audio", color: "#2ecc71", icon: "◐" },
  { id: 5, name: "Piano", type: "instrument", color: "#3498db", icon: "♬" },
  { id: 6, name: "Strings", type: "instrument", color: "#9b59b6", icon: "♬" },
  { id: 7, name: "Lead Vox", type: "audio", color: "#e91e63", icon: "◐" },
  { id: 8, name: "Back Vox", type: "audio", color: "#ff5722", icon: "◐" },
  { id: 9, name: "FX Riser", type: "audio", color: "#00bcd4", icon: "◐" },
  { id: 10, name: "Group Drums", type: "group", color: "#795548", icon: "⊗" },
];

const EVENTS = [
  { trackId: 1, start: 0, length: 8 },
  { trackId: 1, start: 8, length: 8 },
  { trackId: 1, start: 16, length: 8 },
  { trackId: 1, start: 24, length: 8 },
  { trackId: 2, start: 0, length: 32 },
  { trackId: 3, start: 8, length: 16 },
  { trackId: 4, start: 8, length: 16 },
  { trackId: 5, start: 4, length: 24 },
  { trackId: 6, start: 12, length: 20 },
  { trackId: 7, start: 16, length: 12 },
  { trackId: 8, start: 20, length: 8 },
  { trackId: 9, start: 28, length: 4 },
];

const PIANO_NOTES = [
  { row: 3, col: 0, len: 3, color: "#3498db" },
  { row: 5, col: 3, len: 2, color: "#3498db" },
  { row: 7, col: 5, len: 4, color: "#3498db" },
  { row: 4, col: 9, len: 2, color: "#3498db" },
  { row: 6, col: 12, len: 3, color: "#3498db" },
  { row: 8, col: 15, len: 2, color: "#3498db" },
  { row: 10, col: 0, len: 4, color: "#9b59b6" },
  { row: 11, col: 6, len: 4, color: "#9b59b6" },
  { row: 9, col: 12, len: 5, color: "#9b59b6" },
];

const CHORD_PADS = [
  { name: "Cmaj7", notes: [0, 4, 7, 11] },
  { name: "Am7", notes: [0, 3, 7, 10] },
  { name: "Fmaj7", notes: [0, 4, 7, 11] },
  { name: "G7", notes: [0, 4, 7, 10] },
  { name: "Dm7", notes: [0, 3, 7, 10] },
  { name: "Em7", notes: [0, 3, 7, 10] },
  { name: "Am", notes: [0, 3, 7] },
  { name: "F", notes: [0, 4, 7] },
  { name: "C", notes: [0, 4, 7] },
  { name: "G", notes: [0, 4, 7] },
  { name: "Dm", notes: [0, 3, 7] },
  { name: "Em", notes: [0, 3, 7] },
  { name: "Bdim", notes: [0, 3, 6] },
  { name: "Bb", notes: [0, 4, 7] },
  { name: "Eb", notes: [0, 4, 7] },
  { name: "Ab", notes: [0, 4, 7] },
];

// ═══════════════════════════════════════════════════════════════════
// WAVEFORM
// ═══════════════════════════════════════════════════════════════════
function Waveform({ seed }) {
  const numBars = 60;
  const bars = [];
  let s = seed;
  for (let i = 0; i < numBars; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const h = (0.2 + r * 0.8) * 92;
    bars.push(h);
  }
  return (
    <svg viewBox={`0 0 ${numBars} 100`} preserveAspectRatio="none" className={styles.waveform}>
      {bars.map((h, i) => (
        <rect key={i} x={i + 0.2} y={50 - h / 2} width={0.6} height={h} fill="currentColor" />
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function Cubase({ className = "" }) {
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cycle, setCycle] = useState(true);
  const [playhead, setPlayhead] = useState(4);
  const [bpm, setBpm] = useState(128);
  const [tool, setTool] = useState("select");
  const [selectedTrack, setSelectedTrack] = useState(1);
  const [lowerZone, setLowerZone] = useState("keyeditor");
  const [tracks, setTracks] = useState(() =>
    TRACKS.reduce((a, t) => ({ ...a, [t.id]: { mute: false, solo: false, rec: t.type === "audio", vol: 72, pan: 0 } }), {})
  );

  const trackAreaRef = useRef(null);

  // Playhead
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const next = p + (bpm / 60) * 0.08;
        if (next >= TOTAL_BARS) return cycle ? 0 : TOTAL_BARS;
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [playing, bpm, cycle]);

  const setTrack = (id, patch) =>
    setTracks((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const bar = Math.floor(playhead) + 1;
  const beat = Math.floor((playhead % 1) * 4) + 1;
  const tick = Math.floor(((playhead * 4) % 1) * 480);

  return (
    <div className={`${styles.cubase} ${className}`.trim()}>

      {/* ═══════════ MENU BAR ═══════════ */}
      <div className={styles.menuBar}>
        <div className={styles.menuLeft}>
          {["Projet", "Édition", "Audio", "MIDI", "Média", "Transport", "Périphériques", "Fenêtre", "Aide"].map((m) => (
            <button key={m} type="button" className={styles.menuItem}>{m}</button>
          ))}
        </div>
        <div className={styles.menuRight}>
          <span className={styles.projectName}>Project: <strong>Untitled-01</strong></span>
          <span className={styles.projectInfo}>48 kHz · 24 bit · Steinberg</span>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className={styles.toolbar}>

        {/* Transport */}
        <div className={styles.transport}>
          <button type="button" className={styles.tBtn} onClick={() => setPlayhead(0)} title="Return to Zero">⏮</button>
          <button type="button" className={styles.tBtn} title="Rewind">◀◀</button>
          <button type="button" className={styles.tBtn} title="Forward">▶▶</button>
          <button
            type="button"
            className={`${styles.tBtn} ${styles.stopBtn}`}
            onClick={() => { setPlaying(false); setRecording(false); }}
          >■</button>
          <button
            type="button"
            className={`${styles.tBtn} ${styles.playBtn} ${playing ? styles.playBtnActive : ""}`}
            onClick={() => setPlaying(true)}
          >▶</button>
          <button
            type="button"
            className={`${styles.tBtn} ${styles.recBtn} ${recording ? styles.recBtnActive : ""}`}
            onClick={() => { setRecording(true); setPlaying(true); }}
          >●</button>
          <button
            type="button"
            className={`${styles.tBtn} ${cycle ? styles.cycleActive : ""}`}
            onClick={() => setCycle((c) => !c)}
            title="Cycle"
          >⟲</button>
        </div>

        {/* Time Display */}
        <div className={styles.timeDisplay}>
          <div className={styles.timeMain}>
            {String(bar).padStart(3, "0")} | {beat} | {String(tick).padStart(3, "0")}
          </div>
          <div className={styles.timeSub}>TIME 00:00:{String(Math.floor(playhead * 2)).padStart(2, "0")}.00</div>
        </div>

        {/* Tempo */}
        <div className={styles.tempoBlock}>
          <div className={styles.tempoLabel}>TEMPO</div>
          <div className={styles.tempoRow}>
            <button type="button" className={styles.tempoBtn} onClick={() => setBpm((b) => Math.max(40, b - 1))}>−</button>
            <span className={styles.tempoValue}>{bpm.toFixed(3)}</span>
            <button type="button" className={styles.tempoBtn} onClick={() => setBpm((b) => Math.min(240, b + 1))}>+</button>
          </div>
        </div>

        {/* Tools */}
        <div className={styles.tools}>
          <div className={styles.toolLabel}>TOOLS</div>
          <div className={styles.toolRow}>
            {[
              { id: "select", icon: "➤", title: "Sélection" },
              { id: "range", icon: "▭", title: "Plage" },
              { id: "split", icon: "✂", title: "Scinder" },
              { id: "glue", icon: "⊃", title: "Coller" },
              { id: "erase", icon: "⊗", title: "Gomme" },
              { id: "zoom", icon: "⊕", title: "Zoom" },
              { id: "mute", icon: "×", title: "Mute" },
              { id: "draw", icon: "✎", title: "Dessin" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.toolBtn} ${tool === t.id ? styles.toolBtnActive : ""}`}
                onClick={() => setTool(t.id)}
                title={t.title}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Right zone toggle */}
        <div className={styles.zoneToggles}>
          <div className={styles.zoneLabel}>ZONES</div>
          <div className={styles.zoneRow}>
            <button type="button" className={styles.zoneBtn} title="Inspecteur">ℹ</button>
            <button type="button" className={styles.zoneBtnActive} title="MixConsole">▤</button>
            <button type="button" className={styles.zoneBtn} title="Média">📁</button>
            <button type="button" className={styles.zoneBtn} title="Chords">♬</button>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN AREA ═══════════ */}
      <div className={styles.mainArea}>

        {/* ═══ INSPECTOR (gauche) ═══ */}
        <aside className={styles.inspector}>
          <div className={styles.inspectorHeader}>
            <span className={styles.inspectorTitle}>INSPECTEUR</span>
          </div>
          <div className={styles.inspectorBody}>
            <div className={styles.inspectorSection}>
              <div className={styles.sectionLabel}>Piste sélectionnée</div>
              <div className={styles.selectedTrack}>
                <span className={styles.selTrackColor} style={{ background: TRACKS.find(t => t.id === selectedTrack)?.color }} />
                <span>{TRACKS.find(t => t.id === selectedTrack)?.name}</span>
              </div>
            </div>
            <div className={styles.inspectorSection}>
              <div className={styles.sectionLabel}>Routage</div>
              <div className={styles.routeRow}>
                <span>Entrée</span>
                <span className={styles.routeValue}>All MIDI Inputs</span>
              </div>
              <div className={styles.routeRow}>
                <span>Sortie</span>
                <span className={styles.routeValue}>Stereo Out</span>
              </div>
            </div>
            <div className={styles.inspectorSection}>
              <div className={styles.sectionLabel}>Inserts</div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.insertSlot}>
                  {i === 1 ? "Studio EQ" : i === 2 ? "Compressor" : "—"}
                </div>
              ))}
            </div>
            <div className={styles.inspectorSection}>
              <div className={styles.sectionLabel}>Sends</div>
              {[1, 2].map((i) => (
                <div key={i} className={styles.insertSlot}>
                  {i === 1 ? "Reverb" : "Delay"}
                </div>
              ))}
            </div>
            <div className={styles.inspectorSection}>
              <div className={styles.sectionLabel}>Volume / Pan</div>
              <div className={styles.volPanRow}>
                <div className={styles.volKnob} />
                <div className={styles.panKnob} />
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ CENTER : PROJECT WINDOW ═══ */}
        <div className={styles.project}>

          {/* Track controls header */}
          <div className={styles.trackControls}>
            <div className={styles.trackControlsHeader}>
              <span>PISTES</span>
              <span className={styles.trackCount}>{TRACKS.length}</span>
            </div>
            {TRACKS.map((track) => {
              const ts = tracks[track.id];
              const sel = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  className={`${styles.trackHeader} ${sel ? styles.trackHeaderSelected : ""}`}
                  style={{ "--tc": track.color }}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className={styles.trackColorBar} />
                  <div className={styles.trackIcon}>{track.icon}</div>
                  <div className={styles.trackName}>
                    <span className={styles.tName}>{track.name}</span>
                    <span className={styles.tType}>{track.type.toUpperCase()}</span>
                  </div>
                  <div className={styles.trackBtns}>
                    <button
                      type="button"
                      className={`${styles.tBtn2} ${styles.muteBtn} ${ts.mute ? styles.activeMute : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { mute: !ts.mute }); }}
                    >M</button>
                    <button
                      type="button"
                      className={`${styles.tBtn2} ${styles.soloBtn} ${ts.solo ? styles.activeSolo : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { solo: !ts.solo }); }}
                    >S</button>
                    <button
                      type="button"
                      className={`${styles.tBtn2} ${styles.recBtn2} ${ts.rec ? styles.activeRec : ""}`}
                      onClick={(e) => { e.stopPropagation(); setTrack(track.id, { rec: !ts.rec }); }}
                    >●</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            {/* Ruler */}
            <div
              className={styles.ruler}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPlayhead(Math.max(0, Math.min(TOTAL_BARS, ((e.clientX - rect.left) / rect.width) * TOTAL_BARS)));
              }}
            >
              {Array.from({ length: TOTAL_BARS }).map((_, i) => (
                <div key={i} className={`${styles.rulerBar} ${(i + 1) % 4 === 0 ? styles.rulerBarMajor : ""}`}>
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div className={styles.playhead} style={{ left: `${(playhead / TOTAL_BARS) * 100}%` }}>
              <div className={styles.playheadTop} />
              <div className={styles.playheadLine} />
            </div>

            {/* Tracks */}
            <div className={styles.tracksArea} ref={trackAreaRef}>
              {TRACKS.map((track) => {
                const events = EVENTS.filter((e) => e.trackId === track.id);
                const sel = selectedTrack === track.id;
                return (
                  <div
                    key={track.id}
                    className={`${styles.trackRow} ${sel ? styles.trackRowSelected : ""}`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    {events.map((ev, i) => (
                      <div
                        key={i}
                        className={styles.event}
                        style={{
                          left: `${(ev.start / TOTAL_BARS) * 100}%`,
                          width: `${(ev.length / TOTAL_BARS) * 100}%`,
                          background: `linear-gradient(180deg, ${track.color}ee 0%, ${track.color}99 100%)`,
                          borderColor: track.color,
                          color: track.color,
                        }}
                      >
                        <div className={styles.eventHeader}>
                          <span className={styles.eventName}>{track.name}_{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <Waveform seed={track.id * 131 + i * 17} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ LOWER ZONE : KEY EDITOR / MIXCONSOLE / CHORDS ═══════════ */}
      <div className={styles.lowerZone}>

        {/* Tab bar */}
        <div className={styles.lowerTabs}>
          {[
            { id: "keyeditor", label: "ÉDITEUR LOGICIEL", icon: "♪" },
            { id: "mixconsole", label: "MIXCONSOLE", icon: "▤" },
            { id: "chords", label: "CHORD PADS", icon: "♬" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.lowerTab} ${lowerZone === tab.id ? styles.lowerTabActive : ""}`}
              onClick={() => setLowerZone(tab.id)}
            >
              <span className={styles.lowerTabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div className={styles.lowerTabsRight}>
            <span className={styles.lowerInfo}>Grille: 1/16 · Quantize: 1/16</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.lowerContent}>

          {/* KEY EDITOR */}
          {lowerZone === "keyeditor" && (
            <div className={styles.keyEditor}>
              {/* Piano keys */}
              <div className={styles.pianoKeysCol}>
                {[
                  { note: "C5", black: false }, { note: "B4", black: true },
                  { note: "A#4", black: true }, { note: "A4", black: false },
                  { note: "G#4", black: true }, { note: "G4", black: false },
                  { note: "F#4", black: true }, { note: "F4", black: false },
                  { note: "E4", black: false }, { note: "D#4", black: true },
                  { note: "D4", black: false }, { note: "C#4", black: true },
                  { note: "C4", black: false },
                ].map((k, i) => (
                  <div
                    key={i}
                    className={`${styles.pKey} ${k.black ? styles.pKeyBlack : styles.pKeyWhite}`}
                  >
                    {k.note}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className={styles.pianoGrid}>
                {Array.from({ length: 13 }).map((_, r) => (
                  <div key={r} className={styles.pRow} />
                ))}
                <div className={styles.pianoCols}>
                  {Array.from({ length: 16 }).map((_, c) => (
                    <div
                      key={c}
                      className={`${styles.pCol} ${c % 4 === 0 ? styles.pColBeat : ""} ${
                        Math.floor((playhead % TOTAL_BARS) * 16 / TOTAL_BARS) === c ? styles.pColCurrent : ""
                      }`}
                    />
                  ))}
                </div>
                {PIANO_NOTES.map((n, i) => (
                  <div
                    key={i}
                    className={styles.pianoNote}
                    style={{
                      top: `${(n.row / 13) * 100}%`,
                      left: `${(n.col / 16) * 100}%`,
                      width: `${(n.len / 16) * 100}%`,
                      height: `${(1 / 13) * 100}%`,
                      background: n.color,
                      boxShadow: `0 0 6px ${n.color}`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* MIXCONSOLE */}
          {lowerZone === "mixconsole" && (
            <div className={styles.mixConsole}>
              {TRACKS.slice(0, 10).map((track) => {
                const ts = tracks[track.id];
                return (
                  <div key={track.id} className={styles.mixStrip} style={{ "--mc": track.color }}>
                    <div className={styles.mixInserts}>
                      {["EQ", "Comp", "", ""].map((p, i) => (
                        <div key={i} className={`${styles.mixInsert} ${p ? styles.mixInsertFilled : ""}`}>
                          {p || "—"}
                        </div>
                      ))}
                    </div>
                    <div className={styles.mixPanRow}>
                      <span className={styles.mixPanLabel}>PAN</span>
                      <div className={styles.mixPanKnob}>
                        <div className={styles.mixPanIndicator} />
                      </div>
                    </div>
                    <div className={styles.mixFaderArea}>
                      <div className={styles.mixMeter}>
                        {Array.from({ length: 20 }).map((_, i) => {
                          const active = playing && !ts.mute &&
                            20 - i < 6 + ((track.id + Math.floor(playhead * 4)) % 10);
                          return (
                            <div
                              key={i}
                              className={styles.mixMeterSeg}
                              data-active={active ? "true" : "false"}
                              data-color={i < 2 ? "red" : i < 8 ? "amber" : "green"}
                            />
                          );
                        })}
                      </div>
                      <div className={styles.mixFaderTrack}>
                        <div className={styles.mixFaderFill} style={{ height: `${ts.vol}%` }} />
                        <div className={styles.mixFaderCap} style={{ bottom: `calc(${ts.vol}% - 8px)` }} />
                      </div>
                    </div>
                    <div className={styles.mixBtns}>
                      <button
                        type="button"
                        className={`${styles.mixBtn} ${ts.mute ? styles.activeMute : ""}`}
                        onClick={(e) => { e.stopPropagation(); setTrack(track.id, { mute: !ts.mute }); }}
                      >M</button>
                      <button
                        type="button"
                        className={`${styles.mixBtn} ${ts.solo ? styles.activeSolo : ""}`}
                        onClick={(e) => { e.stopPropagation(); setTrack(track.id, { solo: !ts.solo }); }}
                      >S</button>
                    </div>
                    <div className={styles.mixName}>{track.name}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHORD PADS */}
          {lowerZone === "chords" && (
            <div className={styles.chordPads}>
              <div className={styles.chordHeader}>
                <span className={styles.chordSection}>CHORD PADS</span>
                <span className={styles.chordVoicing}>Voicing: Piano · Octave: C3</span>
              </div>
              <div className={styles.chordGrid}>
                {CHORD_PADS.map((chord, i) => (
                  <button key={i} type="button" className={styles.chordPad}>
                    <span className={styles.chordName}>{chord.name}</span>
                    <span className={styles.chordNotes}>
                      {chord.notes.map((n, j) => (
                        <span key={j} className={styles.chordNoteDot} />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ STATUS BAR ═══════════ */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.statusLed} data-active={playing} data-rec={recording} />
          <span className={styles.statusText}>
            {recording ? "ENREGISTREMENT" : playing ? "LECTURE" : "ARRÊT"}
          </span>
          {cycle && <span className={styles.statusTag}>CYCLE</span>}
        </div>
        <div className={styles.statusCenter}>
          <span>Outil: {tool.toUpperCase()}</span>
          <span>Grille: 1/16</span>
          <span>Snap: Bar</span>
        </div>
        <div className={styles.statusRight}>
          Cubase Pro 14 · Steinberg
        </div>
      </div>
    </div>
  );
}