import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import api from "../lib/axios";
import { IconArrowLeft } from "./icons";
import FadeImage from "./FadeImage";

const ROTATE_INTERVAL = 2000; // ms between campaign images — not scroll-linked

function Hero({ maintenanceMode = false }) {
  const [heroImages, setHeroImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartXRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["0%", "18%"],
  );
  const editorialParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["0%", "8%"],
  );

useEffect(() => {
    api
      .get("/hero-images")
      .then((res) => {
        console.log("[HERO DEBUG] response:", res.data);
        setHeroImages(res.data);
      })
      .catch((err) => console.error("[HERO DEBUG] error:", err));
  }, []);

  const validImages = heroImages.filter((img) => img?.url);

  // Simple timer-based slide rotation, pauses on hover/touch-hold.
  useEffect(() => {
    if (reduceMotion || validImages.length < 2 || paused) return;
    const id = setInterval(() => {
      goNext();
    }, ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, [reduceMotion, validImages.length, paused]);

  function goNext() {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % validImages.length);
  }

  function goPrev() {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + validImages.length) % validImages.length);
  }

  const currentImage = validImages[activeIndex];

  // Reproduce the admin-selected crop box as a scale+translate transform.
  // Pass the relevant breakpoint's crop fields (desktop* or mobile*).
  function getDesktopImageStyle(img) {
    const pos = img?.desktopCropMode && img.desktopCropMode !== "auto" && img.desktopCropMode !== "manual"
      ? img.desktopCropMode
      : "center center";
    const zoom = img?.desktopZoom || 1;
    return { objectPosition: pos, transform: `scale(${zoom})`, transformOrigin: pos };
  }

  function getMobileImageStyle(img) {
    const pos = img?.mobileCropMode && img.mobileCropMode !== "auto" && img.mobileCropMode !== "manual"
      ? img.mobileCropMode
      : "center center";
    const zoom = img?.mobileZoom || 1;
    return { objectPosition: pos, transform: `scale(${zoom})`, transformOrigin: pos };
  }

  const Dots = validImages.length > 1 && (
    <div className="flex items-center gap-2">
      {validImages.map((img, i) => (
        <button
          key={img.url}
          type="button"
          aria-label={`Show campaign image ${i + 1}`}
          onClick={() => {
            setDirection(i > activeIndex ? 1 : -1);
            setActiveIndex(i);
          }}
          className={`h-1.5 w-1.5 rounded-full transition-colors cursor-pointer ${
            i === activeIndex ? "bg-offwhite" : "bg-offwhite/40"
          }`}
        />
      ))}
    </div>
  );

  const NavButtons = validImages.length > 1 && (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Previous campaign image"
        onClick={goPrev}
        className="text-offwhite/70 hover:text-offwhite transition-colors cursor-pointer"
      >
        <IconArrowLeft className="h-4 w-4" />
      </button>
      {Dots}
      <button
        type="button"
        aria-label="Next campaign image"
        onClick={goNext}
        className="text-offwhite/70 hover:text-offwhite transition-colors cursor-pointer"
      >
        <IconArrowLeft className="h-4 w-4 rotate-180" />
      </button>
    </div>
  );

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
    center: { x: "0%" },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
  };

  const slideTransition = {
    duration: reduceMotion ? 0 : 0.7,
    ease: "easeInOut",
  };

  const DesktopCampaignImage = (
    <>
      <div className="absolute inset-0 bg-ink/10" />
      {currentImage && (
        <AnimatePresence mode="sync" initial={false} custom={direction}>
          <motion.div
            key={currentImage.url}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 h-full w-full overflow-hidden"
          >
            <FadeImage
              src={currentImage.url}
              alt={currentImage.alt || "Onfleek campaign portrait"}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={getDesktopImageStyle(currentImage)}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );

  const MobileCampaignImage = currentImage ? (
    <AnimatePresence mode="sync" initial={false} custom={direction}>
      <motion.div
        key={currentImage.url}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={slideTransition}
        className="absolute inset-0 h-full w-full overflow-hidden"
      >
        <FadeImage
          src={currentImage.url}
          alt={currentImage.alt || "Onfleek campaign portrait"}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={getMobileImageStyle(currentImage)}
        />
      </motion.div>
    </AnimatePresence>
  ) : (
    <div className="absolute inset-0 animate-pulse bg-ink/10" />
  );

  return (
    <>
      <section
        ref={heroRef}
        data-hero
        className="relative h-screen w-full overflow-hidden bg-offwhite sm:h-screen"
      >
        {/* ===================== MOBILE — full-bleed image, nav overlays ===================== */}
        <motion.div
          className="absolute inset-0 sm:hidden"
          style={{ y: heroParallaxY }}
          onTouchStart={(e) => {
            setPaused(true);
            touchStartXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            setPaused(false);
            const startX = touchStartXRef.current;
            touchStartXRef.current = null;
            if (startX == null || validImages.length < 2) return;
            const endX = e.changedTouches[0].clientX;
            const delta = endX - startX;
            const SWIPE_THRESHOLD = 40;
            if (delta > SWIPE_THRESHOLD) goPrev();
            else if (delta < -SWIPE_THRESHOLD) goNext();
          }}
          onTouchCancel={() => {
            setPaused(false);
            touchStartXRef.current = null;
          }}
        >
          {MobileCampaignImage}
          <div className="absolute inset-0 bg-ink/35" />

          {!maintenanceMode && (
            <div
              className="absolute inset-x-0 z-[3] flex items-center justify-center"
              style={{
                bottom: "calc(max(22%, env(safe-area-inset-bottom) + 6.5rem))",
              }}
            >
              <Link
                to="/shop"
                className="bg-transparent text-offwhite [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] px-10 py-4  text-sm uppercase tracking-[0.2em] hover:bg-burgundy hover:text-offwhite transition-colors cursor-pointer border border-offwhite rounded-sm"
              >
                Shop
              </Link>
            </div>
          )}

          {Dots && (
            <div
              className="absolute inset-x-0 z-[3] flex items-center justify-center gap-2"
              style={{
                bottom: "calc(max(10%, env(safe-area-inset-bottom) + 3rem))",
              }}
            >
              {Dots}
            </div>
          )}
        </motion.div>

        {/* ===================== DESKTOP — asymmetric editorial split ===================== */}
        <div className="hidden h-full w-full sm:flex">
          {/* Photography — dominant, anchored, no dead margins */}
          <motion.div
            className="relative h-full w-[62%] overflow-hidden"
            style={{ y: heroParallaxY }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {DesktopCampaignImage}
            <div className="absolute inset-0 bg-ink/15" />

            {NavButtons && (
              <div className="absolute bottom-10 right-10 z-[3]">
                {NavButtons}
              </div>
            )}
          </motion.div>

          {/* Action column — quiet, curated, upper-third weighted */}
          <div
            data-hero-action
            className="relative flex w-[38%] flex-col items-start gap-10 px-16 pt-[calc(var(--nav-height,89px)+4rem)]"
          >
            {!maintenanceMode && (
              <>
              
                <Link
                  to="/shop"
                  className="group relative inline-flex w-full max-w-[260px] items-center justify-between overflow-hidden border border-ink px-8 py-5 text-sm uppercase tracking-[0.25em] text-ink"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-offwhite">
                    Shop
                  </span>
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-offwhite">
                    &rarr;
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-ink transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Editorial copy — follows the hero, unchanged */}
      {/* <section className="relative bg-offwhite px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
        <motion.div
          className="max-w-xl lg:max-w-2xl lg:mx-auto lg:text-center"
          style={{ y: editorialParallaxY }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-6">
            {siteContent.hero_label}
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-ink leading-[1.05] mb-6">
            {siteContent.hero_headline.split("\\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-base text-ink/70 leading-relaxed max-w-md lg:mx-auto">
            {siteContent.hero_subtext}
          </p>
        </motion.div>
      </section> */}
    </>
  );
}

export default Hero;
