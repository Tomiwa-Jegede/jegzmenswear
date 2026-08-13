import { useEffect } from "react";
import { useRouteError, Link } from "react-router-dom";

const RELOAD_FLAG_KEY = "onfleek_chunk_reload_attempted";

function isChunkLoadError(error) {
  const message = error?.message || String(error || "");
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  );
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    if (!chunkError) return;

    const alreadyAttempted = sessionStorage.getItem(RELOAD_FLAG_KEY);
    if (alreadyAttempted) return;

    sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
    window.location.reload();
  }, [chunkError]);

  useEffect(() => {
    if (!chunkError) {
      // Clear the flag once we've successfully rendered a route without a
      // chunk error, so a future real update doesn't get silently skipped.
      sessionStorage.removeItem(RELOAD_FLAG_KEY);
    }
  }, [chunkError]);

  if (chunkError) {
    return (
      <div className="px-6 py-20 text-center max-w-md mx-auto">
        <h1 className="font-serif text-2xl text-ink mb-4">Updating…</h1>
        <p className="text-sm text-ink/60">
          We just released an update. Refreshing the page for you.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-20 text-center max-w-md mx-auto">
      <h1 className="font-serif text-2xl text-ink mb-4">
        Something Went Wrong
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        Please try again, or head back to the homepage.
      </p>
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default RouteErrorBoundary;