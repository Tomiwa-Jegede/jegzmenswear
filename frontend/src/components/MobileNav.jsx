import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
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

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 z-40 sm:hidden"
          />
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-20 left-0 w-[65%] max-w-xs bg-offwhite border border-ink/10 rounded-2xl shadow-xl z-50 sm:hidden flex flex-col px-6 py-6"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
