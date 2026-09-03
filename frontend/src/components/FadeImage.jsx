import { useState, useEffect } from "react";

function stripCloudinaryTransforms(url) {
  if (!url || !url.includes("/upload/")) return url;
  // Remove any existing Cloudinary transform segment between /upload/ and /v<version> or /<publicId>
  // e.g. /upload/f_auto,q_auto,w_400/v123 -> /upload/v123, /upload/f_auto,q_auto/v123 -> /upload/v123
  return url.replace(/\/upload\/[^/]*\/v/, "/upload/v").replace(/\/upload\/f_auto.*\/v/, "/upload/v");
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

function FadeImage({ src, alt, className, style, loading = "lazy", fallbackClassName }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setRetried(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`${className} ${fallbackClassName || ""} flex items-center justify-center bg-cream border border-ink/10 overflow-hidden`}
        style={style}
        aria-label={alt || "Jegzmenswear"}
        role="img"
      >
        <img
          src="/jegz-black-logo.png"
          alt="Jegzmenswear"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-30"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`${className} opacity-0 transition-opacity duration-700`}
      style={style}
      onLoad={(e) => {
        const img = e.currentTarget;
        // Cloudinary disabled returns 0-byte 1x1 gif with 200 — detect via natural size
        if (img.naturalWidth <= 1 && img.naturalHeight <= 1 && isCloudinaryUrl(currentSrc)) {
          if (!retried) {
            const stripped = stripCloudinaryTransforms(currentSrc);
            if (stripped !== currentSrc) {
              setRetried(true);
              setCurrentSrc(stripped);
              return;
            }
          }
          console.error("[Cloudinary] 1x1 gif — likely disabled account:", currentSrc);
          setFailed(true);
          return;
        }
        img.classList.remove("opacity-0");
      }}
      onError={(e) => {
        const img = e.currentTarget;
        // First failure: if we used a transformed URL, retry with stripped transforms / original
        if (!retried && isCloudinaryUrl(currentSrc) && currentSrc !== src) {
          const stripped = stripCloudinaryTransforms(currentSrc);
          if (stripped !== currentSrc) {
            setRetried(true);
            setCurrentSrc(stripped);
            return;
          }
        }
        if (!retried && isCloudinaryUrl(currentSrc)) {
          // Retry once without transforms if original also fails to rule out transform issue
          const stripped = stripCloudinaryTransforms(currentSrc);
          if (stripped !== currentSrc) {
            setRetried(true);
            setCurrentSrc(stripped);
            return;
          }
        }
        console.error("[Cloudinary] load failed:", currentSrc);
        img.classList.remove("opacity-0");
        setFailed(true);
      }}
    />
  );
}

export default FadeImage;
