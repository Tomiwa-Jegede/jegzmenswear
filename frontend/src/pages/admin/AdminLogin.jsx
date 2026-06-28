import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../context/ToastContext";
import { IconEye, IconEyeOff } from "../../components/icons";

function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      showToast("Incorrect username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-6"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-ink/10 p-8"
      >
        <h1 className="font-serif text-2xl text-ink mb-6">Welcome Back</h1>
        
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
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 px-4 py-2 pr-10 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )}
          </button>
        </div>
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
