import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import api from "../../lib/axios";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import Skeleton from "../../components/ui/Skeleton";

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  collectionId: "",
  isFeatured: false,
  isActive: true,
};

const emptyVariantForm = { size: "", color: "", sku: "", stock: 0 };
const emptyImageForm = { altText: "", position: 0 };

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [view, setView] = useState("list"); // "list" | "form"
  const [createStep, setCreateStep] = useState(1); // 1 | 2 | 3 — only used when !activeProduct
  const [pendingVariants, setPendingVariants] = useState([]); // local variants before product exists
  const [activeProduct, setActiveProduct] = useState(null); // full product record while editing
  const [form, setForm] = useState(emptyProductForm);
  const [variantForm, setVariantForm] = useState(emptyVariantForm);
  const [variantEdits, setVariantEdits] = useState({}); // { [variantId]: {size,color,sku,stock} }
  const [imageFile, setImageFile] = useState(null);
  const [imageForm, setImageForm] = useState(emptyImageForm);
  const [uploading, setUploading] = useState(false);
  const [imageFilePreviewUrl, setImageFilePreviewUrl] = useState(null);
  const [desktopCropMode, setDesktopCropMode] = useState("auto");
  const [desktopCrop, setDesktopCrop] = useState({ x: 0, y: 0 });
  const [desktopZoom, setDesktopZoom] = useState(1);
  const [desktopCroppedArea, setDesktopCroppedArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [mobileCropMode, setMobileCropMode] = useState("auto");
  const [mobileCrop, setMobileCrop] = useState({ x: 0, y: 0 });
  const [mobileZoom, setMobileZoom] = useState(1);
  const [mobileCroppedArea, setMobileCroppedArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
   const [error, setError] = useState("");
   const [saving, setSaving] = useState(false);
   const [loading, setLoading] = useState(true);
   function loadProducts() {
     api
       .get("/products/admin/all")
       .then((res) => setProducts(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
   }

  function loadCollections() {
    api
      .get("/collections/admin/all")
      .then((res) => setCollections(res.data))
      .catch(console.error);
  }

  useEffect(() => {
    loadProducts();
    loadCollections();
  }, []);

  function startCreate() {
    setActiveProduct(null);
    setForm(emptyProductForm);
    setVariantForm(emptyVariantForm);
    setPendingVariants([]);
    setImageFile(null);
    setImageFilePreviewUrl(null);
    setImageForm(emptyImageForm);
    setDesktopCropMode("auto");
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(1);
    setDesktopCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setMobileCropMode("auto");
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(1);
    setMobileCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setError("");
    setCreateStep(1);
    setView("form");
  }

  async function startEdit(productId) {
    setError("");
    try {
      const { data } = await api.get(`/products/admin/${productId}`);
      setActiveProduct(data);
      setForm({
        name: data.name,
        description: data.description || "",
        price: data.price,
        collectionId: data.collectionId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      });
      const edits = {};
      data.variants.forEach((v) => {
        edits[v.id] = {
          size: v.size,
          color: v.color || "",
          sku: v.sku,
          stock: v.stock,
        };
      });
      setVariantEdits(edits);
      setView("form");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load product");
    }
  }

  function backToList() {
    setView("list");
    setActiveProduct(null);
    setForm(emptyProductForm);
    setVariantForm(emptyVariantForm);
    setVariantEdits({});
    setPendingVariants([]);
    setCreateStep(1);
    setImageFile(null);
    setImageFilePreviewUrl(null);
    setImageForm(emptyImageForm);
    setDesktopCropMode("auto");
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(1);
    setDesktopCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setMobileCropMode("auto");
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(1);
    setMobileCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
    setError("");
    loadProducts();
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setError("");
    if (activeProduct) {
      // Edit mode — save product details immediately as before
      setSaving(true);
      try {
        const payload = {
          name: form.name,
          description: form.description,
          price: form.price,
          collectionId: form.collectionId,
          isFeatured: form.isFeatured,
          isActive: form.isActive,
        };
        const { data } = await api.put(`/products/${activeProduct.id}`, payload);
        setActiveProduct({ ...activeProduct, ...data });
      } catch (err) {
        setError(err.response?.data?.error || "Save failed");
      } finally {
        setSaving(false);
      }
      return;
    }
    // Create mode — step 1: just advance to variant step
    setCreateStep(2);
  }

  function handleAddPendingVariant(e) {
    e.preventDefault();
    if (!variantForm.size || !variantForm.sku) return;
    setPendingVariants((prev) => [...prev, { ...variantForm, id: Date.now() }]);
    setVariantForm(emptyVariantForm);
  }

  function handleRemovePendingVariant(id) {
    setPendingVariants((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleFinalCreate(e) {
    e.preventDefault();
    if (!imageFile) return;
    setError("");
    setSaving(true);
    try {
      // 1. Create product
      const { data: product } = await api.post("/products", {
        name: form.name,
        description: form.description,
        price: form.price,
        collectionId: form.collectionId,
        isFeatured: form.isFeatured,
      });
      // 2. Create all pending variants
      for (const v of pendingVariants) {
        await api.post(`/products/${product.id}/variants`, {
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: Number(v.stock),
        });
      }
      // 3. Upload image and attach
      const url = await uploadImageToCloudinary(imageFile);
      await api.post(`/products/${product.id}/images`, {
        url,
        altText: imageForm.altText,
        position: Number(imageForm.position),
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
      });
      // 4. Switch to edit mode for the completed product
      await startEdit(product.id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id) {
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  // Variants
  async function handleAddVariant(e) {
    e.preventDefault();
    if (!activeProduct) return;
    setError("");
    try {
      await api.post(`/products/${activeProduct.id}/variants`, {
        size: variantForm.size,
        color: variantForm.color,
        sku: variantForm.sku,
        stock: Number(variantForm.stock),
      });
      setVariantForm(emptyVariantForm);
      await startEdit(activeProduct.id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add variant");
    }
  }

  function updateVariantEdit(variantId, field, value) {
    setVariantEdits((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  }

  async function handleSaveVariant(variantId) {
    setError("");
    const edit = variantEdits[variantId];
    try {
      await api.put(`/products/variants/${variantId}`, {
        size: edit.size,
        color: edit.color,
        sku: edit.sku,
        stock: Number(edit.stock),
      });
      await startEdit(activeProduct.id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save variant");
    }
  }

  async function handleDeleteVariant(variantId) {
    await api.delete(`/products/variants/${variantId}`);
    await startEdit(activeProduct.id);
  }

  // Images
  function handleImageFileChange(e) {
    const selected = e.target.files[0];
    setImageFile(selected);
    setDesktopCrop({ x: 0, y: 0 });
    setDesktopZoom(1);
    setMobileCrop({ x: 0, y: 0 });
    setMobileZoom(1);
    if (imageFilePreviewUrl) URL.revokeObjectURL(imageFilePreviewUrl);
    setImageFilePreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleAddImage(e) {
    e.preventDefault();
    if (!activeProduct || !imageFile) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(imageFile);
      await api.post(`/products/${activeProduct.id}/images`, {
        url,
        altText: imageForm.altText,
        position: Number(imageForm.position),
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
      });
      setImageFile(null);
      setImageFilePreviewUrl(null);
      setImageForm(emptyImageForm);
      setDesktopCropMode("auto");
      setDesktopCrop({ x: 0, y: 0 });
      setDesktopZoom(1);
      setDesktopCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
      setMobileCropMode("auto");
      setMobileCrop({ x: 0, y: 0 });
      setMobileZoom(1);
      setMobileCroppedArea({ x: 0, y: 0, width: 100, height: 100 });
      await startEdit(activeProduct.id);
    } catch (err) {
      setError(err.response?.data?.error || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(imageId) {
    await api.delete(`/products/images/${imageId}`);
    await startEdit(activeProduct.id);
  }
if (loading && view === "list") {
  return (
    <div className="px-6 py-12 max-w-4xl">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-ink/10 p-4 flex gap-4">
            <Skeleton className="w-16 h-16" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
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
      <h1 className="font-serif text-3xl text-ink mb-8">
        {activeProduct ? "Edit Product" : "New Product"}
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* ── Step indicator (create mode only) ── */}
      {!activeProduct && (
        <div className="flex items-center gap-3 mb-8">
          {["Details", "Variants", "Image"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`text-xs uppercase tracking-[0.2em] ${createStep === i + 1 ? "text-ink font-medium" : "text-ink/30"}`}>
                {i + 1}. {label}
              </span>
              {i < 2 && <span className="text-ink/20">→</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Step 1: Product details ── */}
      {(createStep === 1 || activeProduct) && (
        <form
          onSubmit={handleProductSubmit}
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-ink/20 px-4 py-2 text-sm"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                Collection
              </label>
              <select
                value={form.collectionId}
                onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
                className="w-full border border-ink/20 px-4 py-2 text-sm bg-offwhite"
                required
              >
                <option value="" disabled>Select collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{!c.isActive ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/60">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured
            </label>
            {activeProduct && (
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/60">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : activeProduct ? "Save Product" : "Next: Add Variants →"}
          </button>
        </form>
      )}

      {/* ── Step 2: Variants (create mode only — edit mode uses the section below) ── */}
      {!activeProduct && createStep === 2 && (
        <div className="border border-ink/10 p-6 mb-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-2">Add at least one variant before continuing.</p>
          {pendingVariants.length > 0 && (
            <ul className="space-y-2 mb-4">
              {pendingVariants.map((v) => (
                <li key={v.id} className="flex items-center gap-3 border border-ink/10 p-2 text-sm">
                  <span className="text-ink">{v.size}</span>
                  {v.color && <span className="text-ink/50">{v.color}</span>}
                  <span className="text-ink/50">{v.sku}</span>
                  <span className="text-ink/50">Stock: {v.stock}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePendingVariant(v.id)}
                    className="ml-auto text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleAddPendingVariant} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={variantForm.size}
              onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
              placeholder="Size"
              className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
              required
            />
            <input
              type="text"
              value={variantForm.color}
              onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
              placeholder="Color"
              className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-24"
            />
            <input
              type="text"
              value={variantForm.sku}
              onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
              placeholder="SKU"
              className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-32"
              required
            />
            <input
              type="number"
              value={variantForm.stock}
              onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
              placeholder="Stock"
              className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
            />
            <button
              type="submit"
              className="bg-ink text-offwhite px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-charcoal transition-colors cursor-pointer"
            >
              Add
            </button>
          </form>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateStep(1)}
              className="text-sm uppercase tracking-[0.15em] text-ink/60 hover:text-ink transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={pendingVariants.length === 0}
              onClick={() => setCreateStep(3)}
              className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next: Add Image →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Image (create mode only) ── */}
      {!activeProduct && createStep === 3 && (
        <form onSubmit={handleFinalCreate} className="border border-ink/10 p-6 mb-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-2">Add at least one image to complete the product.</p>
          <label
            htmlFor="product-image-file"
            className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-ink/30 cursor-pointer hover:border-ink/60 transition-colors text-ink/40 hover:text-ink/70"
          >
            {imageFile ? (
              <span className="text-xs text-center px-2 break-all">{imageFile.name}</span>
            ) : (
              <span className="text-3xl font-light leading-none">+</span>
            )}
          </label>
          <input
            id="product-image-file"
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
            required
          />
          {imageFilePreviewUrl && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">Desktop Crop</label>
                <div className="flex gap-3 mb-3">
                  <button type="button" onClick={() => setDesktopCropMode("auto")}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${desktopCropMode === "auto" ? "border-ink bg-ink text-offwhite" : "border-ink/20 text-ink/60 hover:border-ink"}`}>Auto</button>
                  <button type="button" onClick={() => setDesktopCropMode("manual")}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${desktopCropMode === "manual" ? "border-ink bg-ink text-offwhite" : "border-ink/20 text-ink/60 hover:border-ink"}`}>Manual</button>
                </div>
                {desktopCropMode === "manual" && (
                  <>
                    <div className="relative w-full max-w-xs aspect-square bg-ink/5 border border-ink/20">
                      <Cropper image={imageFilePreviewUrl} crop={desktopCrop} zoom={desktopZoom} aspect={1}
                        onCropChange={setDesktopCrop} onZoomChange={setDesktopZoom}
                        onCropComplete={(a) => setDesktopCroppedArea(a)} showGrid />
                    </div>
                    <input type="range" min={1} max={3} step={0.01} value={desktopZoom}
                      onChange={(e) => setDesktopZoom(Number(e.target.value))} className="w-full max-w-xs mt-3" />
                  </>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">Mobile Crop</label>
                <div className="flex gap-3 mb-3">
                  <button type="button" onClick={() => setMobileCropMode("auto")}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${mobileCropMode === "auto" ? "border-ink bg-ink text-offwhite" : "border-ink/20 text-ink/60 hover:border-ink"}`}>Auto</button>
                  <button type="button" onClick={() => setMobileCropMode("manual")}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${mobileCropMode === "manual" ? "border-ink bg-ink text-offwhite" : "border-ink/20 text-ink/60 hover:border-ink"}`}>Manual</button>
                </div>
                {mobileCropMode === "manual" && (
                  <>
                    <div className="relative w-full max-w-xs aspect-[9/16] bg-ink/5 border border-ink/20">
                      <Cropper image={imageFilePreviewUrl} crop={mobileCrop} zoom={mobileZoom} aspect={9 / 16}
                        onCropChange={setMobileCrop} onZoomChange={setMobileZoom}
                        onCropComplete={(a) => setMobileCroppedArea(a)} showGrid />
                    </div>
                    <input type="range" min={1} max={3} step={0.01} value={mobileZoom}
                      onChange={(e) => setMobileZoom(Number(e.target.value))} className="w-full max-w-xs mt-3" />
                  </>
                )}
              </div>
            </div>
          )}
          <input type="text" value={imageForm.altText}
            onChange={(e) => setImageForm({ ...imageForm, altText: e.target.value })}
            placeholder="Alt text" className="w-full border border-ink/20 px-4 py-2 text-sm" />
          <input type="number" value={imageForm.position}
            onChange={(e) => setImageForm({ ...imageForm, position: e.target.value })}
            placeholder="Position" className="w-full border border-ink/20 px-4 py-2 text-sm" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setCreateStep(2)}
              className="text-sm uppercase tracking-[0.15em] text-ink/60 hover:text-ink transition-colors cursor-pointer">
              ← Back
            </button>
            <button type="submit" disabled={saving || !imageFile}
              className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      )}

      {activeProduct && (
        <>
          <section className="mb-10">
            <h2 className="font-serif text-xl text-ink mb-4">Variants</h2>
            <ul className="space-y-3 mb-4">
              {activeProduct.variants.map((v) => {
                const edit = variantEdits[v.id] || {};
                return (
                  <li
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 border border-ink/10 p-3"
                  >
                    <input
                      type="text"
                      value={edit.size || ""}
                      onChange={(e) =>
                        updateVariantEdit(v.id, "size", e.target.value)
                      }
                      placeholder="Size"
                      className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
                    />
                    <input
                      type="text"
                      value={edit.color || ""}
                      onChange={(e) =>
                        updateVariantEdit(v.id, "color", e.target.value)
                      }
                      placeholder="Color"
                      className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-24"
                    />
                    <input
                      type="text"
                      value={edit.sku || ""}
                      onChange={(e) =>
                        updateVariantEdit(v.id, "sku", e.target.value)
                      }
                      placeholder="SKU"
                      className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-32"
                    />
                    <input
                      type="number"
                      value={edit.stock ?? 0}
                      onChange={(e) =>
                        updateVariantEdit(v.id, "stock", e.target.value)
                      }
                      placeholder="Stock"
                      className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
                    />
                    <div className="flex gap-3 sm:ml-auto">
                      <button
                        onClick={() => handleSaveVariant(v.id)}
                        className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <form
              onSubmit={handleAddVariant}
              className="flex flex-col sm:flex-row gap-3 border border-ink/10 p-3"
            >
              <input
                type="text"
                value={variantForm.size}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, size: e.target.value })
                }
                placeholder="Size"
                className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
                required
              />
              <input
                type="text"
                value={variantForm.color}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, color: e.target.value })
                }
                placeholder="Color"
                className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-24"
              />
              <input
                type="text"
                value={variantForm.sku}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, sku: e.target.value })
                }
                placeholder="SKU"
                className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-32"
                required
              />
              <input
                type="number"
                value={variantForm.stock}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, stock: e.target.value })
                }
                placeholder="Stock"
                className="border border-ink/20 px-2 py-1 text-sm w-full sm:w-20"
              />
              <button
                type="submit"
                className="bg-ink text-offwhite px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-charcoal transition-colors"
              >
                Add Variant
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-4">Images</h2>
            <ul className="space-y-3 mb-4">
              {activeProduct.images.map((img) => (
                <li
                  key={img.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 border border-ink/10 p-3"
                >
                  <img
                    src={img.url}
                    alt={img.altText || ""}
                    className="w-16 h-16 object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-ink">
                      {img.altText || "(no alt text)"}
                    </p>
                    <p className="text-xs text-ink/50">
                      Position {img.position}
                      {img.isPlaceholder ? " · Placeholder" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors sm:ml-auto"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={handleAddImage}
              className="border border-ink/10 p-4 space-y-3"
            >
              <label
                htmlFor="product-image-file"
                className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-ink/30 cursor-pointer hover:border-ink/60 transition-colors text-ink/40 hover:text-ink/70"
              >
                {imageFile ? (
                  <span className="text-xs text-center px-2 break-all">
                    {imageFile.name}
                  </span>
                ) : (
                  <span className="text-3xl font-light leading-none">+</span>
                )}
              </label>
              <input
                id="product-image-file"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                required
              />
              {imageFilePreviewUrl && (
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
                            image={imageFilePreviewUrl}
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
                            image={imageFilePreviewUrl}
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
              <input
                type="text"
                value={imageForm.altText}
                onChange={(e) =>
                  setImageForm({ ...imageForm, altText: e.target.value })
                }
                placeholder="Alt text"
                className="w-full border border-ink/20 px-4 py-2 text-sm"
              />
              <input
                type="number"
                value={imageForm.position}
                onChange={(e) =>
                  setImageForm({ ...imageForm, position: e.target.value })
                }
                placeholder="Position"
                className="w-full border border-ink/20 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={uploading}
                className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminProducts;
