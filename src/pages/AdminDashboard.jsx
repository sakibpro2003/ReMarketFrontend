import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const isListings = pathname.startsWith("/admin/listings");
  const isCommission = pathname.startsWith("/admin/commission");
  const isUsers = pathname.startsWith("/admin/users");
  const isOverview = !isListings && !isCommission && !isUsers;

  const header = isListings
    ? {
        badge: "Listings",
        title: "Review and approve listings",
        subtitle: "Keep the marketplace clean and trustworthy."
      }
    : isCommission
    ? {
        badge: "Commission",
        title: "Update platform commission",
        subtitle: "Adjust fees that apply to new orders."
      }
    : isUsers
    ? {
        badge: "Users",
        title: "Manage user access",
        subtitle: "Promote trusted sellers and handle reports."
      }
    : {
        badge: "Overview",
        title: "Admin operations overview",
        subtitle: "Monitor listings, users, and platform revenue."
      };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">{header.badge}</span>
                <h1>{header.title}</h1>
                <p className="helper-text">{header.subtitle}</p>
              </div>
            </div>

            {isOverview ? (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <p className="stat-label">Pending listings</p>
                    <h2 className="stat-value">--</h2>
                    <span className="helper-text">Awaiting approval</span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Active users</p>
                    <h2 className="stat-value">--</h2>
                    <span className="helper-text">Last 30 days</span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Commission rate</p>
                    <h2 className="stat-value">--%</h2>
                    <span className="helper-text">Update from settings</span>
                  </div>
                </div>

                <div className="panel-grid">
                  <div className="panel-card">
                    <h3>Listings to review</h3>
                    <p className="helper-text">
                      Approve or reject listings submitted by users.
                    </p>
                    <button className="primary-btn" type="button">
                      Review listings
                    </button>
                  </div>
                  <div className="panel-card">
                    <h3>Commission settings</h3>
                    <p className="helper-text">
                      Set platform commission for new orders.
                    </p>
                    <button className="secondary-btn" type="button">
                      Update commission
                    </button>
                  </div>
                  <div className="panel-card">
                    <h3>User management</h3>
                    <p className="helper-text">Promote users to admin or suspend accounts.</p>
                    <button className="secondary-btn" type="button">
                      Manage users
                    </button>
                  </div>
                </div>
              </>
            ) : isListings ? (
              <div className="panel-grid">
                <div className="panel-card">
                  <h3>Pending approvals</h3>
                  <p className="helper-text">New submissions waiting review.</p>
                  <button className="secondary-btn" type="button">
                    View pending
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Recently approved</h3>
                  <p className="helper-text">Audit quality and compliance.</p>
                  <button className="secondary-btn" type="button">
                    View approved
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Rejected listings</h3>
                  <p className="helper-text">Reasons and seller follow-up.</p>
                  <button className="secondary-btn" type="button">
                    View rejected
                  </button>
                </div>
              </div>
            ) : isCommission ? (
              <div className="panel-grid">
                <div className="panel-card">
                  <h3>Current commission</h3>
                  <p className="helper-text">Applies to new orders only.</p>
                  <button className="primary-btn" type="button">
                    Change rate
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Fee history</h3>
                  <p className="helper-text">Track changes over time.</p>
                  <button className="secondary-btn" type="button">
                    View history
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-grid">
                <div className="panel-card">
                  <h3>Promote user</h3>
                  <p className="helper-text">Give admin access to trusted staff.</p>
                  <button className="primary-btn" type="button">
                    Promote
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Suspended users</h3>
                  <p className="helper-text">Handle reports and abuse.</p>
                  <button className="secondary-btn" type="button">
                    Review
                  </button>
                </div>
                <div className="panel-card">
                  <h3>Verification queue</h3>
                  <p className="helper-text">Review seller verification requests.</p>
                  <button className="secondary-btn" type="button">
                    Open queue
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

export default AdminDashboard;
