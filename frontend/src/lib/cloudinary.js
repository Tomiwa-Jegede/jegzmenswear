import api from "./axios";

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
