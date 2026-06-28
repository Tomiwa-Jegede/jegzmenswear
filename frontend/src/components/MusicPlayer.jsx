import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";
import stickerUp from "../assets/onfleekStickerUp.png";
import stickerNormal from "../assets/onfleekSticker.png";
import stickerDown from "../assets/onfleekStickerDown.png";


// Cycle order: up → normal → down → normal → (repeats)
const STICKER_SEQUENCE = [stickerUp, stickerNormal, stickerDown, stickerNormal];

// Module-level singletons — survive StrictMode double-invoke
let _audioContext = null;
let _analyser = null;
let _source = null;
let _audioEl = null;

function MusicPlayer() {
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const [slotSrcs, setSlotSrcs] = useState([
    STICKER_SEQUENCE[1],
    STICKER_SEQUENCE[1],
  ]);
  const [activeSlot, setActiveSlot] = useState(0);
  const stepIndexRef = useRef(1);

  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Fetch active track
  useEffect(() => {
    api
      .get("/music")
      .then((res) => {
        if (res.data) setTrack(res.data);
      })
      .catch(() => {});
  }, []);

  // Auto-play immediately muted — browser allows muted autoplay
  useEffect(() => {
    if (!track || !audioRef.current) return;
    audioRef.current.muted = true;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => {});
  }, [track]);

  // Set up Web Audio API analyser
  useEffect(() => {
    if (!track || !audioRef.current) return;
    const audio = audioRef.current;

    if (_audioEl === audio) {
      analyserRef.current = _analyser;
      return;
    }

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
    analyserRef.current = analyser;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [track]);

  // Continuous sticker cycling driven by bass level
  useEffect(() => {
    if (!playing || muted || !analyserRef.current) {
      stepIndexRef.current = 1;
      setSlotSrcs((prev) => {
        const copy = [...prev];
        copy[activeSlot] = STICKER_SEQUENCE[1];
        return copy;
      });
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const MIN_RATE = 0.02;
    const RATE_SCALE = 0.09;
    let accumulator = 0;
    let lastTime = performance.now();

    const tick = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
      const normalized = Math.min(bass / 180, 1);

      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      accumulator += (MIN_RATE + normalized * RATE_SCALE) * (dt / 16.67);

      if (accumulator >= 1) {
        const steps = Math.floor(accumulator);
        accumulator -= steps;
        const nextIndex =
          (stepIndexRef.current + steps) % STICKER_SEQUENCE.length;
        stepIndexRef.current = nextIndex;

        setActiveSlot((current) => {
          const next = current === 0 ? 1 : 0;
          setSlotSrcs((prev) => {
            const copy = [...prev];
            copy[next] = STICKER_SEQUENCE[nextIndex];
            return copy;
          });
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing, muted]);

  const handleMuteToggle = async () => {
    const next = !muted;
    setMuted(next);
    const audio = audioRef.current;
    if (!audio) return;
    if (!next) {
      // Unmuting — resume context, unmute, ensure playing
      if (_audioContext?.state === "suspended") {
        await _audioContext.resume();
      }
      audio.muted = false;
      if (audio.paused) {
        await audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    } else {
      audio.muted = true;
    }
  };

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
        }}
      >
        <div
          style={{
            width: window.innerWidth < 640 ? 100 : 160,
            position: "relative",
            pointerEvents: "none",
          }}
        >
          <img
            src={slotSrcs[0]}
            alt="Onfleek character"
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: activeSlot === 0 ? 1 : 0,
              transition: "opacity 220ms ease-in-out",
              position: activeSlot === 0 ? "relative" : "absolute",
              bottom: 0,
              right: 0,
            }}
          />
          <img
            src={slotSrcs[1]}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: activeSlot === 1 ? 1 : 0,
              transition: "opacity 220ms ease-in-out",
              position: activeSlot === 1 ? "relative" : "absolute",
              bottom: 0,
              right: 0,
            }}
          />
        </div>
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
          pointerEvents: "all",
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
