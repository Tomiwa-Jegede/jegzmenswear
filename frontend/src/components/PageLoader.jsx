function PageLoader({ visible }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-offwhite, #f9f6f1)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        role="status"
        aria-label="Loading"
        style={{
          width: 160,
          height: 160,
          backgroundColor: "var(--color-ink, #1a1a1a)",
          WebkitMaskImage: "url(/jegz-black-logo.png)",
          maskImage: "url(/jegz-black-logo.png)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, transparent 35%, var(--color-offwhite, #f9f6f1) 50%, transparent 65%)",
            backgroundSize: "300% 100%",
            animation: "jegz-shimmer 1.8s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes jegz-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
