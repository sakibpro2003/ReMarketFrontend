import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../utils/authErrors";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="page">
      <div className="auth-shell">
        <div className="auth-left">
          <div className="brand">
            <span className="brand-mark">RM</span>
            ReMarket
          </div>
          <div>
            <h1 className="auth-title">Sell smarter. Buy better.</h1>
            <p className="auth-subtitle">
              A curated marketplace for verified second-hand listings, built for fast
              local delivery.
            </p>
          </div>
          <div className="feature-list">
            <div className="feature-item">Approve listings before they go live.</div>
            <div className="feature-item">Secure payments with transparent fees.</div>
            <div className="feature-item">Delivery details stored per order.</div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div>
              <h1>Sign in</h1>
              <p className="helper-text">Use your email and password to continue.</p>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="meta-row">
              <span>New here?</span>
              <Link to="/register">Create an account</Link>
            </div>

            <div className="form-grid">
              <p className="helper-text">Demo accounts</p>
              <div className="demo-buttons">
                <button
                  className="secondary-btn"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("admin@gmail.com")}
                >
                  Admin demo
                </button>
                <button
                  className="secondary-btn"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("user1@gmail.com")}
                >
                  User 1 demo
                </button>
                <button
                  className="secondary-btn"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("user2@gmail.com")}
                >
                  User 2 demo
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
