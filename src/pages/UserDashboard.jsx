import React from "react";
import { Link, useLocation } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";

const UserDashboard = () => {
  const { pathname } = useLocation();
  const isListings = pathname.startsWith("/dashboard/listings");
  const isOrders = pathname.startsWith("/dashboard/orders");
  const isOverview = !isListings && !isOrders;

  const header = isListings
    ? {
        badge: "Listings",
        title: "Manage your product listings",
        subtitle: "Edit prices, update photos, and keep items fresh."
      }
    : isOrders
    ? {
        badge: "Orders",
        title: "Track orders and delivery",
        subtitle: "Stay on top of payments and handoffs."
      }
    : {
        badge: "Overview",
        title: "Track your listings and orders",
        subtitle: "Keep an eye on approvals, active sales, and delivery updates."
      };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">{header.badge}</span>
                <h1>{header.title}</h1>
                <p className="helper-text">{header.subtitle}</p>
              </div>
              <div className="content-actions">
                <Link className="secondary-btn button-link" to="/">
                  Home
                </Link>
                {isOverview ? (
                  <Link className="primary-btn button-link" to="/dashboard/new">
                    New listing
                  </Link>
                ) : null}
              </div>
            </div>

            {isOverview ? (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <p className="stat-label">Listings pending</p>
                    <h2 className="stat-value">--</h2>
                    <span className="helper-text">Waiting for approval</span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Active listings</p>
                    <h2 className="stat-value">--</h2>
                    <span className="helper-text">Visible to buyers</span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Orders placed</p>
                    <h2 className="stat-value">--</h2>
                    <span className="helper-text">Across all listings</span>
                  </div>
                </div>

                <div className="panel-grid">
                  <div className="panel-card">
                    <h3>Create a listing</h3>
                    <p className="helper-text">
                      Add new products and submit them for admin approval.
                    </p>
                    <Link className="primary-btn button-link" to="/dashboard/new">
                      New listing
                    </Link>
                  </div>
                  <div className="panel-card">
                    <h3>Your listings</h3>
                    <p className="helper-text">Manage pricing, photos, and status.</p>
                    <Link className="secondary-btn button-link" to="/dashboard/listings">
                      View listings
                    </Link>
                  </div>
                  <div className="panel-card">
                    <h3>Orders & delivery</h3>
                    <p className="helper-text">
                      Track delivery info and payment status.
                    </p>
                    <Link className="secondary-btn button-link" to="/dashboard/orders">
                      View orders
                    </Link>
                  </div>
                </div>
              </>
            ) : isListings ? (
              <div className="panel-grid">
                <div className="panel-card">
                  <h3>Pending approvals</h3>
                  <p className="helper-text">Listings waiting for admin review.</p>
                  <button className="secondary-btn" type="button">
                    View pending
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Active listings</h3>
                  <p className="helper-text">Items visible to buyers.</p>
                  <button className="secondary-btn" type="button">
                    View active
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Sold items</h3>
                  <p className="helper-text">Track completed sales.</p>
                  <button className="secondary-btn" type="button">
                    View sold
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-grid">
                <div className="panel-card">
                  <h3>Orders awaiting delivery</h3>
                  <p className="helper-text">Handoffs and courier updates.</p>
                  <button className="secondary-btn" type="button">
                    View orders
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Completed orders</h3>
                  <p className="helper-text">Successful payments and delivery.</p>
                  <button className="secondary-btn" type="button">
                    View history
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Delivery details</h3>
                  <p className="helper-text">Addresses and contact info.</p>
                  <button className="secondary-btn" type="button">
                    View details
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
