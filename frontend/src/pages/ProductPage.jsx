import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../lib/axios";
import { useCart } from "../context/CartContext";
import Skeleton from "../components/ui/Skeleton";
import FadeImage from "../components/FadeImage";
import { optimizedImageUrl } from "../lib/cloudinary";
import MeasurementModal from "../components/MeasurementModal";
import { loadSavedMeasurements } from "../components/MeasurementForm";
import SizeGuideModal from "../components/SizeGuideModal";

function getFocalPoint(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [status, setStatus] = useState("idle");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImageIndex(0);
        const firstInStock = res.data.variants.find((v) => v.stock > 0);
        setSelectedVariantId(firstInStock?.id || res.data.variants[0]?.id || "");
      })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!product || typeof window.gtag !== "function") return;
    window.gtag("event", "view_item", {
      currency: "NGN",
      value: Number(product.price),
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.collection?.name,
          price: Number(product.price),
        },
      ],
    });
  }, [product]);

  useEffect(() => {
    if (!product || typeof window.ttq === "undefined") return;
    window.ttq.track("ViewContent", {
      content_id: product.id,
      content_name: product.name,
      content_category: product.collection?.name,
      price: Number(product.price),
      value: Number(product.price),
      currency: "NGN",
    });
  }, [product]);

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
  const isFullyOutOfStock = product.variants.every((v) => v.stock < 1);
  const isNative = product.collection?.slug === "native";

  const performAddToCart = async (measurements) => {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    setStatus("adding");
    try {
      await addToCart(selectedVariant.id, 1, measurements);
      setStatus("added");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  const performBuyNow = (measurements) => {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        currency: "NGN",
        value: Number(product.price),
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: Number(product.price),
            quantity: 1,
          },
        ],
      });
    }
    navigate("/checkout", {
      state: {
        buyNowItem: {
          variantId: selectedVariant.id,
          quantity: 1,
          productName: product.name,
          size: selectedVariant.size,
          price: Number(product.price),
          measurements,
        },
      },
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    if (isNative) {
      setPendingAction("cart");
      setShowMeasurementModal(true);
      return;
    }
    performAddToCart(undefined);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    if (isNative) {
      setPendingAction("buynow");
      setShowMeasurementModal(true);
      return;
    }
    performBuyNow(undefined);
  };

  const handleMeasurementSubmit = (values) => {
    setShowMeasurementModal(false);
    if (pendingAction === "cart") {
      performAddToCart(values);
    } else if (pendingAction === "buynow") {
      performBuyNow(values);
    }
    setPendingAction(null);
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Jegzmenswear`}</title>
        <meta
          name="description"
          content={product.description ? product.description.slice(0, 160) : `Shop ${product.name} at Jegzmenswear.`}
        />
        <link rel="canonical" href={`https://jegzmenswear.store/products/${product.slug}`} />
        <meta property="og:title" content={`${product.name} | Jegzmenswear`} />
        <meta
          property="og:description"
          content={product.description ? product.description.slice(0, 160) : `Shop ${product.name} at Jegzmenswear.`}
        />
        {product.images?.[0] && <meta property="og:image" content={product.images[0].url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images?.map((img) => img.url) || [],
            sku: product.id,
            offers: {
              "@type": "Offer",
              url: `https://jegzmenswear.store/products/${product.slug}`,
              priceCurrency: "NGN",
              price: Number(product.price),
              availability: product.variants?.some((v) => v.stock > 0)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })}
        </script>
      </Helmet>
    <div className="px-6 pt-6 pb-12 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors cursor-pointer mb-6"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 2L3 7l6 5" />
        </svg>
        Back
      </button>
      <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="bg-cream aspect-[3/4] overflow-hidden relative">
          {product.images[activeImageIndex] && (
            <>
              <FadeImage
                src={optimizedImageUrl(product.images[activeImageIndex].url, 800)}
                alt={product.images[activeImageIndex].altText || product.name}
                className="absolute inset-0 h-full w-full object-cover sm:hidden"
                style={{
                  objectPosition: getFocalPoint(product.images[activeImageIndex].mobileCropMode),
                }}
              />
              <FadeImage
                src={optimizedImageUrl(product.images[activeImageIndex].url, 1000)}
                alt={product.images[activeImageIndex].altText || product.name}
                className="absolute inset-0 h-full w-full object-cover hidden sm:block"
                style={{
                  objectPosition: getFocalPoint(product.images[activeImageIndex].desktopCropMode),
                }}
              />
            </>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(i)}
                className={`flex-shrink-0 w-16 h-20 bg-cream overflow-hidden border transition-colors cursor-pointer ${
                  i === activeImageIndex ? "border-ink" : "border-ink/10 hover:border-ink/40"
                }`}
              >
                <img
                  src={optimizedImageUrl(img.url, 100)}
                  alt={img.altText || ""}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: getFocalPoint(img.desktopCropMode) }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink/40 mb-3">
          {product.collection?.name}
        </p>
        <h1 className="font-serif text-4xl text-ink mb-4">{product.name}</h1>
        <p className="font-sans text-lg text-ink/70 mb-6">
          ₦{Number(product.price).toLocaleString()}
        </p>
        <p className="font-sans text-ink/70 mb-8 whitespace-pre-line">{product.description}</p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink/50">
              Size
            </p>
            <button
              type="button"
              onClick={() => setShowSizeGuide(true)}
              className="text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-ink underline cursor-pointer"
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock < 1}
                onClick={() => setSelectedVariantId(v.id)}
                className={`font-sans rounded-full! px-5 py-2text-sm border transition-colors ${
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
          className="font-sans w-full bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-4 rounded-smhover:bg-charcoal transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {status === "adding"
            ? "Adding..."
            : status === "added"
              ? "Added to Cart"
              : selectedVariant?.stock < 1
                ? "Out of Stock"
                : "Add to Cart"}
        </button>
        {selectedVariant && selectedVariant.stock > 0 && (
          <button
            onClick={handleBuyNow}
            disabled={status === "adding"}
            className="font-sans w-full bg-transparent borderborder-ink text-ink text-sm uppercase tracking-[0.2em] py-4 mt-3 hover:bg-ink hover:text-offwhite transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {isNative ? "Sew Now" : "Buy Now"}
          </button>
        )}
      </div>
    </div>
    </div>
    <MeasurementModal
      open={showMeasurementModal}
      onClose={() => {
        setShowMeasurementModal(false);
        setPendingAction(null);
      }}
      onSubmit={handleMeasurementSubmit}
      initialValues={loadSavedMeasurements()}
      submitLabel={pendingAction === "buynow" ? "Continue to Checkout" : "Add to Cart"}
    />
    {showSizeGuide && (
      <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
    )}
    </>
  );
}

export default ProductPage;
