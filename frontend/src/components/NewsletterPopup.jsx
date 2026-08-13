import { useEffect, useState, useCallback } from "react";
import api from "../lib/axios";

const STORAGE_KEY = "onfleek_newsletter_popup_dismissed";
const MOBILE_DELAY_MS = 8000;
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }, []);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < COOLDOWN_MS) return;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      const timer = setTimeout(() => setVisible(true), MOBILE_DELAY_MS);
      return () => clearTimeout(timer);
    }

    function handleMouseLeave(e) {
      if (e.clientY <= 0) {
        setVisible(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await api.post("/subscribers", { email });
      setAlreadySubscribed(Boolean(res.data?.alreadySubscribed));
      setStatus("submitted");
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000));
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
      setStatus("idle");
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-6"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md bg-offwhite p-6 sm:p-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 text-ink/50 hover:text-ink cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </button>

        {status === "submitted" ? (
          <>
            <h2 className="font-serif text-2xl text-ink mb-3">
              {alreadySubscribed ? "You're already on the list ✓" : "You're on the list ✓"}
            </h2>
            <p className="text-sm text-ink/60">
              {alreadySubscribed
                ? "This email is already confirmed — check your inbox for your discount code."
                : "Check your email to confirm and get your discount code."}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-4">
              Before you go
            </p>
            <h2 className="font-serif text-2xl text-ink mb-3">Get ₦1,000 off every item on your first order.</h2>
            <p className="text-sm text-ink/60 mb-6">
              Sign up for new drops, restocks, and exclusive access.
            </p>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:border sm:border-ink/20 sm:rounded-full sm:overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full border border-ink/20 rounded-full sm:border-0 sm:rounded-none flex-1 px-6 py-4 text-sm bg-transparent focus:outline-none text-ink placeholder-ink/40"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full sm:w-auto rounded-full sm:m-1 px-5 py-3 text-xs uppercase tracking-[0.15em] bg-ink text-offwhite disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? "..." : "Join"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default NewsletterPopup;