import { useEffect, useRef, useState, Suspense } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import PageLoader from "../components/PageLoader";
import ScrollToTop from "../components/ScrollToTop";
import Hero from "../components/Hero";
import api from "../lib/axios";
import Footer from "../components/Footer";
import BreadcrumbTabs from "../components/BreadcrumbTabs";
import EmailCapture from "../components/EmailCapture";
import CartDrawer from "../components/CartDrawer";
import WhatsAppBubble from "../components/WhatsAppBubble";
import MobileNav from "../components/MobileNav";
import { useCart } from "../context/CartContext";
import { useAdminAuth } from "../context/AdminAuthContext";

import {
  IconHome,
  IconTag,
  IconUser,
  IconLogIn,
  IconLogOut,
  IconBag,
  IconInfo,
} from "../components/icons";
import { IconInstagram, IconTikTok, IconPinterest } from "../components/Footer";
function MainLayout() {
  const { itemCount, setIsOpen } = useCart();
  const { isAuthenticated, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isShop = location.pathname === "/shop";
  const headerRef = useRef(null);
  const [loaderVisible, setLoaderVisible] = useState(true);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("onfleek_loaded");
    if (hasLoaded) {
      setLoaderVisible(false);
      return;
    }
    setLoaderVisible(true);
    let cancelled = false;

    // Hard ceiling — loader never stays up longer than this
    const MAX_WAIT = 8000;
    const deadline = setTimeout(() => {
      if (!cancelled) {
        sessionStorage.setItem("onfleek_loaded", "1");
        setLoaderVisible(false);
      }
    }, MAX_WAIT);

    let retryCount = 0;
    const MAX_RETRIES = 30; // 30 × 100ms = 3s max waiting for images to appear

    function waitForImages() {
      const imgs = Array.from(document.querySelectorAll("main img"));
      if (imgs.length === 0) {
        retryCount += 1;
        if (retryCount >= MAX_RETRIES) {
          if (!cancelled) {
            sessionStorage.setItem("onfleek_loaded", "1");
            setLoaderVisible(false);
          }
          return;
        }
        const t = setTimeout(waitForImages, 100);
        return () => clearTimeout(t);
      }
      const pending = imgs.filter((img) => !img.complete);
      if (pending.length === 0) {
        if (!cancelled) {
          sessionStorage.setItem("onfleek_loaded", "1");
          setLoaderVisible(false);
        }
        return;
      }
      let remaining = pending.length;
      function onSettle() {
        remaining -= 1;
        if (remaining === 0 && !cancelled) {
          sessionStorage.setItem("onfleek_loaded", "1");
          setLoaderVisible(false);
        }
      }
      pending.forEach((img) => {
        img.addEventListener("load", onSettle, { once: true });
        img.addEventListener("error", onSettle, { once: true });
      });
    }

    // Give React one tick to render the new route before scanning
    const t = setTimeout(waitForImages, 50);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(deadline);
    };
  }, [location.pathname]);
  const [scrolled, setScrolled] = useState(!isHome);
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    api
      .get("/site-content")
      .then((res) => setMaintenance(res.data.maintenance_mode === "true"))
      .catch(() => setMaintenance(false));
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    setScrolled(false);
    const handleScroll = () => {
      const hero = document.querySelector("section[data-hero]");
      if (!hero) return;
      setScrolled(window.scrollY >= hero.offsetHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const setNavHeightVar = () => {
      document.documentElement.style.setProperty(
        "--nav-height",
        `${headerEl.offsetHeight}px`,
      );
    };

    setNavHeightVar();

    const resizeObserver = new ResizeObserver(setNavHeightVar);
    resizeObserver.observe(headerEl);
    window.addEventListener("resize", setNavHeightVar);
    window.addEventListener("orientationchange", setNavHeightVar);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setNavHeightVar);
      window.removeEventListener("orientationchange", setNavHeightVar);
    };
  }, []);
  if (maintenance === null) {
    return (
      <div className="bg-white min-h-screen">
        <PageLoader visible={true} />
      </div>
    );
  }

  const showMaintenance = maintenance && !isAuthenticated && !location.pathname.startsWith("/admin");

  return (
    <div
      className={`bg-white flex flex-col ${showMaintenance ? "h-screen overflow-hidden" : "min-h-screen"}`}
    >
      <ScrollToTop />
      <PageLoader visible={loaderVisible} />
      <style>{`
       .star-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 180px;
          height: 180px;
          margin-top: -90px;
          margin-left: -90px;
          transform-style: preserve-3d;
          animation: star-ring-spin 5s linear infinite;
        }

      .star-ring .star {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 20px;
          line-height: 1;
          transform: translate(-50%, -50%) rotateX(calc(var(--i) * 60deg)) translateZ(50px);
        }

       @media (max-width: 639px) {
          .star-ring {
            width: 106px;
            height: 106px;
            margin-top: -53px;
            margin-left: -53px;
          }
          .star-ring .star {
            font-size: 17px;
            transform: translate(-50%, -50%) rotateX(calc(var(--i) * 60deg)) translateZ(30px);
          }
        }
        @keyframes star-ring-spin {
          from { transform: rotateZ(20deg) rotateX(0deg); }
          to { transform: rotateZ(20deg) rotateX(360deg); }
        }
      `}</style>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-30 px-6 py-10 sm:py-5 flex items-center justify-between transition-colors duration-300 ${
          scrolled ? "bg-white" : "bg-transparent"
        }`}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-[58%] -translate-y-1/2 sm:static sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0">
          <div
            className="relative flex items-center justify-center"
            style={{ perspective: "500px" }}
          >
            {/* <div className="star-ring" aria-hidden="true">
              <span className="star text-[#D4AF37]" style={{ "--i": 0 }}>
                ✦
              </span>
              <span className="star text-[#D4AF37]" style={{ "--i": 1 }}>
                ✦
              </span>
              <span className="star text-[#D4AF37]" style={{ "--i": 2 }}>
                ✦
              </span>
              <span className="star text-[#D4AF37]" style={{ "--i": 3 }}>
                ✦
              </span>
              <span className="star text-[#D4AF37]" style={{ "--i": 4 }}>
                ✦
              </span>
              <span className="star text-[#D4AF37]" style={{ "--i": 5 }}>
                ✦
              </span>
            </div> */}
            <Link to="/" className="relative z-10 flex items-center">
              <img
                src={scrolled ? "/jegz-black-logo.png" : "/jegz-white-logo.png"}
                alt="Jegzmenswear"
                className="h-16 sm:h-24 w-auto"
              />
            </Link>
          </div>
        </div>

        {!showMaintenance && (
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className={`relative z-[60] sm:hidden hover:opacity-80 transition-colors cursor-pointer p-1 ${
              scrolled
                ? "text-ink"
                : "text-offwhite [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.5))]"
            }`}
          >
            {isMobileMenuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="4" y1="4" x2="18" y2="18" />
                <line x1="18" y1="4" x2="4" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </svg>
            )}
          </button>
        )}

        <div className="sm:hidden flex items-center gap-3">
          <Link
            to={isAuthenticated ? "/admin" : "/admin/login"}
            aria-label={isAuthenticated ? "Admin" : "Login"}
            className={`transition-colors p-1 ${
              scrolled
                ? "text-ink hover:text-ink/70"
                : "text-offwhite [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.5))] hover:text-offwhite/80"
            }`}
          >
            {isAuthenticated ? (
              <IconUser className="h-5 w-5" />
            ) : (
              <IconLogIn className="h-5 w-5" />
            )}
          </Link>
          {!showMaintenance && (
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Cart"
              className={`relative transition-colors cursor-pointer p-1 ${
                scrolled
                  ? "text-ink hover:text-ink/70"
                  : "text-offwhite [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.5))] hover:text-offwhite/80"
              }`}
            >
              <IconBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {!showMaintenance && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              <IconHome className="h-3.5 w-3.5" />
              Home
            </Link>
          )}
          {!showMaintenance && (
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              <IconTag className="h-3.5 w-3.5" />
              Shop
            </Link>
          )}
          {!showMaintenance && (
            <Link
              to="/info"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              <IconInfo className="h-3.5 w-3.5" />
              Info
            </Link>
          )}
          {isAuthenticated ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              <IconUser className="h-3.5 w-3.5" />
              Admin
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
            >
              <IconLogIn className="h-3.5 w-3.5" />
              Login
            </Link>
          )}
          {!showMaintenance && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors cursor-pointer"
            >
              <IconBag className="h-4 w-4" />
              Cart {itemCount > 0 && `(${itemCount})`}
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors cursor-pointer"
            >
              <IconLogOut className="h-3.5 w-3.5 text-red-600" />
              Logout
            </button>
          )}
        </div>
      </header>
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        itemCount={itemCount}
        onOpenCart={() => setIsOpen(true)}
        onLogout={logout}
      />
      {showMaintenance ? (
        <>
          <main className="flex-1 overflow-hidden h-screen">
            <Hero maintenanceMode />
          </main>
          <footer className="border-t border-ink/10 bg-offwhite px-6 py-8">
            <div className="flex justify-center gap-6 items-center">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
                <IconInstagram className="h-4 w-4" /> Instagram
              </span>
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
                <IconTikTok className="h-4 w-4" /> TikTok
              </span>
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
                <IconPinterest className="h-4 w-4" /> Pinterest
              </span>
            </div>
          </footer>
        </>
      ) : (
        <>
          <main
            className={isHome ? "" : "flex-1"}
            style={{ paddingTop: isHome ? 0 : "var(--nav-height, 89px)" }}
          >
            {!isHome && <BreadcrumbTabs />}
            <Suspense fallback={<PageLoader visible={true} />}>
              <Outlet />
            </Suspense>
          </main>
          {!isHome && !isShop && <Footer />}
          {isShop && <EmailCapture />}
        </>
      )}
      <CartDrawer />
      {!showMaintenance && <WhatsAppBubble />}
    </div>
  );
}
export default MainLayout;
