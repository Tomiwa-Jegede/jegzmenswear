import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useToast } from "../../context/ToastContext";

const ORDERS_POLL_INTERVAL_MS = 30000;

function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function AdminHome() {
  const { showToast } = useToast();
  const [maintenance, setMaintenance] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [cloudinary, setCloudinary] = useState(null);
  const [cloudinaryLoading, setCloudinaryLoading] = useState(true);
  const [cloudinaryError, setCloudinaryError] = useState("");

  useEffect(() => {
    api
      .get("/site-content")
      .then((res) => setMaintenance(res.data.maintenance_mode === "true"))
      .catch(console.error);
  }, []);

  async function fetchCloudinaryUsage() {
    setCloudinaryLoading(true);
    setCloudinaryError("");
    try {
      const res = await api.get("/admin/cloudinary-usage");
      setCloudinary(res.data);
    } catch (err) {
      setCloudinaryError(err.response?.data?.error || err.message || "Could not load Cloudinary usage");
    } finally {
      setCloudinaryLoading(false);
    }
  }

  useEffect(() => {
    fetchCloudinaryUsage();
  }, []);

  useEffect(() => {
    function loadPendingCount() {
      api
        .get("/orders", { params: { status: "PENDING" } })
        .then((res) => setPendingOrderCount(res.data.length))
        .catch(console.error);
    }
    loadPendingCount();
    const interval = setInterval(loadPendingCount, ORDERS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function toggleMaintenance() {
    setToggling(true);
    try {
      const next = !maintenance;
      await api.put("/site-content", { maintenance_mode: String(next) });
      setMaintenance(next);
      showToast(next ? "Maintenance mode is now ON." : "Maintenance mode is now OFF.", "success");
    } catch (err) {
      showToast("Could not update maintenance mode. Please try again.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="px-6 py-12 max-w-2xl">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Admin</h1>
        <button
          onClick={toggleMaintenance}
          disabled={toggling}
          className={`flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
            maintenance
              ? "bg-ink text-offwhite border-ink"
              : "bg-offwhite text-ink/60 border-ink/20 hover:border-ink hover:text-ink"
          }`}
        >
          <span className={`w-8 h-4 rounded-full relative transition-colors ${maintenance ? "bg-offwhite/30" : "bg-ink/10"}`}>
            <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${maintenance ? "bg-offwhite left-4" : "bg-ink/40 left-0.5"}`} />
          </span>
          {toggling ? "Updating..." : maintenance ? "Maintenance: On" : "Maintenance: Off"}
        </button>
      </div>

      <div className="mb-10 border border-ink/10 bg-offwhite p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-ink">Cloudinary credits</h2>
          <button
            onClick={fetchCloudinaryUsage}
            disabled={cloudinaryLoading}
            className="text-[11px] uppercase tracking-[0.15em] text-ink/60 hover:text-ink border border-ink/20 px-3 py-1.5 hover:border-ink transition-colors disabled:opacity-40 cursor-pointer"
          >
            {cloudinaryLoading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {cloudinaryLoading && !cloudinary ? (
          <p className="text-sm text-ink/50">Loading usage…</p>
        ) : cloudinaryError ? (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800">{cloudinaryError}</p>
            <p className="text-xs text-amber-700/70 mt-1">If the account is disabled for exceeding quota, credits show 0 remaining until the next 30-day period or upgrade.</p>
          </div>
        ) : cloudinary ? (
          <>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-ink/70">
                {cloudinary.credits ? `${Number(cloudinary.credits.usage).toFixed(2)} / ${cloudinary.credits.limit} credits` : "—"}
                <span className="ml-2 text-xs text-ink/40">Plan: {cloudinary.plan || "—"}</span>
              </span>
              <span className="text-xs text-ink/50">{cloudinary.last_updated ? new Date(cloudinary.last_updated).toLocaleDateString() : ""}</span>
            </div>
            {cloudinary.credits && (() => {
              const pct = Math.min(100, (cloudinary.credits.usage / cloudinary.credits.limit) * 100);
              const barColor = pct >= 100 ? "bg-red-600" : pct >= 80 ? "bg-amber-500" : "bg-ink";
              return (
                <div className="h-2 bg-ink/10 overflow-hidden mb-4">
                  <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              );
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="border border-ink/10 bg-white px-3 py-3">
                <p className="uppercase tracking-[0.15em] text-ink/40 mb-1">Transformations</p>
                <p className="text-sm text-ink">{cloudinary.transformations ? `${Number(cloudinary.transformations.usage).toLocaleString()} / ${Number(cloudinary.transformations.limit).toLocaleString()}` : "—"}</p>
              </div>
              <div className="border border-ink/10 bg-white px-3 py-3">
                <p className="uppercase tracking-[0.15em] text-ink/40 mb-1">Bandwidth</p>
                <p className="text-sm text-ink">{cloudinary.bandwidth ? `${formatBytes(cloudinary.bandwidth.usage)} / ${formatBytes(cloudinary.bandwidth.limit)}` : "—"}</p>
              </div>
              <div className="border border-ink/10 bg-white px-3 py-3">
                <p className="uppercase tracking-[0.15em] text-ink/40 mb-1">Storage</p>
                <p className="text-sm text-ink">{cloudinary.storage ? `${formatBytes(cloudinary.storage.usage)} / ${formatBytes(cloudinary.storage.limit)}` : "—"}</p>
              </div>
            </div>
            {cloudinary.credits && cloudinary.credits.usage >= cloudinary.credits.limit && (
              <p className="text-xs text-red-600 mt-3">Quota exceeded — images are disabled until reset or upgrade. Reduce transforms (already limited to w_400/w_800) to stay under next period.</p>
            )}
            {cloudinary.credits && cloudinary.credits.usage / cloudinary.credits.limit >= 0.8 && cloudinary.credits.usage < cloudinary.credits.limit && (
              <p className="text-xs text-amber-600 mt-3">Above 80% — consider pruning archived products or upgrading plan.</p>
            )}
          </>
        ) : null}
      </div>
      <ul className="space-y-4">
        <li>
          <Link
            to="/admin/hero"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Hero Images
          </Link>
        </li>
        {/* <li>
          <Link
            to="/admin/campaign"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Campaign Images
          </Link>
        </li> */}
        <li>
          <Link
            to="/admin/products"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Products
          </Link>
        </li>
        <li>
          <Link
            to="/admin/collections"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Collections
          </Link>
        </li>
        {/* <li>
          <Link
            to="/admin/site-content"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Spotlight
          </Link>
        </li> */}
       <li>
          <Link
            to="/admin/music"
            className="block border border-ink/10 px-6 py-4 text-smuppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Music
          </Link>
        </li>
        <li>
          <Link
            to="/admin/orders"
            className="relative block border border-ink/10 px-6 py-4 text-smuppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Orders
            {pendingOrderCount > 0 && (
              <span className="absolute top-1/2 -translate-y-1/2 right-4 bg-red-600 text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center">
                {pendingOrderCount}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/subscribers"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Subscribers
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminHome;
