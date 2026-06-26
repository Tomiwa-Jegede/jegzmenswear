import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Skeleton from "./ui/Skeleton";
import FadeImage from "./FadeImage";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function CollectionCard({ collection, index }) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-8%", "8%"]);

  ;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: "easeOut" }}
    >
      <Link to={`/collections/${collection.slug}`} className="group block">
        <div className="relative aspect-[3/4] bg-cream border border-ink/10 overflow-hidden mb-5">
          {collection.heroImageUrl ? (
            <>
              <FadeImage
                src={collection.heroImageUrl}
                alt={collection.altText || collection.name}
                className="absolute inset-0 h-full w-full object-cover sm:hidden transition-transform duration-700 group-hover:scale-105"
                style={{
                  objectPosition: getFocalPoint(collection.mobileCropMode),
                }}
              />
              <FadeImage
                src={collection.heroImageUrl}
                alt={collection.altText || collection.name}
                className="absolute inset-0 h-full w-full object-cover hidden sm:block transition-transform duration-700 group-hover:scale-105"
                style={{
                  objectPosition: getFocalPoint(collection.desktopCropMode),
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-end justify-center">
              <span className="mb-4 text-[10px] uppercase tracking-[0.2em] text-ink/40 text-center px-2">
                Collection Image
                <br />
                Placeholder
              </span>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-burgundy mb-2">
          Collection
        </p>
        <h3 className="font-serif text-2xl text-ink mb-2 group-hover:text-burgundy transition-colors">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-ink/70 leading-relaxed mb-4">
            {collection.description}
          </p>
        )}
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink group-hover:text-burgundy transition-colors">
          Explore
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

function FeaturedCollections({ collections }) {
  if (!collections.length) {
  return (
    <section className="px-6 py-20 sm:px-10 lg:px-16">
      <div className="mb-12 max-w-xl animate-pulse">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-ink/10 border border-ink/10 mb-5" />
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  );
}

  return (
    <section className="px-6 py-20 sm:px-10 lg:px-16">
      <div className="mb-12 max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-4">
          Featured
        </p>
        <h2 className="font-serif text-4xl text-ink leading-[1.1]">
          The Collections
        </h2>
      </div>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, i) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedCollections;
