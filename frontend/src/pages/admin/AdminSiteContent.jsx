import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/axios";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import Skeleton from "../../components/ui/Skeleton";

const DEFAULTS = {
  spotlight_collection_slug: "",
  spotlight_label: "Spotlight",
  spotlight_headline: "Wear Your Legacy.",
  spotlight_body:
    "Inspired by the confidence of campus icons and reimagined for a generation building its future in real time.",
  spotlight_cta: "View Full Collection",
  spotlight_image_url: "",
};

function AdminSiteContent() {
  const [form, setForm] = useState(DEFAULTS);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [spotlightFile, setSpotlightFile] = useState(null);
  const [spotlightPreview, setSpotlightPreview] = useState(null);
  const [uploadingSpotlight, setUploadingSpotlight] = useState(false);

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
    setSaving(true);
    setSaved(false);
    try {
      let payload = { ...form };
      if (spotlightFile) {
        setUploadingSpotlight(true);
        const url = await uploadImageToCloudinary(spotlightFile);
        payload.spotlight_image_url = url;
        setUploadingSpotlight(false);
      }
      await api.put("/site-content", payload);
      setForm(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      showToast("Your changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
      setUploadingSpotlight(false);
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
      <h1 className="font-serif text-3xl text-ink mb-8">Manage Spotlight</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        

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
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Spotlight Image
            </label>
            {(spotlightPreview || form.spotlight_image_url) && (
              <img
                src={spotlightPreview || form.spotlight_image_url}
                alt="Spotlight preview"
                className="w-40 h-52 object-cover mb-3 border border-ink/10"
              />
            )}
            <label
              htmlFor="spotlight-image-file"
              className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-ink/30 cursor-pointer hover:border-ink/60 transition-colors text-ink/40 hover:text-ink/70"
            >
              {spotlightFile ? (
                <span className="text-xs text-center px-2 break-all">{spotlightFile.name}</span>
              ) : (
                <span className="text-3xl font-light leading-none">+</span>
              )}
            </label>
            <input
              id="spotlight-image-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                setSpotlightFile(f);
                if (spotlightPreview) URL.revokeObjectURL(spotlightPreview);
                setSpotlightPreview(f ? URL.createObjectURL(f) : null);
              }}
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
