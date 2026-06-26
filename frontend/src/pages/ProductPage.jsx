import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { useCart } from "../context/CartContext";
import Skeleton from "../components/ui/Skeleton";
import FadeImage from "../components/FadeImage";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        const firstInStock = res.data.variants.find((v) => v.stock > 0);
        setSelectedVariantId(firstInStock?.id || res.data.variants[0]?.id || "");
      })
      .catch(console.error);
  }, [slug]);

  if (!product) {
  return (
    <div className="px-6 py-12 grid gap-10 md:grid-cols-2 max-w-5xl mx-auto animate-pulse">
      <div className="bg-ink/10 aspect-[3/4] border border-ink/10" />

      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-32 mb-6" />

        <div className="space-y-3 mb-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <div className="mb-8">
          <Skeleton className="h-3 w-16 mb-3" />

          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-12 border border-ink/10 bg-offwhite"
              />
            ))}
          </div>
        </div>

        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    setStatus("adding");
    try {
      await addToCart(selectedVariant.id, 1);
      setStatus("added");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <div className="px-6 py-12 grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
      <div className="bg-cream aspect-[3/4] overflow-hidden relative">
        {product.images[0] && (
          <>
            <FadeImage
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              className="absolute inset-0 h-full w-full object-cover sm:hidden"
              style={{
                objectPosition: getFocalPoint(product.images[0].mobileCropMode),
              }}
            />
            <FadeImage
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              className="absolute inset-0 h-full w-full object-cover hidden sm:block"
              style={{
                objectPosition: getFocalPoint(product.images[0].desktopCropMode),
              }}
            />
          </>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-ink/40 mb-3">
          {product.collection.name}
        </p>
        <h1 className="font-serif text-4xl text-ink mb-4">{product.name}</h1>
        <p className="text-lg text-ink/70 mb-6">
          ₦{Number(product.price).toLocaleString()}
        </p>
        <p className="text-ink/70 mb-8">{product.description}</p>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-3">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock < 1}
                onClick={() => setSelectedVariantId(v.id)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  v.id === selectedVariantId
                    ? "border-ink bg-ink text-offwhite"
                    : "border-ink/20 text-ink/70"
                } ${v.stock < 1 ? "opacity-30 cursor-not-allowed" : "hover:border-ink cursor-pointer"}`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={
            !selectedVariant || selectedVariant.stock < 1 || status === "adding"
          }
          className="w-full bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-4 hover:bg-charcoal transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {status === "adding"
            ? "Adding..."
            : status === "added"
              ? "Added to Bag"
              : selectedVariant?.stock < 1
                ? "Out of Stock"
                : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}

export default ProductPage;
