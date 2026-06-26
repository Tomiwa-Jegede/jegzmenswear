import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/axios";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import Skeleton from "../../components/ui/Skeleton";

const FOCAL_OPTIONS = [
  ["left top", "center top", "right top"],
  ["left center", "center center", "right center"],
  ["left bottom", "center bottom", "right bottom"],
];

function FocalPointPicker({ label, value, onChange }) {
  const current = value || "center center";
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-1 w-28">
        {FOCAL_OPTIONS.flat().map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)} title={v}
            className={`h-8 w-8 border flex items-center justify-center transition-colors cursor-pointer ${current === v ? "border-ink bg-ink" : "border-ink/20 hover:border-ink"}`}>
            <span className={`block w-2 h-2 rounded-full ${current === v ? "bg-offwhite" : "bg-ink/40"}`} />
          </button>
        ))}
      </div>
      <p className="text-[10px] text-ink/40 mt-1">{current}</p>
    </div>
  );
}

const emptyCollectionForm = {
  name: "",
  slug: "",
  description: "",
  position: 0,
  isActive: true,
};

function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "form"
  const [activeCollection, setActiveCollection] = useState(null);
  const [form, setForm] = useState(emptyCollectionForm);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);

  const [desktopFocal, setDesktopFocal] = useState("center center");
  const [mobileFocal, setMobileFocal] = useState("center center");

  function loadCollections() {
    api
      .get("/collections/admin/all")
      .then((res) => setCollections(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCollections();
  }, []);

  const usedPositions = useMemo(
    () => collections.map((c) => c.position),
    [collections],
  );

  const maxSlot = useMemo(() => {
    const highest = usedPositions.length > 0 ? Math.max(...usedPositions) : -1;
    return Math.max(collections.length, highest + 1);
  }, [collections.length, usedPositions]);

  const positionSlots = useMemo(
    () => Array.from({ length: maxSlot + 1 }, (_, i) => i),
    [maxSlot],
  );

  function resetImageState() {
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setAltText("");
    setDesktopFocal("center center");
    setMobileFocal("center center");
  }

  function startCreate() {
    setActiveCollection(null);
    setForm(emptyCollectionForm);
    resetImageState();
    setView("form");
  }

  function startEdit(collection) {
    setActiveCollection(collection);
    setForm({
      name: collection.name,
      description: collection.description || "",
      position: collection.position,
      isActive: collection.isActive,
    });
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(collection.heroImageUrl || null);
    setAltText(collection.altText || "");
    setDesktopFocal(collection.desktopCropMode && collection.desktopCropMode !== "auto" && collection.desktopCropMode !== "manual" ? collection.desktopCropMode : "center center");
    setMobileFocal(collection.mobileCropMode && collection.mobileCropMode !== "auto" && collection.mobileCropMode !== "manual" ? collection.mobileCropMode : "center center");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToList() {
    setView("list");
    setActiveCollection(null);
    setForm(emptyCollectionForm);
    resetImageState();
    loadCollections();
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setUploading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        position: Number(form.position),
        altText,
        desktopCropMode: desktopFocal,
        mobileCropMode: mobileFocal,
      };
      if (file) {
        payload.heroImageUrl = await uploadImageToCloudinary(file);
      }
      if (activeCollection) {
        payload.isActive = form.isActive;
        await api.put(`/collections/${activeCollection.id}`, payload);
      } else {
        await api.post("/collections", payload);
      }
      backToList();
    } catch (err) {
      showToast("Something went wrong. The collection could not be saved. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/collections/${id}`);
    loadCollections();
  }

  if (loading && view === "list") {
    return (
      <div className="px-6 py-12 max-w-3xl">
        <Skeleton className="h-3 w-24 mb-6" />
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border border-ink/10 p-4"
            >
              <Skeleton className="w-20 h-20 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="px-6 py-12 max-w-3xl">
        <Link
          to="/admin"
          className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors mb-6 inline-block"
        >
          ← Back to Admin
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-ink">Collections</h1>
          <button
            onClick={startCreate}
            className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors cursor-pointer"
          >
            New Collection
          </button>
        </div>

        <ul className="space-y-4">
          {collections.map((c) => (
            <li
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 border border-ink/10 p-4"
            >
              <div className="flex items-center gap-4">
                {c.heroImageUrl ? (
                  <img
                    src={c.heroImageUrl}
                    alt={c.altText || ""}
                    className="w-20 h-20 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 bg-ink/5 border border-ink/10" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-ink">{c.name}</p>
                  <p className="text-xs text-ink/50">
                    Position {c.position} · {c.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:ml-auto">
                <button
                  onClick={() => startEdit(c)}
                  className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-3xl">
      <Link
        to="/admin"
        className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Back to Admin
      </Link>
      <h1 className="font-serif text-3xl text-ink mb-8">
        {activeCollection ? "Edit Collection" : "New Collection"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="border border-ink/10 p-6 mb-10 space-y-4"
      >
        

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-ink/20 px-4 py-2 text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-ink/20 px-4 py-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Image File
          </label>
          <label
            htmlFor="collection-image-file"
            className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-ink/30 cursor-pointer hover:border-ink/60 transition-colors text-ink/40 hover:text-ink/70"
          >
            {file ? (
              <span className="text-xs text-center px-2 break-all">
                {file.name}
              </span>
            ) : (
              <span className="text-3xl font-light leading-none">+</span>
            )}
          </label>
          <input
            id="collection-image-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {filePreviewUrl && (
          <div className="space-y-6">
            <div className="relative w-full max-w-xs aspect-[3/4] bg-ink/5 border border-ink/20 overflow-hidden">
              <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: desktopFocal }} />
            </div>
            <div className="flex gap-8 flex-wrap">
              <FocalPointPicker label="Desktop Focus" value={desktopFocal} onChange={setDesktopFocal} />
              <FocalPointPicker label="Mobile Focus" value={mobileFocal} onChange={setMobileFocal} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Alt Text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full border border-ink/20 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Position ({positionSlots.length} slot
            {positionSlots.length === 1 ? "" : "s"} total)
          </label>
          <div className="flex flex-wrap gap-2">
            {positionSlots.map((slot) => {
              const isTaken =
                usedPositions.includes(slot) &&
                (!activeCollection || slot !== activeCollection.position);
              const isSelected = Number(form.position) === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setForm({ ...form, position: slot })}
                  className={`flex h-10 w-10 items-center justify-center border text-sm transition-colors ${
                    isTaken
                      ? "border-ink/10 bg-ink/5 text-ink/30 cursor-not-allowed"
                      : isSelected
                        ? "border-ink bg-ink text-offwhite cursor-pointer"
                        : "border-ink/20 text-ink/70 hover:border-ink cursor-pointer"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {activeCollection && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/60">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : activeCollection
                ? "Save Changes"
                : "Create Collection"}
          </button>
          <button
            type="button"
            onClick={backToList}
            className="px-6 py-3 text-sm uppercase tracking-[0.15em] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCollections;
