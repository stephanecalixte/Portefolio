import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import { getMediaCatalog } from "../../media";

import MellanoxSwitch from "../../components/switch/MellanoxSwitch";
import RouterSisco from "../../components/router/RouterSisco";
import CalixteAnimations from "../../components/animations/calixteAnimations/CalixteAnimations";
import DataCenter from "../../components/dataCenter/DataCenterScene";
import dataCenterStyles from "../../components/dataCenter/DataCenterScene.module.css";
import FanController from "../../components/fancontroller/FanController";
import TVSection from "../../components/tv/TVSection";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════════
const RouterConfigTv = [
  { Router: "Router > enable" },
  { Router: "Router# configure terminal" },
  { Router: "Router(config)# hostname R1" },
  { Router: "R1(config)# enable secret MonMotDePasseFort" },
  { Router: "R1(config)# line console 0" },
  { Router: "R1(config-line)# password ConsolePass" },
  { Router: "R1(config-line)# login" },
  { Router: "R1(config-line)# exit" },
  { Router: "R1(config)# line vty 0 4" },
  { Router: "R1(config-line)# password VtyPass" },
  { Router: "R1(config-line)# login" },
  { Router: "R1(config-line)# transport input ssh" },
  { Router: "R1(config-line)# exit" },
  { Router: "R1(config)# banner motd #Accès restreint - Autorisé uniquement#" },
  { Router: "R1(config)# interface GigabitEthernet0/0" },
  { Router: "R1(config-if)# ip address 192.168.1.1 255.255.255.0" },
  { Router: "R1(config-if)# no shutdown" },
  { Router: "R1(config-if)# exit" },
  { Router: "R1(config)# ip domain-name monreseau.local" },
  { Router: "R1(config)# username admin secret AdminPass" },
  { Router: "R1(config)# crypto key generate rsa" },
  { Router: "R1(config)# ip ssh version 2" },
  { Router: "R1(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.254" },
  { Router: "R1(config)# end" },
  { Router: "R1# copy running-config startup-config" },
];

const SwitchConfigTv = [
  { Switch: "Switch > enable" },
  { Switch: "Switch# configure terminal" },
  { Switch: "Switch(config)# hostname SW1" },
  { Switch: "SW1(config)# enable secret MonMotDePasseFort" },
  { Switch: "SW1(config)# line console 0" },
  { Switch: "SW1(config-line)# password ConsolePass" },
  { Switch: "SW1(config-line)# login" },
  { Switch: "SW1(config-line)# exit" },
  { Switch: "SW1(config)# line vty 0 15" },
  { Switch: "SW1(config-line)# password VtyPass" },
  { Switch: "SW1(config-line)# login" },
  { Switch: "SW1(config-line)# transport input ssh" },
  { Switch: "SW1(config-line)# exit" },
  { Switch: "SW1(config)# interface vlan 1" },
  { Switch: "SW1(config-if)# ip address 192.168.1.10 255.255.255.0" },
  { Switch: "SW1(config-if)# no shutdown" },
  { Switch: "SW1(config-if)# exit" },
  { Switch: "SW1(config)# ip default-gateway 192.168.1.1" },
  { Switch: "SW1(config)# interface range GigabitEthernet0/1 - 24" },
  { Switch: "SW1(config-if-range)# switchport mode access" },
  { Switch: "SW1(config-if-range)# switchport access vlan 10" },
  { Switch: "SW1(config-if-range)# exit" },
  { Switch: "SW1(config)# ip domain-name monreseau.local" },
  { Switch: "SW1(config)# username admin secret AdminPass" },
  { Switch: "SW1(config)# crypto key generate rsa" },
  { Switch: "SW1(config)# ip ssh version 2" },
  { Switch: "SW1(config)# end" },
  { Switch: "SW1# copy running-config startup-config" },
];

const ROUTER_LINES = RouterConfigTv.map((r) => r.Router);
const SWITCH_LINES = SwitchConfigTv.map((s) => s.Switch);
const ROUTER_TOTAL = ROUTER_LINES.join("\n").length;
const SWITCH_TOTAL = SWITCH_LINES.join("\n").length;

// ═══════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════
const PIN_MULTIPLIER = 3;

