import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const LABELS = {
  "/": "Home",
  "/shop": "Shop",
  "/cart": "Cart",
  "/collections": "Collections",
};

function getLabel(pathname) {
  if (LABELS[pathname]) return LABELS[pathname];
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "products")
    return parts[1]
      ? decodeURIComponent(parts[1]).replace(/-/g, " ")
      : "Product";
  if (parts[0] === "collections")
    return parts[1]
      ? decodeURIComponent(parts[1]).replace(/-/g, " ")
      : "Collection";
  return parts[parts.length - 1]?.replace(/-/g, " ") || "Page";
}

function BreadcrumbTabs() {
  const location = useLocation();
  const [trail, setTrail] = useState([{ path: "/", label: "Home" }]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return; // don't track admin pages

    setTrail((prev) => {
      // Already in trail — truncate to that point
      const existingIndex = prev.findIndex((t) => t.path === path);
      if (existingIndex !== -1) return prev.slice(0, existingIndex + 1);

      // New page — append
      const label = getLabel(path);
      return [...prev, { path, label }];
    });
  }, [location.pathname]);

  if (trail.length <= 1) return null; // only home, nothing to show

  return (
    <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-ink/10 bg-white">
      {trail.map((item, i) => {
        const isActive = i === trail.length - 1;
        return (
          <span key={item.path} className="flex items-center gap-2">
            <Link
              to={item.path}
              className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                isActive ? "text-ink" : "text-ink/40 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
            {i < trail.length - 1 && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink/30"
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default BreadcrumbTabs;
