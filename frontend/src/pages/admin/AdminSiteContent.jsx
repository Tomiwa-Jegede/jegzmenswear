import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import Skeleton from "../../components/ui/Skeleton";

const DEFAULTS = {
  spotlight_collection_slug: "rugby-polo",
  spotlight_label: "Spotlight",
  spotlight_headline: "Wear Your Legacy.",
  spotlight_body:
    "Inspired by the confidence of campus icons and reimagined for a generation building its future in real time.",
  spotlight_cta: "View Full Collection",
};

function AdminSiteContent() {
  const [form, setForm] = useState(DEFAULTS);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/site-content"), api.get("/collections/admin/all")])
      .then(([contentRes, collectionsRes]) => {
        setForm({ ...DEFAULTS, ...contentRes.data });
        setCollections(collectionsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/site-content", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-12 max-w-2xl">
        <Skeleton className="h-3 w-24 mb-6" />
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-2xl">
      <Link
        to="/admin"
        className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Back to Admin
      </Link>
      <h1 className="font-serif text-3xl text-ink mb-8">Site Content</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Rugby Polo Spotlight */}
        <section className="border border-ink/10 p-6 space-y-4">
          <h2 className="font-serif text-xl text-ink">Spotlight Section</h2>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Collection
            </label>
            <select
              value={form.spotlight_collection_slug}
              onChange={(e) => set("spotlight_collection_slug", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm bg-offwhite"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                  {!c.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Label
            </label>
            <input
              type="text"
              value={form.spotlight_label}
              onChange={(e) => set("spotlight_label", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Headline
            </label>
            <input
              type="text"
              value={form.spotlight_headline}
              onChange={(e) => set("spotlight_headline", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Body
            </label>
            <textarea
              rows={3}
              value={form.spotlight_body}
              onChange={(e) => set("spotlight_body", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              CTA Button Label
            </label>
            <input
              type="text"
              value={form.spotlight_cta}
              onChange={(e) => set("spotlight_cta", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
            />
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
          {saved && (
            <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
              Saved ✓
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdminSiteContent;