const P_ROUTER_SLIDE_START = 0.00;
const P_ROUTER_SLIDE_END   = 0.08;
const P_MONITOR_ROUTER_START = 0.08;
const P_MONITOR_ROUTER_END   = 0.15;
const P_ROUTER_TYPING_START = 0.15;
const P_ROUTER_TYPING_END   = 0.40;
const P_CABLE_START = 0.40;
const P_CABLE_END   = 0.50;
const P_SWITCH_SLIDE_START = 0.50;
const P_SWITCH_SLIDE_END   = 0.58;
const P_MONITOR_SWITCH_START = 0.58;
const P_MONITOR_SWITCH_END   = 0.65;
const P_SWITCH_TYPING_START = 0.65;
const P_SWITCH_TYPING_END   = 0.75;

const P_SVG_FADE_START = 0.75;
const P_SVG_FADE_END   = 0.78;

const P_RACK_ZOOM_START   = 0.76;
const P_RACK_ZOOM_END     = 0.80;
const P_FAN_FADE_START    = 0.80;
const P_FAN_FADE_END      = 0.83;
const P_FAN_BTN_START     = 0.83;
const P_FAN_BTN_END       = 0.86;
const P_FAN_DISPLAY_START = 0.86;
const P_FAN_DISPLAY_END   = 0.89;
const P_FAN_SPIN           = 0.89;
const P_VIDEO_START        = 0.89;
const P_VIDEO_END          = 0.94;
const P_LEDS_TRIGGER       = 0.94;

const SKILLS = ["RÉSEAU", "SYSTÈME", "SÉCURITÉ", "CLOUD"];

