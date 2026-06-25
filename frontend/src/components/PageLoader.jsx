import onfleekIcon from "../assets/favicon-1.svg";

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
      <img
        src={onfleekIcon}
        alt="Loading"
        style={{
          width: 72,
          height: 72,
          animation: "onfleek-heartbeat 1.2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes onfleek-heartbeat {
          0%   { transform: scale(1);    }
          14%  { transform: scale(1.18); }
          28%  { transform: scale(1);    }
          42%  { transform: scale(1.12); }
          56%  { transform: scale(1);    }
          100% { transform: scale(1);    }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
