import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  [
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] text-white shadow-[0_12px_22px_rgba(255,79,154,0.35)]"
      : "text-[#7a3658] hover:bg-white/80",
  ].join(" ");

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const [queueCounts, setQueueCounts] = useState({
    pendingListings: 0,
    pendingBlogs: 0,
    openComplaints: 0
  });
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "A";

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/queue-counts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load queue counts");
        }
        setQueueCounts({
          pendingListings: data.pendingListings || 0,
          pendingBlogs: data.pendingBlogs || 0,
          openComplaints: data.openComplaints || 0
        });
      } catch (error) {
        console.error("Failed to load admin queue counts", error);
      }
    };

    loadCounts();
  }, [apiBase]);

  const renderCount = (value) =>
    value > 0 ? (
      <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-[#ff4f9a] px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_8px_14px_rgba(255,79,154,0.3)]">
        {value > 99 ? "99+" : value}
      </span>
    ) : null;

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
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-3">
        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#ff6da6]/20 bg-[#ffe5f0] text-sm font-semibold text-[#a12d5d]">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
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
            <span>Manage products</span>
            {renderCount(queueCounts.pendingListings)}
          </NavLink>
          <NavLink className={linkClass} to="/admin/blogs">
            <span>Blogs</span>
            {renderCount(queueCounts.pendingBlogs)}
          </NavLink>
          <NavLink className={linkClass} to="/admin/home-images">
            Home images
          </NavLink>
          <NavLink className={linkClass} to="/admin/commission">
            Commission
          </NavLink>
          <NavLink className={linkClass} to="/admin/complaints">
            <span>Complaints</span>
            {renderCount(queueCounts.openComplaints)}
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