// ═══════════════════════════════════════════════════════════════════
// MONITOR
// ═══════════════════════════════════════════════════════════════════
const Monitor = ({ title, subtitle, lines, charCount = 0 }) => {
  const preRef = useRef(null);

  const fullText = useMemo(
    () =>
      lines
        .map((l) => {
          if (typeof l === "string") return l;
          if (l && typeof l === "object") return l.Router ?? l.Switch ?? String(l);
          return String(l ?? "");
        })
        .join("\n"),
    [lines]
  );

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [charCount]);

  const safeCount = Math.max(0, Math.min(charCount, fullText.length));
  const visible = fullText.slice(0, safeCount);
  const started = safeCount > 0;
  const done = safeCount >= fullText.length;

  return (
    <div className={styles.monitor}>
      <div className={styles["monitor-header"]}>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <pre ref={preRef} className="terminal-pre">
        {visible}
        {started && (
          <span className={done ? styles.cursorBlink : styles.cursor}>▊</span>
        )}
      </pre>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════
const Home = () => {
  const hamburgerRef = useRef(null);
  const navBarRef = useRef(null);
  const heroVideoRef = useRef(null);

  const scrollSectionRef = useRef(null);
  const svgWrapperRef = useRef(null);
  const routerRef = useRef(null);
  const routerMonitorRef = useRef(null);
  const cableRef = useRef(null);
  const switchRef = useRef(null);
  const skillsRef = useRef(null);
  const switchMonitorRef = useRef(null);

  const racksWrapperRef = useRef(null);
  const fanWrapperRef = useRef(null);
  const videoStartRef = useRef(null);

  const ledSequenceRef = useRef(false);
  const ledBlinkRef = useRef(null);

  const tvSectionRef = useRef(null);
  const verticalRef = useRef(null);
  const horizontalRef = useRef(null);

  const [sceneProgress, setSceneProgress] = useState(0);

  const [fanOn, setFanOn] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const fanWasOnRef = useRef(false);
  const [mediaCatalog, setMediaCatalog] = useState({ images: [], videos: [] });
  const [mediaError, setMediaError] = useState("");
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getMediaCatalog(controller.signal)
      .then((catalog) => {
        setMediaCatalog(catalog);
        setMediaLoaded(true);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setMediaError(error.message);
          setMediaLoaded(true);
        }
      });

    return () => controller.abort();
  }, []);

  const heroVideoUrl = mediaCatalog.videos.find(
    (item) => item.path.split("/").at(-1).toLowerCase() === "start.mp4",
  )?.url;
  const sceneVideoUrl = mediaCatalog.videos.find(
    (item) => item.path.split("/").at(-1).toLowerCase() === "intro.mp4",
  )?.url;

  // ─── Hero vidéo ───
  useEffect(() => {
    const heroVideo = heroVideoRef.current;
    if (!heroVideo || !heroVideoUrl) return;

    const seekVideo = (time, reason) => {
      try {
        heroVideo.currentTime = time;
      } catch (error) {
        console.error(`Impossible de repositionner la vidéo d’accueil (${reason}) :`, error);
      }
    };

    heroVideo.pause();
    const fadeIn = gsap.matchMedia();
    fadeIn.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        heroVideo,
        { opacity: 0 },
        {
          opacity: 1,
          delay: 3,
          duration: 20,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    });
    fadeIn.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(heroVideo, { opacity: 1 });
    });

    const showFirstFrame = () => {
      if (heroVideo.readyState >= 2) {
        seekVideo(0.01, "affichage de la première image");
      }
    };
    heroVideo.addEventListener("loadeddata", showFirstFrame);
    showFirstFrame();

    const st = ScrollTrigger.create({
      trigger: heroVideo,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        if (self.progress > 0.02) {
          if (heroVideo.paused) {
            heroVideo.play().catch((error) => {
              if (error.name !== "AbortError") {
                console.error("Impossible de lire la vidéo d’accueil :", error);
              }
            });
          }
        } else if (!heroVideo.paused) {
          heroVideo.pause();
          seekVideo(0, "retour au début");
        }
      },
    });

    return () => {
      heroVideo.removeEventListener("loadeddata", showFirstFrame);
      st.kill();
      fadeIn.revert();
    };
  }, [heroVideoUrl]);

  // ─── Hamburger ───
  useEffect(() => {
    const h = hamburgerRef.current;
    const n = navBarRef.current;
    if (!h || !n) return;
    const click = () => {
      const open = n.classList.toggle(styles.navBarOpen);
      h.setAttribute("aria-expanded", String(open));
    };
    h.setAttribute("aria-expanded", "false");
    h.setAttribute("aria-controls", "nav-bar");
    h.addEventListener("click", click);
    return () => h.removeEventListener("click", click);
  }, []);

  // ─── Refresh ScrollTrigger après montage ───
  useEffect(() => {
    if (!mediaLoaded) return undefined;

    const t1 = setTimeout(() => ScrollTrigger.refresh(), 100);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 400);
    const t3 = setTimeout(() => ScrollTrigger.refresh(), 1200);
    const t4 = setTimeout(() => ScrollTrigger.refresh(), 2500);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("resize", onResize);
    };
  }, [mediaLoaded]);

  // ─── Timeline scène unifiée ───
  useEffect(() => {
    if (!mediaLoaded) return undefined;

    const scrollSection = scrollSectionRef.current;
    const svgWrapper = svgWrapperRef.current;
    const routerEl = routerRef.current;
    const routerMonitor = routerMonitorRef.current;
    const cable = cableRef.current;
    const switchEl = switchRef.current;
    const skills = skillsRef.current;
    const switchMonitor = switchMonitorRef.current;
    const fanWrapper = fanWrapperRef.current;
    const videoWrapper = videoStartRef.current;

    if (
      !scrollSection ||
      !svgWrapper ||
      !routerEl ||
      !routerMonitor ||
      !cable ||
      !switchEl ||
      !skills ||
      !switchMonitor ||
      !fanWrapper ||
      !videoWrapper
    ) {
      return;
    }

    const videoEl = videoWrapper.querySelector("video");

    let dcScenes = document.querySelectorAll('[data-scene="data-center"]');
    if (dcScenes.length === 0 && dataCenterStyles.scene) {
      dcScenes = document.querySelectorAll(`.${dataCenterStyles.scene}`);
    }

    const fanBtn = fanWrapper.querySelector("[data-fan-btn]");
    const fanDisplay = fanWrapper.querySelector("[data-fan-display]");

    const leds = document.querySelectorAll("[data-led]");
    if (leds.length) {
      gsap.set(leds, {
        opacity: 0.1,
        filter: "brightness(0.2) saturate(0)",
      });
    }

    let ctx;
    const rafId = requestAnimationFrame(() => {
      const cableLength = cable.getTotalLength() || 800;

      gsap.set(routerEl, { y: -300, opacity: 0 });
      gsap.set(routerMonitor, { opacity: 0, x: -100 });
      gsap.set(cable, { strokeDasharray: cableLength, strokeDashoffset: cableLength });
      gsap.set(switchEl, { y: 300, opacity: 0 });
      gsap.set(switchMonitor, { opacity: 0, x: 100 });
      gsap.set(skills.children, { opacity: 0.15, filter: "grayscale(1)" });

      gsap.set(svgWrapper, { opacity: 1 });

      if (dcScenes.length) {
        gsap.set(dcScenes, {
          scale: 0.3,
          opacity: 0,
          transformOrigin: "center center",
        });
      }
      gsap.set(fanWrapper, { opacity: 0 });
      if (videoEl) gsap.set(videoEl, { opacity: 0, scale: 1.05 });
      if (fanBtn) gsap.set(fanBtn, { filter: "grayscale(1) brightness(0.4)" });
      if (fanDisplay) gsap.set(fanDisplay, { opacity: 0.2 });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollSection,
            start: "top top",
            end: () => `+=${window.innerHeight * PIN_MULTIPLIER}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setSceneProgress(self.progress),
          },
        });

        // PHASE 1 : SVG
        tl.to(routerEl, {
          y: 0, opacity: 1,
          duration: P_ROUTER_SLIDE_END - P_ROUTER_SLIDE_START,
          ease: "back.out(1.6)",
        }, P_ROUTER_SLIDE_START);

        tl.to(routerMonitor, {
          opacity: 1, x: 0,
          duration: P_MONITOR_ROUTER_END - P_MONITOR_ROUTER_START,
          ease: "power2.out",
        }, P_MONITOR_ROUTER_START);

        tl.to(cable, {
          strokeDashoffset: 0,
          duration: P_CABLE_END - P_CABLE_START,
          ease: "power2.inOut",
        }, P_CABLE_START);

        tl.to(switchEl, {
          y: 0, opacity: 1,
          duration: P_SWITCH_SLIDE_END - P_SWITCH_SLIDE_START,
          ease: "back.out(1.6)",
        }, P_SWITCH_SLIDE_START);

        tl.to(switchMonitor, {
          opacity: 1, x: 0,
          duration: P_MONITOR_SWITCH_END - P_MONITOR_SWITCH_START,
          ease: "power2.out",
        }, P_MONITOR_SWITCH_START);

        tl.to(skills.children, {
          opacity: 1, filter: "grayscale(0)",
          duration: 0.04, stagger: 0.01, ease: "power2.out",
        }, P_SWITCH_TYPING_END);

        // PHASE 2 : SVG fade out
        tl.to(svgWrapper, {
          opacity: 0,
          duration: P_SVG_FADE_END - P_SVG_FADE_START,
          ease: "power2.in",
        }, P_SVG_FADE_START);

        // PHASE 3 : Racks
        if (dcScenes.length) {
          tl.to(dcScenes, {
            scale: 1,
            opacity: 1,
            duration: P_RACK_ZOOM_END - P_RACK_ZOOM_START,
            ease: "back.out(1.8)",
          }, P_RACK_ZOOM_START);
        }

        // PHASE 4 : Fan
        tl.to(fanWrapper, {
          opacity: 1,
          duration: P_FAN_FADE_END - P_FAN_FADE_START,
          ease: "power2.out",
        }, P_FAN_FADE_START);

        // PHASE 5 : Bouton
        if (fanBtn) {
          tl.to(fanBtn, {
            filter: "grayscale(0) brightness(1.15)",
            duration: P_FAN_BTN_END - P_FAN_BTN_START,
            ease: "power2.out",
          }, P_FAN_BTN_START);
        }

        // PHASE 6 : Écran
        if (fanDisplay) {
          tl.to(fanDisplay, {
            opacity: 1,
            duration: P_FAN_DISPLAY_END - P_FAN_DISPLAY_START,
            ease: "power2.out",
          }, P_FAN_DISPLAY_START);
        }

        // PHASE 7 : Vidéo
        if (videoEl) {
          tl.to(videoEl, {
            opacity: 1, scale: 1,
            duration: P_VIDEO_END - P_VIDEO_START,
            ease: "power2.out",
          }, P_VIDEO_START);
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, [mediaLoaded]);

  // ─── Fan rotation ───
  useEffect(() => {
    const shouldBeOn = sceneProgress >= P_FAN_SPIN;
    if (shouldBeOn && !fanWasOnRef.current) {
      fanWasOnRef.current = true;
      setFanOn(true);
      setFanSpeed((s) => (s > 0 ? s : 50));
    } else if (!shouldBeOn && fanWasOnRef.current) {
      fanWasOnRef.current = false;
      setFanOn(false);
      setFanSpeed(0);
    }
  }, [sceneProgress]);

  // ─── LEDs ───
  useEffect(() => {
    const leds = document.querySelectorAll("[data-led]");
    if (!leds.length) return;

    if (sceneProgress >= P_LEDS_TRIGGER && !ledSequenceRef.current) {
      ledSequenceRef.current = true;
      gsap.killTweensOf(leds);
      if (ledBlinkRef.current) ledBlinkRef.current.kill();

      gsap.set(leds, { opacity: 0.1, filter: "brightness(0.2) saturate(0)" });

      gsap.to(leds, {
        opacity: 1,
        filter: "brightness(1) saturate(1)",
        duration: 0.08,
        stagger: { each: 0.012, from: "start" },
        ease: "power1.out",
        onComplete: () => {
          ledBlinkRef.current = gsap.to(leds, {
            opacity: 0.2,
            duration: 0.18,
            repeat: -1,
            yoyo: true,
            stagger: { each: 0.025, from: "random" },
            ease: "none",
          });
        },
      });
    }

    if (sceneProgress < P_LEDS_TRIGGER - 0.01 && ledSequenceRef.current) {
      ledSequenceRef.current = false;
      gsap.killTweensOf(leds);
      if (ledBlinkRef.current) {
        ledBlinkRef.current.kill();
        ledBlinkRef.current = null;
      }
      gsap.set(leds, { opacity: 0.1, filter: "brightness(0.2) saturate(0)" });
    }
  }, [sceneProgress]);

  useEffect(() => {
    return () => {
      if (ledBlinkRef.current) ledBlinkRef.current.kill();
    };
  }, []);

  // ─── Galeries verticale + horizontale ───
  useEffect(() => {
    if (!mediaLoaded) return undefined;

    const ctx = gsap.context(() => {
      const verticalSection = verticalRef.current;
      if (verticalSection) {
        const boxes = verticalSection.querySelectorAll(`.${styles.box}`);
        const imgs = verticalSection.querySelectorAll(`.${styles.box} img`);
        gsap.set(boxes, { opacity: 0 });
        gsap.set(imgs, { scale: 1.2 });
        boxes.forEach((box, i) => {
          gsap.to(box, {
            opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: box, start: "top 80%", toggleActions: "play none none reverse" },
          });
          gsap.to(imgs[i], {
            scale: 1, duration: 1.4, ease: "power2.out",
            scrollTrigger: { trigger: box, start: "top 80%", toggleActions: "play none none reverse" },
          });
        });
      }

      const horizontalSection = horizontalRef.current;
      if (horizontalSection) {
        gsap.to(horizontalSection, {
          x: () => -(horizontalSection.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalSection,
            start: "top top",
            end: () => `+=${horizontalSection.scrollWidth - window.innerWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [mediaLoaded]);

  // ─── Typing ───
  const routerCharCount =
    sceneProgress < P_ROUTER_TYPING_START
      ? 0
      : sceneProgress > P_ROUTER_TYPING_END
        ? ROUTER_TOTAL
        : Math.floor(
            ((sceneProgress - P_ROUTER_TYPING_START) /
              (P_ROUTER_TYPING_END - P_ROUTER_TYPING_START)) *
              ROUTER_TOTAL
          );

  const switchCharCount =
    sceneProgress < P_SWITCH_TYPING_START
      ? 0
      : sceneProgress > P_SWITCH_TYPING_END
        ? SWITCH_TOTAL
        : Math.floor(
            ((sceneProgress - P_SWITCH_TYPING_START) /
              (P_SWITCH_TYPING_END - P_SWITCH_TYPING_START)) *
              SWITCH_TOTAL
          );

  return (
    <div className={styles.home}>
      <style>{`
        @keyframes blinkTerminalCursor { 50% { opacity: 0; } }
        .terminal-pre::-webkit-scrollbar { display: none; }
        .terminal-pre { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>



      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section id="accueil" className={styles.hero}>
        <div className={styles.name}>
          {["Calixte", "Stéphane"].map((word) => (
            <p className={styles.nameLine} key={word}>
              {Array.from(word, (letter, index) => (
                <span
                  className={styles.nameLetter}
                  key={`${word}-${index}`}
                  style={{ "--letter-index": index }}
                >
                  {letter}
                </span>
              ))}
            </p>
          ))}
        </div>

        <CalixteAnimations />
        <div className={styles.heroCta}>
            <Link to="/projects" className={styles.projectsBtn}>
              Voir mes projets
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
        </div>
        <div className={styles.backgroundVideoContainer}>
          {heroVideoUrl && (
            <video
              ref={heroVideoRef}
              src={heroVideoUrl}
              loop
              muted
              playsInline
              preload="auto"
              className={styles.backgroundVideo}
            />
          )}
        </div>
        <div className={styles.scrollIndicator}>
          <span>Scroll down</span>
          <div className={styles.arrow}></div>
        </div>
      </section>

      {mediaError && (
        <p className={styles.mediaError} role="alert">
          {mediaError}
        </p>
      )}

      {/* ═══════════════════════════════════════════════════════
          SCÈNE UNIFIÉE — SVG → Racks → Fan → Vidéo
         ═══════════════════════════════════════════════════════ */}
      <section
        ref={scrollSectionRef}
        className={styles["scroll-section"]}
        id="competences"
      >
        {/* Vidéo en fond */}
        <div ref={videoStartRef} className={styles.videoOverlay}>
          {sceneVideoUrl && (
            <video
              src={sceneVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={styles.backgroundVideo}
            />
          )}
        </div>

        {/* SVG scène */}
        <div ref={svgWrapperRef} className={styles.svgWrapper}>
          <svg
            viewBox="0 0 1200 1000"
            preserveAspectRatio="xMidYMid meet"
            className={styles.sceneSvg}
          >
            <rect x="400" y="40" width="400" height="150" rx="8"
              fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 6"
              opacity="0.35" />

            <foreignObject x="400" y="40" width="400" height="150">
              <div xmlns="http://www.w3.org/1999/xhtml"
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={routerRef} style={{ width: 400, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ transform: "scale(0.4)", transformOrigin: "center center" }}>
                    <RouterSisco compact />
                  </div>
                </div>
              </div>
            </foreignObject>

            <foreignObject x="40" y="40" width="320" height="260">
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: "100%", height: "100%" }}>
                <div ref={routerMonitorRef} style={{ width: "100%", height: "100%", display: "flex" }}>
                  <Monitor title="PowerShell — Router" subtitle="Configuration Cisco N540"
                    lines={ROUTER_LINES} charCount={routerCharCount} />
                </div>
              </div>
            </foreignObject>

            <path ref={cableRef} d="M 600 190 L 600 720"
              fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 15px rgba(59,130,246,0.8))" }} />

            <rect x="400" y="720" width="400" height="240" rx="8"
              fill="none" stroke="#76b900" strokeWidth="2" strokeDasharray="6 6"
              opacity="0.35" />

            <foreignObject x="400" y="720" width="400" height="240">
              <div xmlns="http://www.w3.org/1999/xhtml"
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={switchRef} style={{ width: 400, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ transform: "scale(0.35)", transformOrigin: "center center" }}>
                    <MellanoxSwitch compact skills={SKILLS} skillsRef={skillsRef} />
                  </div>
                </div>
              </div>
            </foreignObject>

            <foreignObject x="840" y="700" width="320" height="260">
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: "100%", height: "100%" }}>
                <div ref={switchMonitorRef} style={{ width: "100%", height: "100%", display: "flex" }}>
                  <Monitor title="PowerShell — Switch" subtitle="Configuration Mellanox MCS7520"
                    lines={SWITCH_LINES} charCount={switchCharCount} />
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Racks */}
        <div ref={racksWrapperRef} className={styles.racksWrapper}>
          <DataCenter className={dataCenterStyles.dataCenter1} />
          <DataCenter className={dataCenterStyles.dataCenter2} />
          <DataCenter className={dataCenterStyles.dataCenter3} />
          <DataCenter className={dataCenterStyles.dataCenter4} />
        </div>

        {/* Fan */}
        <div ref={fanWrapperRef} className={styles.fanWrapper}>
          <div style={{ "--fan-size": "100px" }}>
            <FanController
              isOn={fanOn}
              speed={fanSpeed}
              onIsOnChange={setFanOn}
              onSpeedChange={setFanSpeed}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TV SECTION (composant séparé)
         ═══════════════════════════════════════════════════════ */}
      <TVSection ref={tvSectionRef} id="projets" />

      {/* ═══════════════════════════════════════════════════════
          GALERIE VERTICALE
         ═══════════════════════════════════════════════════════ */}
      <section className={styles["vertical-section"]} ref={verticalRef}>
        {mediaCatalog.images.map((image) => (
          <div key={image.path} className={styles.box}>
            <img src={image.url} alt={image.name} loading="lazy" />
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════
          GALERIE HORIZONTALE
         ═══════════════════════════════════════════════════════ */}
      <section className={styles["horizontal-section"]} ref={horizontalRef}>
        {mediaCatalog.images.map((image) => (
          <div key={image.path} className={styles.box}>
            <img src={image.url} alt={image.name} loading="lazy" />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;