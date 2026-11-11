import { useEffect, useRef, useState } from "react";
import styles from "./FruityLoops.module.css";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const CHANNELS = [
  { id: "kick", name: "Kick", color: "#ff5533", pattern: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] },
  { id: "snare", name: "Snare", color: "#ffaa33", pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] },
  { id: "hat", name: "Hi-Hat", color: "#ffdd44", pattern: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
  { id: "clap", name: "Clap", color: "#66ddaa", pattern: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] },
  { id: "bass", name: "Bass", color: "#5599ff", pattern: [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0] },
  { id: "lead", name: "Lead", color: "#cc66ff", pattern: [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1] },
  { id: "pad", name: "Pad", color: "#ff66cc", pattern: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] },
  { id: "fx", name: "FX", color: "#66ccff", pattern: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1] },
];

const BROWSER_TREE = [
  { name: "Packs", children: ["Drums", "808s", "Loops", "Vocals"] },
  { name: "Packs > Drums", isActive: true, children: ["Kick_808.wav", "Snare_Analog.wav", "HiHat_Closed.wav", "Clap_Snap.wav"] },
  { name: "Current project", children: ["Pattern 1", "Pattern 2", "Pattern 3"] },
  { name: "Recent files", children: [] },
];

const PIANO_KEYS = [
  { note: "C5", isBlack: false },
  { note: "B4", isBlack: true },
  { note: "A#4", isBlack: true },
  { note: "A4", isBlack: false },
  { note: "G#4", isBlack: true },
  { note: "G4", isBlack: false },
  { note: "F#4", isBlack: true },
  { note: "F4", isBlack: false },
  { note: "E4", isBlack: false },
  { note: "D#4", isBlack: true },
  { note: "D4", isBlack: false },
  { note: "C#4", isBlack: true },
  { note: "C4", isBlack: false },
  { note: "B3", isBlack: true },
  { note: "A#3", isBlack: true },
  { note: "A3", isBlack: false },
];

