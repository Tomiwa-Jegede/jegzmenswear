import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useToast } from "../../context/ToastContext";

const ORDERS_POLL_INTERVAL_MS = 30000;

function AdminHome() {
  const { showToast } = useToast();
  const [maintenance, setMaintenance] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    api
      .get("/site-content")
      .then((res) => setMaintenance(res.data.maintenance_mode === "true"))
      .catch(console.error);
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
