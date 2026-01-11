import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  [
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] text-white shadow-[0_12px_22px_rgba(255,79,154,0.35)]"
      : "text-[#7a3658] hover:bg-white/80"
  ].join(" ");

const UserSidebar = () => {
  const { user, logout } = useAuth();
  const [orderUnreadCount, setOrderUnreadCount] = useState(0);
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    const token = localStorage.getItem("remarket_token");
    if (!token) {
      return;
    }

    const loadOrderNotifications = async () => {
      try {
        const response = await fetch(`${apiBase}/api/users/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setOrderUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load order notifications", error);
      }
    };

    loadOrderNotifications();
  }, [apiBase, user]);

  const renderCount = (value) =>
    value > 0 ? (
      <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#ff4f9a] px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_8px_14px_rgba(255,79,154,0.3)]">
        {value > 99 ? "99+" : value}
      </span>
    ) : null;

  const markOrdersRead = async () => {
    const token = localStorage.getItem("remarket_token");
    if (!token) {
      setOrderUnreadCount(0);
      return;
    }
    setOrderUnreadCount(0);
    try {
      await fetch(`${apiBase}/api/users/notifications/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Failed to mark order notifications read", error);
    }
  };

  return (
    <aside className="sticky top-5 grid w-full max-w-[260px] gap-5 rounded-[22px] border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_22px_40px_rgba(255,88,150,0.18)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Link
          className="flex items-center gap-3 text-lg font-semibold text-[#4b0f29]"
          to="/"
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
            <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <span>
              {`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
                "U"}
            </span>
          )}
        </div>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-[#4b0f29]">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
            User
          </span>
        </div>
      </div>

      <nav className="grid gap-2">
        <NavLink className={linkClass} to="/" end>
          Home
        </NavLink>
        <NavLink className={linkClass} to="/dashboard" end>
          Overview
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/new">
          New listing
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/listings">
          Listings
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/blogs">
          Blogs
        </NavLink>
        <NavLink
          className={linkClass}
          to="/dashboard/orders"
          onClick={markOrdersRead}
        >
          <span>Orders</span>
          {renderCount(orderUnreadCount)}
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/sales">
          Sales
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/complaints">
          Complaints
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/profile">
          Profile
        </NavLink>
      </nav>

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

export default UserSidebar;
