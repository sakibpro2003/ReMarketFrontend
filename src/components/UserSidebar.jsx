import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link";

const UserSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <Link className="sidebar-brand" to="/">
        <span className="brand-mark">RM</span>
        ReMarket
      </Link>

      <div className="sidebar-user">
        <span className="sidebar-user-name">
          {user ? `${user.firstName} ${user.lastName}` : ""}
        </span>
        <span className="sidebar-user-role">User</span>
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
      </nav>

      <button className="ghost-btn" type="button" onClick={logout}>
        Sign out
      </button>
    </aside>
  );
};

export default UserSidebar;
