import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../utils/authErrors";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
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
      navigate("/login", { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page bg-[#fff8fb] register-page">
      <div className="auth-shell auth-shell-compact overflow-hidden border border-[#ff6da6]/20 bg-white/90 shadow-[0_30px_60px_rgba(255,88,150,0.18)]">
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
                Creator onboarding
              </p>
            </div>
          </div>
          <div>
            <span className="mt-4 inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
              Create account
            </span>
            <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
              Launch your first listing today.
            </h1>
            <p className="mt-2 text-sm text-[#6f3552]">
              Build trust with complete profiles, verified listings, and a smooth
              checkout flow.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/85 p-3 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                Start strong
              </p>
              <div className="mt-2 grid gap-2 text-sm text-[#6f3552]">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                  <span>Profiles help buyers trust your listings.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                  <span>Admin review keeps the catalog clean.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                  <span>Track orders with delivery details.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Verified listings
              </span>
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Local delivery
              </span>
              <span className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                Seller analytics
              </span>
            </div>
          </div>
        </div>

        <div className="auth-right bg-transparent">
          <div className="w-full max-w-xl rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                Get started
              </span>
              <h1 className="mt-2 text-xl font-semibold text-[#4b0f29]">
                Create account
              </h1>
              <p className="mt-1 text-sm text-[#6f3552]">
                Fill in your details to start selling and buying.
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-2 text-sm text-[#a12d5d]">
                {error}
              </div>
            ) : null}

            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="form-row">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
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
              <div className="form-row">
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className={labelClass}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className={inputClass}
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
                <label htmlFor="address" className={labelClass}>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div className="form-row">
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
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                className="rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-1 flex items-center justify-between text-sm text-[#7a3658]">
              <span>Already have an account?</span>
              <Link className="font-semibold text-[#a12d5d]" to="/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

