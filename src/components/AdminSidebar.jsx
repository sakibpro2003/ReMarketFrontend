import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link";

const AdminSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <Link className="sidebar-brand" to="/admin">
        <span className="brand-mark">RM</span>
        ReMarket
      </Link>

      <div className="sidebar-user">
        <span className="sidebar-user-name">
          {user ? `${user.firstName} ${user.lastName}` : ""}
        </span>
        <span className="sidebar-user-role">Admin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink className={linkClass} to="/admin" end>
          Overview
        </NavLink>
        <NavLink className={linkClass} to="/admin/listings">
          Listings
        </NavLink>
        <NavLink className={linkClass} to="/admin/commission">
          Commission
        </NavLink>
        <NavLink className={linkClass} to="/admin/users">
          Users
        </NavLink>
      </nav>

      <button className="ghost-btn" type="button" onClick={logout}>
        Sign out
      </button>
    </aside>
  );
};

export default AdminSidebar;
