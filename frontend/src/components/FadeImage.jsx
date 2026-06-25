function FadeImage({ src, alt, className, style, loading = "lazy" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`${className} opacity-0 transition-opacity duration-700`}
      style={style}
      onLoad={(e) => {
        e.currentTarget.classList.remove("opacity-0");
      }}
      onError={(e) => {
        e.currentTarget.classList.remove("opacity-0");
      }}
    />
  );
}

export default FadeImage;
