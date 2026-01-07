import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link";

const UserSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <Link className="sidebar-home" to="/">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
      <Link className="sidebar-brand" to="/">
        <span className="brand-mark">RM</span>
        ReMarket
      </Link>

      <div className="sidebar-user">
        <div className="avatar avatar-sm">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <span>
              {`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
                "U"}
            </span>
          )}
        </div>
        <div className="sidebar-user-meta">
          <span className="sidebar-user-name">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </span>
          <span className="sidebar-user-role">User</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink className={linkClass} to="/dashboard" end>
          Overview
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/new">
          New listing
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/listings">
          Listings
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/orders">
          Orders
        </NavLink>
        <NavLink className={linkClass} to="/dashboard/profile">
          Profile
        </NavLink>
      </nav>

      <button className="ghost-btn" type="button" onClick={logout}>
        Sign out
      </button>
    </aside>
  );
};

export default UserSidebar;
