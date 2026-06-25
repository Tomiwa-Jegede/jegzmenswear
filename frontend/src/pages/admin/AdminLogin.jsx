import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-ink/10 p-8"
      >
        <h1 className="font-serif text-2xl text-ink mb-6">Admin Login</h1>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-ink/20 px-4 py-2 mb-4 text-sm"
          required
        />
        <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/20 px-4 py-2 mb-6 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-offwhite px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-charcoal transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
