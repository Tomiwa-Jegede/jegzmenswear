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
      <svg
        viewBox="0 0 72 72"
        role="status"
        aria-label="Loading"
        style={{
          width: 72,
          height: 72,
          color: "var(--color-ink, #1a1a1a)",
        }}
      >
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="163.4"
          style={{
            transformOrigin: "36px 36px",
            animation: "onfleek-draw 1.6s ease-in-out infinite",
          }}
        />
      </svg>
      <style>{`
        @keyframes onfleek-draw {
          0%   { stroke-dashoffset: 163.4; transform: rotate(0deg); }
          50%  { stroke-dashoffset: 40.85; transform: rotate(180deg); }
          100% { stroke-dashoffset: 163.4; transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
