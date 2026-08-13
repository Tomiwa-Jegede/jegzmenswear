import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../lib/axios";
import Skeleton from "../components/ui/Skeleton";
import FadeImage from "../components/FadeImage";
import { optimizedImageUrl } from "../lib/cloudinary";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function getPageNumbers(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const n of range) {
    if (last) {
      if (n - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (n - last > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(n);
    last = n;
  }

  return rangeWithDots;
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page"), 10);
    return p > 0 ? p : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [newArrivals, setNewArrivals] = useState([]);
  useEffect(() => {
    api
      .get("/collections")
      .then((res) => setCollections(res.data))
      .catch(console.error);
    api
      .get("/products", { params: { page: 1, limit: 8 } })
      .then((res) => setNewArrivals(res.data.products))
      .catch(console.error);
  }, []);

const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    setPage(1);
  }, [search, collectionSlug, minPrice, maxPrice]);
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page > 1) {
        next.set("page", String(page));
      } else {
        next.delete("page");
      }
      return next;
    }, { replace: true });
  }, [page]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (collectionSlug) params.collection = collectionSlug;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      api
        .get("/products", { params })
        .then((res) => {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, collectionSlug, minPrice, maxPrice, page]);

  // const marqueeText = "ALL ORDERS ARE PROCESSED WITHIN 7-14 BUSINESS DAYS BEFORE THEY ARE SENT OUT FOR DELIVERY";
  // const repeated = Array(6).fill(marqueeText);

  return (
    <>
      <Helmet>
        <title>Shop All | Jegzmenswear</title>
        <meta
          name="description"
          content="Browse the full Jegzmenswear catalog — hoodies, jackets, jeans, sneakers, bags, caps, watches and more. Filter by collection, search, and price."
        />
        <link rel="canonical" href="https://jegzmenswear.store/shop" />
      </Helmet>
    <div className="pb-12 bg-white min-h-screen">
      {/* <div className="w-full overflow-hidden border-b border-ink/10 py-3 mb-8 bg-white">
        <div
          className="flex gap-12 w-fit animate-marquee"
          style={{ animation: "marquee 60s linear infinite" }}
        >
          {repeated.map((t, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-ink/70"
            >
              {t} &nbsp;✦
            </span>
          ))}
        </div>
      </div> */}
      <div className="px-6">
      

      {/* <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="w-full border border-ink/20 px-4 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Collection
          </label>
          <select
            value={collectionSlug}
            onChange={(e) => setCollectionSlug(e.target.value)}
            className="w-full border border-ink/20 px-4 py-2 text-sm bg-offwhite"
          >
            <option value="">All Collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 flex-1">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div> */}

      <ul className="flex gap-4 overflow-x-auto pb-2 mb-8 -mx-6 px-6 scrollbar-hide">
        <li className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setCollectionSlug("")}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 border-ink/15 transition-colors ${
                collectionSlug === ""
                  ? "bg-ink/90 text-offwhite"
                  : "bg-cream text-ink/70 group-hover:border-ink/40"
              }`}
            >
              <span className="text-xs uppercase tracking-[0.1em]">All</span>
            </div>
          </button>
        </li>
        {collections.map((c) => (
          <li key={c.id} className="flex-shrink-0">
            <button
              type="button"
              onClick={() => setCollectionSlug(c.slug)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-ink/15 transition-colors relative ${
                  collectionSlug === c.slug ? "" : "group-hover:border-ink/40"
                }`}
              >
                {c.heroImageUrl ? (
                  <FadeImage
                    src={c.heroImageUrl}
                    alt={c.altText || c.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: getFocalPoint(c.desktopCropMode) }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-cream" />
                )}
                {collectionSlug === c.slug && (
                  <div className="absolute inset-0 bg-ink/20" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.1em] text-ink/70 text-center max-w-[80px] sm:max-w-[96px]">
                {c.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!search && !collectionSlug && !minPrice && !maxPrice && newArrivals.length > 0 && (
        <div className="mb-10">
          <h2 className="font-serif text-xl text-ink mb-4">New Arrivals</h2>
          <ul className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {newArrivals.map((p) => (
              <li key={p.id} className="flex-shrink-0 w-36 sm:w-44">
                <Link to={`/products/${p.slug}`} className="group block">
                  <div className="bg-cream aspect-[3/4] overflow-hidden mb-2 relative rounded-lg">
                    <span className="absolute top-2 left-2 z-10 bg-offwhite text-ink text-[9px] sm:text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-ink/10">
                      New 
                    </span>
                    {p.isFullyOutOfStock && (
                      <span className="absolute top-2 right-2 z-10 bg-ink text-offwhite text-[9px] sm:text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded-full">
                        Sold Out
                      </span>
                    )}
                    {p.images[0] && (
                      <FadeImage
                        src={optimizedImageUrl(p.images[0].url, 300)}
                        alt={p.images[0].altText || p.name}
                        className={`absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          p.isFullyOutOfStock ? "grayscale opacity-60" : ""
                        }`}
                        style={{ objectPosition: getFocalPoint(p.images[0].desktopCropMode) }}
                      />
                    )}
                    {p.isFullyOutOfStock && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                    )}
                  </div>
                  <h3 className="font-serif text-xs sm:text-sm text-ink truncate">
                    {p.name}
                  </h3>
                  <p className="text-ink/50 text-xs sm:text-sm">
                    ₦{Number(p.price).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-ink/60">No products found.</p>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="animate-pulse">
                <div className="bg-ink/10 aspect-[3/4] border border-ink/10 mb-3 rounded-lg" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))
          : products.map((p) => (
              <li key={p.id}>
                <Link to={`/products/${p.slug}`} className="group block">
                  <div className="bg-cream aspect-[3/4] overflow-hidden mb-3 relative rounded-lg">
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
                          className={`absolute inset-0 h-full w-full object-cover sm:hidden group-hover:scale-105 transition-transform duration-500 ${
                            p.isFullyOutOfStock ? "grayscale opacity-60" : ""
                          }`}
                         style={{ objectPosition: getFocalPoint(p.images[0].mobileCropMode) }}
                        />
                        <FadeImage
                          src={optimizedImageUrl(p.images[0].url, 500)}
                          alt={p.images[0].altText || p.name}
                          className={`absolute inset-0 h-full w-full object-cover hidden sm:block group-hover:scale-105 transition-transform duration-500 ${
                            p.isFullyOutOfStock ? "grayscale opacity-60" : ""
                          }`}
                         style={{ objectPosition: getFocalPoint(p.images[0].desktopCropMode) }}
                        />
                      </>
                    )}
                    {p.isFullyOutOfStock && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                    )}
                  </div>
                  <h3 className="font-serif text-sm sm:text-lg text-ink mb-1 truncate">
                    {p.name}
                  </h3>
                  <p className="font-sans text-sm text-ink/70">
                    ₦{Number(p.price).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-2 mt-10">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 text-xs uppercase tracking-[0.15em] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          >
            Prev
          </button>

          <span className="sm:hidden text-xs uppercase tracking-[0.15em] text-ink/60 px-2">
            Page {page} of {totalPages}
          </span>

          <div className="hidden sm:flex items-center gap-2">
            {getPageNumbers(page, totalPages).map((n, i) =>
              n === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-xs text-ink/40"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    page === n
                      ? "bg-ink text-offwhite border-ink"
                      : "border-ink/20 text-ink/60 hover:border-ink hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-xs uppercase tracking-[0.15em] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          >
            Next
          </button>
        </div>
      )}
    </div>
    </div>
    </>
  );
}

export default Shop;
