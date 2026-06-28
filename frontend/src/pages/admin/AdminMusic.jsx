import { useEffect, useState, useRef } from "react";
import api from "../../lib/axios";
import { useToast } from "../../context/ToastContext";

function AdminMusic() {
  const { showToast } = useToast();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get("/music/all")
      .then((res) => setTracks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!title.trim()) return showToast("Title is required.", "error");
    if (!file) return showToast("Please select an audio file.", "error");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("audio", file);
      const res = await api.post("/music", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTracks((prev) => [
        res.data,
        ...prev.map((t) => ({ ...t, isActive: false })),
      ]);
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Track uploaded and set as active.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleActivate(id) {
    try {
      const res = await api.patch(`/music/${id}/activate`);
      setTracks((prev) =>
        prev.map((t) => ({ ...t, isActive: t.id === res.data.id })),
      );
      showToast("Track set as active.", "success");
    } catch (err) {
      showToast("Could not activate track.", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/music/${id}`);
      setTracks((prev) => prev.filter((t) => t.id !== id));
      showToast("Track deleted.", "success");
    } catch (err) {
      showToast("Could not delete track.", "error");
    }
  }

  return (
    <div className="px-6 py-12 max-w-2xl">
      <h1 className="font-serif text-3xl text-ink mb-10">Manage Music</h1>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="border border-ink/10 p-6 mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-4">
          Upload New Track
        </p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Track title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-ink/20 px-4 py-2 text-sm w-full"
          />

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Audio File
            </label>
            <label
              htmlFor="music-audio-file"
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
              id="music-audio-file"
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload & Set Active"}
            </button>
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-6 py-3 text-sm uppercase tracking-[0.15em] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Track list */}
      {loading ? (
        <p className="text-sm text-ink/40">Loading tracks...</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-ink/40">No tracks uploaded yet.</p>
      ) : (
        <ul className="space-y-3">
          {tracks.map((track) => (
            <li
              key={track.id}
              className={`flex items-center justify-between border px-5 py-4 gap-4 ${
                track.isActive ? "border-ink bg-ink/5" : "border-ink/10"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {track.title}
                </p>
                {track.isActive && (
                  <p className="text-xs text-burgundy uppercase tracking-[0.15em] mt-0.5">
                    ▶ Now Active
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!track.isActive && (
                  <button
                    onClick={() => handleActivate(track.id)}
                    className="text-xs uppercase tracking-[0.15em] border border-ink/20 px-3 py-1.5 text-ink hover:bg-ink hover:text-offwhite transition-colors"
                  >
                    Set Active
                  </button>
                )}
                <button
                  onClick={() => handleDelete(track.id)}
                  className="text-xs uppercase tracking-[0.15em] border border-red-200 px-3 py-1.5 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminMusic;
