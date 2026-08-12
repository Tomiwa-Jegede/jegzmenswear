import api from "./axios";

// Injects Cloudinary delivery transforms (auto format, auto quality, capped width)
// into an existing secure_url without needing to change how URLs are stored.
export function optimizedImageUrl(url, width) {
  if (!url || !url.includes("/upload/")) return url;
  const transforms = width
    ? `f_auto,q_auto,w_${width}`
    : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transforms}/`);
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
