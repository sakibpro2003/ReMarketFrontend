import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../utils/authErrors";

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        password: form.password
      });
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
            <h1 className="auth-title">Launch your first listing today.</h1>
            <p className="auth-subtitle">
              Build trust with complete profiles, verified listings, and a smooth
              checkout flow.
            </p>
          </div>
          <div className="feature-list">
            <div className="feature-item">Profiles help buyers trust your listings.</div>
            <div className="feature-item">Admin review keeps the catalog clean.</div>
            <div className="feature-item">Track orders with delivery details.</div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div>
              <h1>Create account</h1>
              <p className="helper-text">
                Fill in your details to start selling and buying.
              </p>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-row">
                <div>
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
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
              <div className="form-row">
                <div>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
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
                <div>
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="meta-row">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
