
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconTag,
  IconUser,
  IconLogIn,
  IconLogOut,
  IconBag,
  IconInfo,
} from "./icons";

function MobileNav({
  isOpen,
  onClose,
  isAuthenticated,
  itemCount,
  onOpenCart,
  onLogout,
}) {
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/40 z-40 sm:hidden transition-opacity duration-250 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`fixed top-20 left-0 w-[65%] max-w-xs bg-offwhite border border-ink/10 rounded-2xl shadow-xl z-50 sm:hidden flex flex-col px-6 py-6 transition-all duration-300 ease-out ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
        }`}
      >
            <div className="mb-6">
              <span className="font-serif text-xl text-ink">Menu</span>
            </div>
            <nav className="flex flex-col">
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors"
              >
                <IconHome className="h-4 w-4" />
                Home
              </Link>
              <div className="w-full border-b border-ink/10 my-4" />
              <Link
                to="/shop"
                onClick={onClose}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors"
              >
                <IconTag className="h-4 w-4" />
                Shop
              </Link>
              <div className="w-full border-b border-ink/10 my-4" />
              <Link
                to="/info"
                onClick={onClose}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors"
              >
                <IconInfo className="h-4 w-4" />
                Info
              </Link>
              <div className="w-full border-b border-ink/10 my-4" />
              {isAuthenticated && (
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex items-center gap-2 text-left text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors cursor-pointer"
                >
                  <IconLogOut className="h-4 w-4 text-red-600" />
                  Logout
                </button>
              )}
            </nav>
          </div>
    </>
  );
}

export default MobileNav;
