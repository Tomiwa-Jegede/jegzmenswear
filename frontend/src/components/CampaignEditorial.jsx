import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import FadeImage from "./FadeImage";

const placeholders = [
  {
    id: "01",
    label: "Studio Portrait",
    width: "w-[160px] sm:w-[200px]",
    height: "h-[380px] sm:h-[460px]",
    offset: "",
  },
  {
    id: "02",
    label: "Campus-Inspired",
    width: "w-[150px] sm:w-[190px]",
    height: "h-[440px] sm:h-[540px]",
    offset: "mb-10",
  },
  {
    id: "03",
    label: "Street-Style",
    width: "w-[150px] sm:w-[190px]",
    height: "h-[400px] sm:h-[480px]",
    offset: "",
  },
  {
    id: "04",
    label: "Quiet Luxury Interior",
    width: "w-[160px] sm:w-[200px]",
    height: "h-[360px] sm:h-[440px]",
    offset: "mb-6",
  },
];

const marqueeAnimate = { x: ["0%", "-33.333%"] };
const marqueeTransition = {
  x: {
    repeat: Infinity,
    repeatType: "loop",
    duration: 22,
    ease: "linear",
  },
};

const quotes = [
  "We know exactly who we are.",
  "Style is identity made visible.",
  "Young people with vision don't wait for permission.",
];

function getCropTransform({ cropX = 0, cropY = 0, cropWidth = 100, cropHeight = 100 } = {}) {
  const scaleX = 100 / cropWidth;
  const scaleY = 100 / cropHeight;
  const translateXPercent = -cropX * scaleX;
  const translateYPercent = -cropY * scaleY;
  return {
    transformOrigin: "top left",
    transform: `translate(${translateXPercent}%, ${translateYPercent}%) scale(${scaleX}, ${scaleY})`,
  };
}

function EditorialPlaceholder({
  id,
  label,
  width,
  height,
  offset,
  delay,
  image,
}) {
  const desktopStyle = image ? getCropTransform({
    cropX: image.desktopCropX,
    cropY: image.desktopCropY,
    cropWidth: image.desktopCropWidth,
    cropHeight: image.desktopCropHeight,
  }) : {};

  const mobileStyle = image ? getCropTransform({
    cropX: image.mobileCropX,
    cropY: image.mobileCropY,
    cropWidth: image.mobileCropWidth,
    cropHeight: image.mobileCropHeight,
  }) : {};

  return (
    <div
      className={`relative flex-shrink-0 ${width} ${height} ${offset} bg-cream border border-ink/10 flex items-end justify-center overflow-hidden`}
    >
      {image ? (
        <>
          <FadeImage
            src={image.url}
            alt={image.altText || label}
            className="absolute inset-0 h-full w-full sm:hidden"
            style={mobileStyle}
          />
          <FadeImage
            src={image.url}
            alt={image.altText || label}
            className="absolute inset-0 h-full w-full hidden sm:block"
            style={desktopStyle}
          />
        </>
      ) : (
        <span className="mb-4 text-[10px] uppercase tracking-[0.2em] text-ink/40 text-center px-2">
          {label}
          <br />
          Placeholder {id}
        </span>
      )}
    </div>
  );
}

function PullQuote({ quote, delay, index }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const direction = index % 2 === 0 ? 1 : -1;
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0px", "0px"] : [`${direction * 24}px`, "0px"]);

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{ x }}
      className="font-serif italic text-3xl sm:text-4xl text-ink leading-[1.2] max-w-2xl"
    >
      "{quote}"
    </motion.p>
  );
}

function CampaignEditorial() {
  const [campaignImages, setCampaignImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/campaign-images")
      .then((res) => setCampaignImages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-offwhite px-6 py-20 sm:px-10 lg:px-16 animate-pulse">
        <div className="h-3 w-32 bg-ink/10 mb-12" />

        <div className="flex items-end gap-4 sm:gap-6 mb-20 overflow-hidden">
          {placeholders.map((p) => (
            <div
              key={p.id}
              className={`${p.width} ${p.height} ${p.offset} bg-cream border border-ink/10 flex-shrink-0`}
            />
          ))}
        </div>

        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 max-w-2xl bg-ink/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-offwhite px-6 py-20 sm:px-10 lg:px-16">
      <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-12">
        The Campaign
      </p>

      <div className="w-full overflow-hidden mb-20">
        <motion.div
          className="flex items-end gap-4 sm:gap-6 w-fit pb-2"
          animate={marqueeAnimate}
          transition={marqueeTransition}
        >
          {[...placeholders, ...placeholders, ...placeholders].map((p, i) => (
            <EditorialPlaceholder
              key={`${p.id}-${i}`}
              {...p}
              delay={0}
              image={campaignImages[i % placeholders.length]}
            />
          ))}
        </motion.div>
      </div>

      <div className="space-y-12">
        {quotes.map((q, i) => (
          <PullQuote key={q} quote={q} delay={i * 0.12} index={i} />
        ))}
      </div>
    </section>
  );
}

export default CampaignEditorial;
