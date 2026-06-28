import { useEffect, useRef, useState, useCallback } from "react";
import api from "../lib/axios";
import stickerUp from "../assets/onfleekStickerUp.png";
import stickerNormal from "../assets/onfleekSticker.png";
import stickerDown from "../assets/onfleekStickerDown.png";

const STICKER_SEQUENCE = [stickerUp, stickerNormal, stickerDown, stickerNormal];
const MOBILE_SIZE = 100;
const DESKTOP_SIZE = 160;

let _audioContext = null;
let _analyser = null;
let _source = null;
let _audioEl = null;

function MusicPlayer() {
  const [track, setTrack] = useState(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [size, setSize] = useState(
    window.innerWidth < 640 ? MOBILE_SIZE : DESKTOP_SIZE,
  );

  // Single canvas-style ref for sticker frame — no state batching issues
  const img0Ref = useRef(null);
  const img1Ref = useRef(null);
  const activeSlotRef = useRef(0);
  const stepIndexRef = useRef(1);
  const animFrameRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const mutedRef = useRef(true);
  const playingRef = useRef(false);

  // Keep refs in sync with state
  mutedRef.current = muted;
  playingRef.current = playing;

  // Responsive size
  useEffect(() => {
    const onResize = () =>
      setSize(window.innerWidth < 640 ? MOBILE_SIZE : DESKTOP_SIZE);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch track
  useEffect(() => {
    api
      .get("/music")
      .then((res) => {
        if (res.data) setTrack(res.data);
      })
      .catch(() => {});
  }, []);

  // Set up audio + analyser + autoplay — single effect, correct order
  useEffect(() => {
    if (!track || !audioRef.current) return;
    const audio = audioRef.current;

    // Set up analyser only once per audio element
    if (_audioEl !== audio) {
      if (_audioContext) {
        _audioContext.close();
        _audioContext = null;
        _analyser = null;
        _source = null;
        _audioEl = null;
      }

      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      _audioContext = context;
      _analyser = analyser;
      _source = source;
      _audioEl = audio;
    }

    analyserRef.current = _analyser;

    // Autoplay muted
    audio.muted = true;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        playingRef.current = true;
      })
      .catch(() => {});

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [track]);

  // Sticker animation — single persistent loop, reads refs not state
  useEffect(() => {
    if (!analyserRef.current) return;

    let accumulator = 0;
    let lastTime = performance.now();

    const tick = () => {
      animFrameRef.current = requestAnimationFrame(tick);

      // Only animate when playing and unmuted
      if (!playingRef.current || mutedRef.current) {
        // Show normal sticker when paused/muted
        if (img0Ref.current && img1Ref.current) {
          const activeSlot = activeSlotRef.current;
          const normalSrc = STICKER_SEQUENCE[1];
          if (activeSlot === 0) {
            img0Ref.current.src = normalSrc;
            img0Ref.current.style.opacity = "1";
            img1Ref.current.style.opacity = "0";
          } else {
            img1Ref.current.src = normalSrc;
            img1Ref.current.style.opacity = "1";
            img0Ref.current.style.opacity = "0";
          }
        }
        return;
      }

      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      accumulator += (dt / 150); 

      if (accumulator >= 1) {
        const steps = Math.floor(accumulator);
        accumulator -= steps;

        const nextIndex =
          (stepIndexRef.current + steps) % STICKER_SEQUENCE.length;
        stepIndexRef.current = nextIndex;

        const current = activeSlotRef.current;
        const next = current === 0 ? 1 : 0;

        // Direct DOM manipulation — no React re-render, no batching issues
        const nextImg = next === 0 ? img0Ref.current : img1Ref.current;
        const currentImg = current === 0 ? img0Ref.current : img1Ref.current;

        if (nextImg && currentImg) {
          nextImg.src = STICKER_SEQUENCE[nextIndex];
          nextImg.style.opacity = "1";
          currentImg.style.opacity = "0";
          activeSlotRef.current = next;
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [track]); // only start once when track loads

  const handleMuteToggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const next = !mutedRef.current;
    setMuted(next);
    mutedRef.current = next;

    if (!next) {
      // Unmuting
      if (_audioContext?.state === "suspended") {
        await _audioContext.resume();
      }
      audio.muted = false;
      if (audio.paused) {
        await audio.play().catch(() => {});
      }
      analyserRef.current = _analyser;
      setPlaying(true);
      playingRef.current = true;
    } else {
      // Muting
      audio.muted = true;
      audio.pause();
      setPlaying(false);
      playingRef.current = false;
    }
  }, []);

  if (!track) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={track.url}
        loop
        crossOrigin="anonymous"
        preload="auto"
      />

      {/* Sticker — fixed bottom-right */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          zIndex: 50,
          pointerEvents: "none",
          userSelect: "none",
          width: size,
          height: size,
        }}
      >
        <img
          ref={img0Ref}
          src={STICKER_SEQUENCE[1]}
          alt="Onfleek character"
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom right",
            position: "absolute",
            bottom: 0,
            right: 0,
            opacity: 1,
            transition: "opacity 180ms ease-in-out",
          }}
        />
        <img
          ref={img1Ref}
          src={STICKER_SEQUENCE[1]}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom right",
            position: "absolute",
            bottom: 0,
            right: 0,
            opacity: 0,
            transition: "opacity 180ms ease-in-out",
          }}
        />
      </div>

      {/* Music pill — fixed bottom-left */}
      <button
        onClick={handleMuteToggle}
        aria-label={muted ? "Unmute music" : "Mute music"}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 50,
          background: "rgba(10,10,10,0.80)",
          backdropFilter: "blur(8px)",
          border: "none",
          borderRadius: "0 20px 0 0",
          padding: "10px 20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke={muted ? "#888" : "#fff"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 3v7" />
          <path d="M9 3l4-1v3l-4 1" />
          <circle cx="6" cy="11" r="2" />
          <path d="M9 10a2 2 0 11-4 0" />
        </svg>

        {muted && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{ position: "absolute", left: 14, top: 6 }}
          >
            <line
              x1="2"
              y1="2"
              x2="14"
              y2="14"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}

        <span
          style={{
            fontSize: 10,
            color: muted ? "#666" : "rgba(255,255,255,0.6)",
            maxWidth: 70,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
          }}
        >
          {track.title}
        </span>
      </button>
    </>
  );
}

export default MusicPlayer;
