import { useEffect, useState } from "react";
import api from "../../lib/axios";

function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/subscribers")
      .then((res) => setSubscribers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 sm:px-6 py-12 max-w-2xl">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Subscribers</h1>
        <span className="text-xs uppercase tracking-[0.15em] text-ink/50">
          {subscribers.length} total
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-sm text-ink/60">No subscribers yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {subscribers.map((s) => (
            <li
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-4 sm:px-6 py-4 text-sm"
            >
              <span className="text-ink break-all">{s.email}</span>
              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-xs uppercase tracking-[0.15em] ${
                    s.brevoSynced ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {s.brevoSynced ? "Synced" : "Not synced"}
                </span>
                <span className="text-xs text-ink/40">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminSubscribers;