import { useState } from "react";

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to backend
    setSubmitted(true);
  }

  return (
    <div className="border-t border-ink/10 bg-offwhite px-6 py-16 sm:px-10 lg:px-16">
      <div className="max-w-md mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-burgundy mb-4">
          Stay Updated
        </p>
        <h2 className="font-serif text-2xl text-ink mb-3">
          Be the first to know.
        </h2>
        <p className="text-sm text-ink/60 mb-8">
          New drops, restocks, and exclusive access — straight to your inbox.
        </p>
        {submitted ? (
          <p className="text-sm uppercase tracking-[0.2em] text-ink/60">
            You're on the list ✓
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center border border-ink/20 rounded-full overflow-hidden">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-6 py-4 text-sm bg-transparent focus:outline-none text-ink placeholder-ink/40"
            />
            <button
              type="submit"
              className="rounded-full m-1 p-3 cursor-pointer flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "inherit",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h12" />
                <path d="M10 4l5 5-5 5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmailCapture;
