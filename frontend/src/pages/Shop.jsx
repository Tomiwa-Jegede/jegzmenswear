import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import Skeleton from "../components/ui/Skeleton";
import FadeImage from "../components/FadeImage";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function Shop() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/collections")
      .then((res) => setCollections(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (collectionSlug) params.collection = collectionSlug;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      api
        .get("/products", { params })
        .then((res) => setProducts(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, collectionSlug, minPrice, maxPrice]);

  return (
    <div className="px-6 py-12">
      <h1 className="font-serif text-4xl text-ink mb-10">Shop</h1>

      {/* <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
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

      {!loading && products.length === 0 && (
        <p className="text-ink/60">No products found.</p>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="animate-pulse">
                <div className="bg-ink/10 aspect-[3/4] border border-ink/10 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))
          : products.map((p) => (
              <li key={p.id}>
                <Link to={`/products/${p.slug}`} className="group block">
                  <div className="bg-cream aspect-[3/4] overflow-hidden mb-3 relative">
                    {p.images[0] && (
                      <>
                        <FadeImage
                          src={p.images[0].url}
                          alt={p.images[0].altText || p.name}
                          className="absolute inset-0 h-full w-full sm:hidden group-hover:scale-105 transition-transform duration-500"
                         style={{ objectPosition: getFocalPoint(p.images[0].mobileCropMode) }}
                        />
                        <FadeImage
                          src={p.images[0].url}
                          alt={p.images[0].altText || p.name}
                          className="absolute inset-0 h-full w-full hidden sm:block group-hover:scale-105 transition-transform duration-500"
                         style={{ objectPosition: getFocalPoint(p.images[0].desktopCropMode) }}
                        />
                      </>
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
  );
}

export default Shop;
