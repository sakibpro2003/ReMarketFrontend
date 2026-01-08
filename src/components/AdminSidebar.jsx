import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  [
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] text-white shadow-[0_12px_22px_rgba(255,79,154,0.35)]"
      : "text-[#7a3658] hover:bg-white/80"
  ].join(" ");

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "A";

  return (
    <aside className="grid w-full gap-5 rounded-[24px] border border-[#ff6da6]/25 bg-white/90 p-5 shadow-[0_22px_40px_rgba(255,88,150,0.18)] backdrop-blur lg:sticky lg:top-5 lg:max-w-[260px]">
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#ff4f9a] via-[#ff79c1] to-[#ffd0e5]" />

      <div className="flex items-center justify-between gap-3">
        <Link
          className="flex items-center gap-3 text-lg font-semibold text-[#4b0f29]"
          to="/admin"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#ff4f9a] to-[#ff79c1] text-sm font-bold text-white shadow-[0_12px_20px_rgba(255,79,154,0.3)]">
            RM
          </span>
          ReMarket
        </Link>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#a12d5d] shadow-[0_8px_16px_rgba(255,88,150,0.12)]"
          to="/"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="h-3.5 w-3.5"
          >
            <path
              d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H4.5A1.5 1.5 0 0 1 3 19.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          Home
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-3">
        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#ff6da6]/20 bg-[#ffe5f0] text-sm font-semibold text-[#a12d5d]">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-[#4b0f29]">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
            Admin
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
          Admin tools
        </span>
        <nav className="grid gap-2">
          <NavLink className={linkClass} to="/admin" end>
            Overview
          </NavLink>
          <NavLink className={linkClass} to="/admin/analytics">
            Analytics
          </NavLink>
          <NavLink className={linkClass} to="/admin/listings">
            Listings
          </NavLink>
          <NavLink className={linkClass} to="/admin/blogs">
            Blogs
          </NavLink>
          <NavLink className={linkClass} to="/admin/home-images">
            Home images
          </NavLink>
          <NavLink className={linkClass} to="/admin/commission">
            Commission
          </NavLink>
          <NavLink className={linkClass} to="/admin/complaints">
            Complaints
          </NavLink>
          <NavLink className={linkClass} to="/admin/orphans">
            Orphan listings
          </NavLink>
          <NavLink className={linkClass} to="/admin/users">
            Users
          </NavLink>
        </nav>
      </div>

      <button
        className="w-full rounded-full border border-[#ff6da6]/25 px-4 py-2 text-sm font-semibold text-[#a12d5d] transition hover:bg-[#fff1f7]"
        type="button"
        onClick={logout}
      >
        Sign out
      </button>
    </aside>
  );
};

export default AdminSidebar;
