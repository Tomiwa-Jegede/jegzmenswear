import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import api from "../lib/axios";
import FadeImage from "./FadeImage";
import { optimizedImageUrl } from "../lib/cloudinary";

const DEFAULTS = {
  spotlight_collection_slug: "",
  spotlight_label: "Spotlight",
  spotlight_headline: "Wear Your Legacy.",
  spotlight_body:
    "Inspired by the confidence of campus icons and reimagined for a generation building its future in real time.",
  spotlight_cta: "Shop",
};

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}



function RugbyPoloSpotlight() {
  const [collection, setCollection] = useState(null);
  const [content, setContent] = useState(DEFAULTS);
  const [loadFailed, setLoadFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imageParallaxY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-6%", "6%"]);

  useEffect(() => {
    api
      .get("/site-content")
      .then((res) => {
        const merged = { ...DEFAULTS, ...res.data };
        setContent(merged);
        if (merged.spotlight_collection_slug) {
          return api
            .get(`/collections/${merged.spotlight_collection_slug}`)
            .then((res) => setCollection(res.data))
            .catch(() =>
              api
                .get("/collections")
                .then((res) => setCollection(res.data?.[0] || null))
                .catch(() => setLoadFailed(true)),
            );
        }
        return api
          .get("/collections")
          .then((res) => setCollection(res.data?.[0] || null))
          .catch(() => setLoadFailed(true));
      })
      .catch((err) => {
        console.error(err);
        setLoadFailed(true);
      });
  }, []);

  if (!collection) {
  return (
    <section className="relative overflow-hidden bg-cream px-6 py-20 sm:px-10 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center animate-pulse">
        <div className="aspect-[4/5] bg-offwhite border border-ink/10" />

        <div>
          <div className="h-3 w-24 bg-ink/10 mb-6" />
          <div className="h-12 w-72 bg-ink/10 mb-6" />
          <div className="space-y-3 mb-10">
            <div className="h-4 w-full bg-ink/10" />
            <div className="h-4 w-5/6 bg-ink/10" />
            <div className="h-4 w-4/6 bg-ink/10" />
          </div>

          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-ink/10 pb-4"
              >
                <div className="h-5 w-40 bg-ink/10" />
                <div className="h-4 w-20 bg-ink/10" />
              </div>
            ))}
          </div>

          <div className="mt-10 h-12 w-56 border border-ink/10 bg-offwhite" />
        </div>
      </div>
    </section>
  );
}

  const products = collection.products || [];
  const featuredProduct = products.find((p) => p.isFeatured) || products[0];
  const otherProducts = products.filter((p) => p.id !== featuredProduct?.id);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-cream px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ y: imageParallaxY }}
          className="relative aspect-[4/5] bg-offwhite border border-ink/10 overflow-hidden"
        >
          {(content.spotlight_image_url || collection.heroImageUrl) && (
            <img
              src={optimizedImageUrl(content.spotlight_image_url || collection.heroImageUrl, 900)}
              alt={collection.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-6">
            {content.spotlight_label}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-ink leading-[1.05] mb-6">
            {content.spotlight_headline}
          </h2>
          <p className="text-base text-ink/70 leading-relaxed mb-10 max-w-md">
            {content.spotlight_body}
          </p>

          <div className="space-y-5">
            {featuredProduct && (
              <Link
                to={`/products/${featuredProduct.slug}`}
                className="flex items-center justify-between border-b border-ink/10 pb-4 group"
              >
                <span className="font-serif text-xl text-ink group-hover:text-burgundy transition-colors">
                  {featuredProduct.name}
                </span>
                <span className="text-sm text-ink/60">
                  {formatPrice(featuredProduct.price)}
                </span>
              </Link>
            )}
            {otherProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="flex items-center justify-between border-b border-ink/10 pb-4 group"
              >
                <span className="text-base text-ink group-hover:text-burgundy transition-colors">
                  {p.name}
                </span>
                <span className="text-sm text-ink/60">
                  {formatPrice(p.price)}
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/shop"
            className="inline-block mt-10 border border-ink text-ink px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-ink hover:text-offwhite transition-colors"
          >
            {content.spotlight_cta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default RugbyPoloSpotlight;