// Notes du piano roll (position X = colonne, Y = ligne, largeur = longueur)
const PIANO_NOTES = [
  { row: 3, col: 0, len: 4, color: "#ff5533" },
  { row: 5, col: 4, len: 3, color: "#ff5533" },
  { row: 7, col: 8, len: 2, color: "#ff5533" },
  { row: 4, col: 10, len: 4, color: "#ff5533" },
  { row: 9, col: 0, len: 6, color: "#5599ff" },
  { row: 11, col: 6, len: 8, color: "#5599ff" },
  { row: 6, col: 2, len: 3, color: "#cc66ff" },
  { row: 8, col: 7, len: 5, color: "#cc66ff" },
  { row: 12, col: 12, len: 4, color: "#ff66cc" },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function FruityLoops({ className = "" }) {
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [currentStep, setCurrentStep] = useState(0);
  const [patterns, setPatterns] = useState(() =>
    CHANNELS.reduce((acc, ch) => ({ ...acc, [ch.id]: [...ch.pattern] }), {})
  );
  const [activeTab, setActiveTab] = useState("pianoroll");
  const [masterVol, setMasterVol] = useState(80);
  const [pattern, setPattern] = useState(1);

  // Lecture : playhead qui avance
  useEffect(() => {
    if (!playing) {
      setCurrentStep(0);
      return;
    }
    const intervalMs = (60_000 / bpm) / 4; // double croche
    const id = setInterval(() => {
      setCurrentStep((s) => (s + 1) % 16);
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const toggleStep = (channelId, stepIdx) => {
    setPatterns((prev) => {
      const copy = { ...prev, [channelId]: [...prev[channelId]] };
      copy[channelId][stepIdx] = copy[channelId][stepIdx] ? 0 : 1;
      return copy;
    });
  };

  return (
    <div className={`${styles.fl} ${className}`.trim()}>

      {/* ═══════════════════════════════════════════════════════
          TOP TOOLBAR
         ═══════════════════════════════════════════════════════ */}
      <header className={styles.toolbar}>
        {/* Logo + menu */}
        <div className={styles.toolbarLeft}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>🍓</span>
            <span className={styles.logoText}>FL STUDIO</span>
            <span className={styles.logoVersion}>21</span>
          </div>
          {["FILE", "EDIT", "ADD", "PATTERNS", "VIEW", "OPTIONS", "TOOLS", "HELP"].map((m) => (
            <button key={m} type="button" className={styles.menuBtn}>{m}</button>
          ))}
        </div>

        {/* Mode PAT / SONG */}
        <div className={styles.modeSwitcher}>
          <button
            type="button"
            className={`${styles.modeBtn} ${styles.modeBtnActive}`}
          >
            PAT
          </button>
          <button type="button" className={styles.modeBtn}>
            SONG
          </button>
        </div>

        {/* Transport */}
        <div className={styles.transport}>
          <button
            type="button"
            className={`${styles.transportBtn} ${styles.playBtn} ${playing ? styles.playBtnActive : ""}`}
            onClick={() => setPlaying(true)}
            aria-label="Play"
          >
            ▶
          </button>
          <button
            type="button"
            className={styles.transportBtn}
            onClick={() => setPlaying(false)}
            aria-label="Stop"
          >
            ■
          </button>
          <button
            type="button"
            className={`${styles.transportBtn} ${styles.recordBtn} ${recording ? styles.recordBtnActive : ""}`}
            onClick={() => setRecording((v) => !v)}
            aria-label="Record"
          >
            ●
          </button>
        </div>

        {/* BPM / Time signature */}
        <div className={styles.bpmBlock}>
          <div className={styles.bpmLabel}>TEMPO</div>
          <div className={styles.bpmValue}>
            <button
              type="button"
              className={styles.bpmStep}
              onClick={() => setBpm((b) => Math.max(40, b - 1))}
            >
              −
            </button>
            <span>{bpm}.00</span>
            <button
              type="button"
              className={styles.bpmStep}
              onClick={() => setBpm((b) => Math.min(240, b + 1))}
            >
              +
            </button>
          </div>
          <div className={styles.timeSig}>4 / 4</div>
        </div>

        {/* Time display */}
        <div className={styles.timeDisplay}>
          <span className={styles.timeRow}>
            <span className={styles.timeLabel}>BAR</span>
            <span className={styles.timeVal}>001</span>
          </span>
          <span className={styles.timeRow}>
            <span className={styles.timeLabel}>BEAT</span>
            <span className={styles.timeVal}>01</span>
          </span>
          <span className={styles.timeRow}>
            <span className={styles.timeLabel}>STEP</span>
            <span className={styles.timeVal}>{String(currentStep + 1).padStart(2, "0")}</span>
          </span>
        </div>

        {/* Master meter */}
        <div className={styles.masterBlock}>
          <div className={styles.masterLabel}>MASTER</div>
          <div className={styles.masterMeter}>
            <div className={styles.masterL} style={{ height: playing ? `${60 + Math.random() * 30}%` : "15%" }} />
            <div className={styles.masterR} style={{ height: playing ? `${60 + Math.random() * 30}%` : "15%" }} />
          </div>
          <div className={styles.masterVol}>{(masterVol / 100).toFixed(2)} dB</div>
        </div>

        {/* CPU */}
        <div className={styles.cpuBlock}>
          <div className={styles.cpuLabel}>CPU</div>
          <div className={styles.cpuBar}>
            <div className={styles.cpuFill} style={{ width: playing ? "35%" : "8%" }} />
          </div>
          <div className={styles.cpuVal}>{playing ? "35" : "8"}%</div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN LAYOUT : BROWSER | CONTENT
         ═══════════════════════════════════════════════════════ */}
      <div className={styles.mainLayout}>

        {/* ═══════ BROWSER (gauche) ═══════ */}
        <aside className={styles.browser}>
          <div className={styles.browserHeader}>
            <span className={styles.browserTitle}>BROWSER</span>
            <span className={styles.browserSearch}>🔍</span>
          </div>

          <div className={styles.browserTree}>
            {BROWSER_TREE.map((folder, i) => (
              <div key={i} className={styles.browserFolder}>
                <div className={`${styles.browserFolderName} ${folder.isActive ? styles.browserFolderActive : ""}`}>
                  <span className={styles.folderIcon}>📁</span>
                  {folder.name}
                </div>
                {folder.children.length > 0 && (
                  <div className={styles.browserFiles}>
                    {folder.children.map((file, j) => (
                      <div key={j} className={styles.browserFile}>
                        <span className={styles.fileIcon}>♪</span>
                        {file}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ═══════ CONTENT (droite) ═══════ */}
        <div className={styles.content}>

          {/* ═══════ CHANNEL RACK ═══════ */}
          <div className={styles.channelRack}>
            <div className={styles.channelRackHeader}>
              <span className={styles.channelRackTitle}>CHANNEL RACK</span>
              <span className={styles.channelRackPattern}>
                Pattern <strong>{pattern}</strong>
              </span>
            </div>

            <div className={styles.channelRackBody}>
              {CHANNELS.map((channel, chIdx) => (
                <div
                  key={channel.id}
                  className={`${styles.channelRow} ${chIdx % 2 === 1 ? styles.channelRowAlt : ""}`}
                >
                  {/* Channel button */}
                  <button
                    type="button"
                    className={styles.channelBtn}
                    style={{ "--ch-color": channel.color }}
                  >
                    <span className={styles.channelLed} />
                    <span className={styles.channelName}>{channel.name}</span>
                  </button>

                  {/* Step sequencer */}
                  <div className={styles.stepGrid}>
                    {patterns[channel.id].map((val, stepIdx) => (
                      <button
                        key={stepIdx}
                        type="button"
                        className={`${styles.stepBtn} ${val ? styles.stepBtnOn : ""} ${
                          playing && currentStep === stepIdx ? styles.stepBtnCurrent : ""
                        } ${stepIdx % 4 === 0 ? styles.stepBtnBeat : ""}`}
                        style={{ "--ch-color": channel.color }}
                        onClick={() => toggleStep(channel.id, stepIdx)}
                        aria-label={`${channel.name} step ${stepIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Channel fader */}
                  <div className={styles.channelVol}>
                    <div className={styles.channelVolBar}>
                      <div
                        className={styles.channelVolFill}
                        style={{
                          width: `${60 + chIdx * 3}%`,
                          background: channel.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ TABS (Piano Roll / Playlist / Mixer) ═══════ */}
          <div className={styles.tabs}>
            {[
              { id: "pianoroll", label: "PIANO ROLL" },
              { id: "playlist", label: "PLAYLIST" },
              { id: "mixer", label: "MIXER" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
            <div className={styles.tabsRight}>
              <span className={styles.patternSelector}>
                PAT <strong>{pattern}</strong>
                <button
                  type="button"
                  className={styles.patternNav}
                  onClick={() => setPattern((p) => Math.max(1, p - 1))}
                >
                  ◄
                </button>
                <button
                  type="button"
                  className={styles.patternNav}
                  onClick={() => setPattern((p) => Math.min(9, p + 1))}
                >
                  ►
                </button>
              </span>
            </div>
          </div>

          {/* ═══════ TAB CONTENT ═══════ */}
          <div className={styles.tabContent}>

            {/* PIANO ROLL */}
            {activeTab === "pianoroll" && (
              <div className={styles.pianoRoll}>
                <div className={styles.pianoRollGrid}>
                  {/* Keys (gauche) */}
                  <div className={styles.pianoKeys}>
                    {PIANO_KEYS.map((key, i) => (
                      <div
                        key={i}
                        className={`${styles.pianoKey} ${key.isBlack ? styles.pianoKeyBlack : styles.pianoKeyWhite}`}
                      >
                        {key.note}
                      </div>
                    ))}
                  </div>

                  {/* Grid (droite) */}
                  <div className={styles.pianoGrid}>
                    {/* Lignes horizontales */}
                    {PIANO_KEYS.map((_, rowIdx) => (
                      <div
                        key={rowIdx}
                        className={`${styles.pianoRow} ${PIANO_KEYS[rowIdx].isBlack ? styles.pianoRowBlack : ""}`}
                      />
                    ))}

                    {/* Lignes verticales (colonnes) */}
                    <div className={styles.pianoColumns}>
                      {Array.from({ length: 16 }).map((_, col) => (
                        <div
                          key={col}
                          className={`${styles.pianoCol} ${col % 4 === 0 ? styles.pianoColBeat : ""} ${
                            playing && currentStep === col ? styles.pianoColCurrent : ""
                          }`}
                        />
                      ))}
                    </div>

                    {/* Notes */}
                    {PIANO_NOTES.map((note, i) => (
                      <div
                        key={i}
                        className={styles.pianoNote}
                        style={{
                          top: `${note.row * 6.25}%`,
                          left: `${(note.col / 16) * 100}%`,
                          width: `${(note.len / 16) * 100}%`,
                          height: "6.25%",
                          background: note.color,
                          boxShadow: `0 0 6px ${note.color}`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLAYLIST */}
            {activeTab === "playlist" && (
              <div className={styles.playlist}>
                <div className={styles.playlistHeader}>
                  <div className={styles.playlistTrackLabel}>TRACKS</div>
                  <div className={styles.playlistTimeline}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`${styles.playlistBar} ${i % 4 === 0 ? styles.playlistBarBeat : ""}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.playlistTracks}>
                  {CHANNELS.slice(0, 6).map((channel, i) => (
                    <div key={channel.id} className={styles.playlistTrack}>
                      <div className={styles.playlistTrackName} style={{ color: channel.color }}>
                        {channel.name}
                      </div>
                      <div className={styles.playlistTrackGrid}>
                        {Array.from({ length: 16 }).map((_, j) => (
                          <div
                            key={j}
                            className={`${styles.playlistCell} ${j % 4 === 0 ? styles.playlistCellBeat : ""}`}
                          >
                            {(i + j) % 4 === 0 && (
                              <div
                                className={styles.playlistClip}
                                style={{ background: channel.color }}
                              >
                                P{pattern}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MIXER */}
            {activeTab === "mixer" && (
              <div className={styles.mixer}>
                {[...CHANNELS.slice(0, 5), { id: "master", name: "MASTER", color: "#ff8800" }].map((channel, i) => (
                  <div key={channel.id} className={styles.mixerStrip}>
                    <div className={styles.mixerStripName} style={{ color: channel.color }}>
                      {channel.name}
                    </div>
                    <div className={styles.mixerFaderTrack}>
                      <div
                        className={styles.mixerFaderFill}
                        style={{
                          height: `${65 + (i % 3) * 8}%`,
                          background: channel.color,
                          boxShadow: `0 0 8px ${channel.color}`,
                        }}
                      />
                      <div
                        className={styles.mixerFaderCap}
                        style={{ bottom: `calc(${65 + (i % 3) * 8}% - 6px)` }}
                      />
                    </div>
                    <div className={styles.mixerMeter}>
                      {Array.from({ length: 12 }).map((_, l) => (
                        <div
                          key={l}
                          className={styles.mixerMeterSeg}
                          data-active={
                            playing && l < (12 - i - Math.floor(currentStep / 2)) ? "true" : "false"
                          }
                          data-color={l < 3 ? "red" : l < 8 ? "amber" : "green"}
                        />
                      ))}
                    </div>
                    <div className={styles.mixerPan}>C</div>
                    <div className={styles.mixerVol}>{(masterVol / 100).toFixed(1)}</div>
                  </div>
                ))}

                {/* Master fader + volume slider */}
                <div className={styles.mixerMaster}>
                  <div className={styles.masterSliderLabel}>MASTER</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVol}
                    onChange={(e) => setMasterVol(Number(e.target.value))}
                    className={styles.masterSlider}
                  />
                  <div className={styles.masterSliderValue}>{masterVol}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATUS BAR
         ═══════════════════════════════════════════════════════ */}
      <footer className={styles.statusBar}>
        <span className={styles.statusLeft}>
          <span className={styles.statusDot} data-on={playing} />
          {playing ? "PLAYING" : "STOPPED"}
        </span>
        <span className={styles.statusCenter}>
          PATTERN {pattern} · {bpm} BPM · 4/4 · 16 STEPS
        </span>
        <span className={styles.statusRight}>
          FL STUDIO 21 · FRUITY EDITION
        </span>
      </footer>
    </div>
  );
}