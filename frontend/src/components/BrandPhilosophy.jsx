import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import api from "../lib/axios";

function BrandPhilosophy() {
  const [content, setContent] = useState({});
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-5%", "5%"]);

  useEffect(() => {
    api.get("/site-content").then((res) => setContent(res.data)).catch(console.error);
  }, []);

  const headline = content.philosophy_headline || "Not Old Money. Not New Money.";
  const body = content.philosophy_body ||
    "Just young people with vision, style, and the audacity to carry themselves as though they belong wherever they choose to stand.";

  return (
    <section id="story" ref={sectionRef} className="relative overflow-hidden bg-cream px-6 py-24 sm:px-10 lg:px-16 text-center">
      <motion.div className="absolute inset-0 bg-cream" style={{ y: bgY }} aria-hidden="true" />
      <div className="relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.1] max-w-3xl mx-auto mb-8"
      >
        Not Old Money. Not New Money.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        className="text-base sm:text-lg text-ink/70 leading-relaxed max-w-xl mx-auto"
      >
        Just young people with vision, style, and the audacity to carry
        themselves as though they belong wherever they choose to stand.
      </motion.p>
    </div>
    </section>
  );
}

export default BrandPhilosophy;
