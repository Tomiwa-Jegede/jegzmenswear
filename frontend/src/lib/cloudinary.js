import api from "./axios";

// Allowlist to keep Cloudinary credits under Free 25 quota.
// Before: 9 distinct widths (150,300,400,500,700,800,900,1000,1600) → 9 transforms per image.
// After: only 2 distinct widths (400,800) + q_auto:eco → ~75% fewer transformations & bandwidth.
// 400 = grid/thumbnail, 800 = hero/detail. Any requested width is bucketed.
const ALLOWED_WIDTHS = [400, 800];

function bucketWidth(requested) {
  if (!requested) return null;
  if (requested <= 400) return 400;
  return 800;
}

// Injects Cloudinary delivery transforms (auto format, eco quality, capped width)
// Idempotent: strips any existing transform segment to avoid double-injection.
export function optimizedImageUrl(url, width) {
  if (!url || !url.includes("/upload/")) return url;
  const stripped = url.replace(/\/upload\/[^/]*\/v/, "/upload/v");
  const b = bucketWidth(width);
  const transforms = b ? `f_auto,q_auto:eco,w_${b}` : "f_auto,q_auto:eco";
  return stripped.replace("/upload/", `/upload/${transforms}/`);
}

export function getOriginalCloudinaryUrl(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(/\/upload\/[^/]*\/v/, "/upload/v");
}

export async function uploadImageToCloudinary(file) {
  const { data } = await api.get("/admin/cloudinary-signature");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.apiKey);
  formData.append("timestamp", data.timestamp);
  formData.append("signature", data.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const json = await res.json();
  return json.secure_url;
}
