import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../utils/authErrors";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]";
  const inputClass =
    "mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email) => {
    setError("");
    setLoading(true);
    try {
      await login(email, "11111111");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page bg-[#fff8fb]">
      <div className="auth-shell overflow-hidden border border-[#ff6da6]/20 bg-white/90 shadow-[0_30px_60px_rgba(255,88,150,0.18)]">
        <div className="auth-left relative overflow-hidden bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff4f9a] to-[#ff79c1] text-sm font-semibold text-white shadow-[0_12px_22px_rgba(255,79,154,0.35)]">
              RM
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                ReMarket
              </p>
              <p className="text-sm font-semibold text-[#4b0f29]">
                Seller lounge
              </p>
            </div>
          </div>
          <div>
            <span className="mt-6 inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
              Welcome back
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-[#4b0f29]">
              Sell smarter. Buy better.
            </h1>
            <p className="mt-2 text-sm text-[#6f3552]">
              A curated marketplace for verified second-hand listings, built for
              fast local delivery.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/85 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                Why sellers choose us
              </p>
              <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                  <span>Approve listings before they go live.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                  <span>Secure payments with transparent fees.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                  <span>Delivery details stored per order.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Verified buyers
              </span>
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Fast approvals
              </span>
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Secure payouts
              </span>
            </div>
          </div>
        </div>

        <div className="auth-right bg-transparent">
          <div className="w-full max-w-md rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                Sign in
              </span>
              <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#6f3552]">
                Use your email and password to continue.
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-2 text-sm text-[#a12d5d]">
                {error}
              </div>
            ) : null}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <button
                className="rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-sm text-[#7a3658]">
              <span>New here?</span>
              <Link className="font-semibold text-[#a12d5d]" to="/register">
                Create an account
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                Demo accounts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("admin@gmail.com")}
                >
                  Admin demo
                </button>
                <button
                  className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("marika@gmail.com")}
                >
                  Marika
                </button>
                <button
                  className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("maisha@gmail.com")}
                >
                  Maisha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
