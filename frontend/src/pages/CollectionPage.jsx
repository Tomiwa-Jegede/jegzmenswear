import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../lib/axios";
import Skeleton from "../components/ui/Skeleton";
import FadeImage from "../components/FadeImage";
import { optimizedImageUrl } from "../lib/cloudinary";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    api
      .get(`/collections/${slug}`)
      .then((res) => setCollection(res.data))
      .catch(console.error);
  }, [slug]);

  if (!collection) {
    return (
      <div className="px-6 py-12 animate-pulse">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-96 max-w-full mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="bg-ink/10 aspect-[3/4] border border-ink/10 mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${collection.name} | Jegzmenswear`}</title>
        <meta
          name="description"
          content={collection.description ? collection.description.slice(0, 160) : `Shop the ${collection.name} collection at Jegzmenswear.`}
        />
        <link rel="canonical" href={`https://jegzmenswear.store/collections/${collection.slug}`} />
        <meta property="og:title" content={`${collection.name} | Jegzmenswear`} />
        <meta
          property="og:description"
          content={collection.description ? collection.description.slice(0, 160) : `Shop the ${collection.name} collection at Jegzmenswear.`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: collection.name,
            description: collection.description,
            url: `https://jegzmenswear.store/collections/${collection.slug}`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: collection.products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://jegzmenswear.store/products/${p.slug}`,
                name: p.name,
              })),
            },
          })}
        </script>
      </Helmet>
    <div className="px-6 py-12">
      <h1 className="font-serif text-4xl text-ink mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-ink/60 mb-10 max-w-xl">{collection.description}</p>
      )}
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {collection.products.map((p) => (
          <li key={p.id}>
            <Link to={`/products/${p.slug}`} className="group block">
              <div className="bg-cream aspect-[3/4] overflow-hidden mb-3 relative">
                {p.isFullyOutOfStock && (
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-ink text-offwhite text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                    Sold Out
                  </span>
                )}
                {p.images[0] && (
                  <>
                    <FadeImage
                      src={optimizedImageUrl(p.images[0].url, 400)}
                      alt={p.images[0].altText || p.name}
                      className={`absolute inset-0 h-full w-full sm:hidden group-hover:scale-105 transition-transform duration-500 ${
                        p.isFullyOutOfStock ? "grayscale opacity-60" : ""
                      }`}
                      style={{
                        objectPosition: getFocalPoint(
                          p.images[0].mobileCropMode,
                        ),
                      }}
                    />
                    <FadeImage
                      src={optimizedImageUrl(p.images[0].url, 500)}
                      alt={p.images[0].altText || p.name}
                      className={`absolute inset-0 h-full w-full object-cover hidden sm:block group-hover:scale-105 transition-transform duration-500 ${
                        p.isFullyOutOfStock ? "grayscale opacity-60" : ""
                      }`}
                      style={{
                        objectPosition: getFocalPoint(
                          p.images[0].desktopCropMode,
                        ),
                      }}
                    />
                  </>
                )}
                {p.isFullyOutOfStock && (
                  <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                )}
              </div>
              <p className="text-ink text-sm">{p.name}</p>
              <p className="text-ink/50 text-sm">
                ₦{Number(p.price).toLocaleString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}

export default CollectionPage;
