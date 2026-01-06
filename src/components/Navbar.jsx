import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="brand">
          <span className="brand-mark">RM</span>
          ReMarket
        </div>
        <div className="nav-links">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
            to="/"
            end
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
            to="/products"
          >
            Products
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
            to="/dashboard"
          >
            Dashboard
          </NavLink>
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-user">
          <span className="nav-user-name">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </span>
          <span className="nav-user-email">{user?.email}</span>
        </div>
        <button className="secondary-btn" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
