import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  const navItems = [
    { label: "Home", to: "/", end: true },
    { label: "Products", to: "/products" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Dashboard", to: "/dashboard" }
  ];

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="brand">
          <span className="brand-mark">RM</span>
          <span className="brand-name">ReMarket</span>
        </div>
      </div>
      <div className="nav-center">
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              to={item.to}
              end={item.end}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-user">
          <div className="avatar avatar-xs">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="nav-user-meta">
            <span className="nav-user-name">
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </span>
            <span className="nav-user-email">{user?.email}</span>
          </div>
        </div>
        <button className="secondary-btn" type="button" onClick={logout}>
          Sign out
        </button>
        <button
          className="nav-toggle"
          type="button"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="nav-drawer"
          aria-label="Toggle navigation"
        >
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
        </button>
      </div>
      {menuOpen ? (
        <button
          className="nav-scrim"
          type="button"
          onClick={closeMenu}
          aria-label="Close navigation"
        />
      ) : null}
      <div
        id="nav-drawer"
        className={`nav-drawer ${menuOpen ? "nav-drawer-open" : ""}`}
      >
        <div className="nav-drawer-user">
          <div className="avatar avatar-sm">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <div className="nav-user-name">
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </div>
            <div className="nav-user-email">{user?.email}</div>
          </div>
        </div>
        <div className="nav-drawer-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              to={item.to}
              end={item.end}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <button className="secondary-btn nav-drawer-btn" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
