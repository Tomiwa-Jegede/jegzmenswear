import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import api from "../../lib/axios";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import Skeleton from "../../components/ui/Skeleton";

function AdminHeroImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [position, setPosition] = useState(0);
  const [desktopCropMode, setDesktopCropMode] = useState("auto");
  const [desktopCrop, setDesktopCrop] = useState({ x: 0, y: 0 });
  const [desktopZoom, setDesktopZoom] = useState(1);
  const [desktopCroppedArea, setDesktopCroppedArea] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const [mobileCropMode, setMobileCropMode] = useState("auto");
  const [mobileCrop, setMobileCrop] = useState({ x: 0, y: 0 });
  const [mobileZoom, setMobileZoom] = useState(1);
  const [mobileCroppedArea, setMobileCroppedArea] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editingImage, setEditingImage] = useState(null);

  function resetForm() {
    setEditingImage(null);
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setAltText("");
    setPosition(0);
    setDesktopCropMode("auto");
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(1);
    setDesktopCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setMobileCropMode("auto");
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(1);
    setMobileCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setError("");
  }

  function handleEdit(img) {
    setEditingImage(img);
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(img.url);
    setAltText(img.altText || "");
    setPosition(img.position);
    setDesktopCropMode(img.desktopCropMode || "auto");
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(img.desktopZoom || 1);
    setDesktopCroppedArea({
      x: img.desktopCropX ?? 0,
      y: img.desktopCropY ?? 0,
      width: img.desktopCropWidth ?? 100,
      height: img.desktopCropHeight ?? 100,
    });
    setMobileCropMode(img.mobileCropMode || "auto");
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(img.mobileZoom || 1);
    setMobileCroppedArea({
      x: img.mobileCropX ?? 0,
      y: img.mobileCropY ?? 0,
      width: img.mobileCropWidth ?? 100,
      height: img.mobileCropHeight ?? 100,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const usedPositions = useMemo(
    () => images.map((img) => img.position),
    [images]
  );

  const maxSlot = useMemo(() => {
    const highest = usedPositions.length > 0 ? Math.max(...usedPositions) : -1;
    return Math.max(images.length, highest + 1);
  }, [images.length, usedPositions]);

  const positionSlots = useMemo(
    () => Array.from({ length: maxSlot + 1 }, (_, i) => i),
    [maxSlot]
  );

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(1);
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(1);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  function loadImages() {
    api
      .get("/hero-images/all")
      .then((res) => setImages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("handleSubmit fired", { editingImage, file });
    if (!editingImage && !file) return;
    setError("");
    setUploading(true);
    try {
      const payload = {
        altText,
        position: Number(position),
        desktopCropMode,
        desktopCropX: desktopCroppedArea.x,
        desktopCropY: desktopCroppedArea.y,
        desktopCropWidth: desktopCroppedArea.width,
        desktopCropHeight: desktopCroppedArea.height,
        desktopZoom,
        mobileCropMode,
        mobileCropX: mobileCroppedArea.x,
        mobileCropY: mobileCroppedArea.y,
        mobileCropWidth: mobileCroppedArea.width,
        mobileCropHeight: mobileCroppedArea.height,
        mobileZoom,
      };
      if (editingImage) {
        if (file) {
          payload.url = await uploadImageToCloudinary(file);
        }
        console.log("firing PUT", editingImage.id, payload);
        await api.put(`/hero-images/${editingImage.id}`, payload);
      } else {
        payload.url = await uploadImageToCloudinary(file);
        await api.post("/hero-images", payload);
      }
      resetForm();
      loadImages();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(image) {
    await api.put(`/hero-images/${image.id}`, { isActive: !image.isActive });
    loadImages();
  }

  async function handleDelete(id) {
    await api.delete(`/hero-images/${id}`);
    loadImages();
  }

  if (loading) {
    return (
      <div className="px-6 py-12 max-w-3xl">
        <Skeleton className="h-3 w-24 mb-6" />
        <Skeleton className="h-10 w-44 mb-8" />
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

  return (
    <div className="px-6 py-12 max-w-3xl">
      <Link
        to="/admin"
        className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Back to Admin
      </Link>
      <h1 className="font-serif text-3xl text-ink mb-8">Hero Images</h1>

      <form
        onSubmit={handleSubmit}
        className="border border-ink/10 p-6 mb-10 space-y-4"
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Image File
          </label>
          <label
            htmlFor="hero-image-file"
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
            id="hero-image-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            required={!editingImage}
          />
        </div>

        {filePreviewUrl && (
          <div className="space-y-6">
            {/* Desktop crop */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                Desktop Crop
              </label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setDesktopCropMode("auto")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    desktopCropMode === "auto"
                      ? "border-ink bg-ink text-offwhite"
                      : "border-ink/20 text-ink/60 hover:border-ink"
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopCropMode("manual")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    desktopCropMode === "manual"
                      ? "border-ink bg-ink text-offwhite"
                      : "border-ink/20 text-ink/60 hover:border-ink"
                  }`}
                >
                  Manual
                </button>
              </div>
              {desktopCropMode === "manual" && (
                <>
                  <div className="relative w-full max-w-xs aspect-square bg-ink/5 border border-ink/20">
                    <Cropper
                      image={filePreviewUrl}
                      crop={desktopCrop}
                      zoom={desktopZoom}
                      aspect={1}
                      onCropChange={setDesktopCrop}
                      onZoomChange={setDesktopZoom}
                      onCropComplete={(croppedAreaPercent) =>
                        setDesktopCroppedArea(croppedAreaPercent)
                      }
                      showGrid
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={desktopZoom}
                    onChange={(e) => setDesktopZoom(Number(e.target.value))}
                    className="w-full max-w-xs mt-3"
                  />
                </>
              )}
            </div>

            {/* Mobile crop */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                Mobile Crop
              </label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setMobileCropMode("auto")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    mobileCropMode === "auto"
                      ? "border-ink bg-ink text-offwhite"
                      : "border-ink/20 text-ink/60 hover:border-ink"
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setMobileCropMode("manual")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    mobileCropMode === "manual"
                      ? "border-ink bg-ink text-offwhite"
                      : "border-ink/20 text-ink/60 hover:border-ink"
                  }`}
                >
                  Manual
                </button>
              </div>
              {mobileCropMode === "manual" && (
                <>
                  <div className="relative w-full max-w-xs aspect-[9/16] bg-ink/5 border border-ink/20">
                    <Cropper
                      image={filePreviewUrl}
                      crop={mobileCrop}
                      zoom={mobileZoom}
                      aspect={9 / 16}
                      onCropChange={setMobileCrop}
                      onZoomChange={setMobileZoom}
                      onCropComplete={(croppedAreaPercent) =>
                        setMobileCroppedArea(croppedAreaPercent)
                      }
                      showGrid
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={mobileZoom}
                    onChange={(e) => setMobileZoom(Number(e.target.value))}
                    className="w-full max-w-xs mt-3"
                  />
                </>
              )}
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
              const isTaken = usedPositions.includes(slot) && (!editingImage || slot !== editingImage.position);
              const isSelected = Number(position) === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setPosition(slot)}
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
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? "Saving..." : editingImage ? "Save Changes" : "Upload Image"}
          </button>
          {(file || editingImage) && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 text-sm uppercase tracking-[0.15em] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-4">
        {images.map((img) => (
          <li
            key={img.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 border border-ink/10 p-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={img.url}
                alt={img.altText || ""}
                className="w-20 h-20 object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm text-ink">
                  {img.altText || "(no alt text)"}
                </p>
                <p className="text-xs text-ink/50">
                  Position {img.position} ·{" "}
                  {img.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:ml-auto">
              <button
                onClick={() => handleEdit(img)}
                className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(img)}
                className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors cursor-pointer"
              >
                {img.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleDelete(img.id)}
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

export default AdminHeroImages;
