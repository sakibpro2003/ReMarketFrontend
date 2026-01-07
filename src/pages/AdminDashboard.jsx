import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    totalGross: 0
  });
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    const loadTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setTransactionSummary(
          data.summary || {
            totalOrders: 0,
            totalSales: 0,
            totalCommission: 0,
            totalGross: 0
          }
        );
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    loadNotifications();
    loadTransactions();
  }, [apiBase]);

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

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const transactionsSection = (
    <div className="stack">
      <h3 className="section-title">Transactions</h3>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Platform revenue</p>
          <h2 className="stat-value">
            BDT {formatPrice(transactionSummary.totalCommission)}
          </h2>
          <span className="helper-text">
            {transactionSummary.totalOrders} orders
          </span>
        </div>
        <div className="stat-card">
          <p className="stat-label">Seller payouts</p>
          <h2 className="stat-value">
            BDT {formatPrice(transactionSummary.totalSales)}
          </h2>
          <span className="helper-text">Net item totals</span>
        </div>
        <div className="stat-card">
          <p className="stat-label">Gross volume</p>
          <h2 className="stat-value">
            BDT {formatPrice(transactionSummary.totalGross)}
          </h2>
          <span className="helper-text">Buyer payments</span>
        </div>
      </div>
      <div className="list-grid">
        {transactionsLoading ? (
          <div className="list-card">
            <h3 className="list-card-title">Loading transactions...</h3>
            <p className="helper-text">Fetching payouts and commissions.</p>
          </div>
        ) : transactions.length ? (
          transactions.map((item) => (
            <div key={item.id} className="list-card list-card-strong">
              <div className="list-card-header">
                <div className="list-card-title-row">
                  <div className="list-card-thumb list-card-thumb-placeholder">
                    <span>{item.productTitle?.[0] || "O"}</span>
                  </div>
                  <div className="list-card-title-stack">
                    <h3 className="list-card-title">{item.productTitle}</h3>
                    <span className="helper-text">
                      Seller: {item.sellerName}
                    </span>
                  </div>
                </div>
                <div className="list-card-status-stack">
                  <span className="list-card-role">Order</span>
                  <span className="helper-text">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
              <div className="list-card-meta">
                <div>
                  <span>Seller payout</span>
                  <span>BDT {formatPrice(item.price)}</span>
                </div>
                <div>
                  <span>Platform commission</span>
                  <span>BDT {formatPrice(item.commissionAmount)}</span>
                </div>
                <div>
                  <span>Buyer total</span>
                  <span>BDT {formatPrice(item.totalAmount)}</span>
                </div>
                <div>
                  <span>Buyer</span>
                  <span>{item.buyerName}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="list-card">
            <h3 className="list-card-title">No transactions yet</h3>
            <p className="helper-text">Orders will appear here once placed.</p>
          </div>
        )}
      </div>
    </div>
  );

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
              {isOverview ? (
                <div className="notif-card">
                  <span className="notif-count">{unreadCount}</span>
                  <span className="helper-text">New submissions</span>
                </div>
              ) : null}
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
                    <h3>Notifications</h3>
                    <p className="helper-text">
                      Recent listing submissions from sellers.
                    </p>
                    <div className="notif-list">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <div key={item.id} className="notif-item">
                            <div>
                              <strong>{item.message}</strong>
                              <span className="helper-text">{item.sellerName}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="helper-text">No new submissions yet.</span>
                      )}
                    </div>
                  </div>
                </div>
                {transactionsSection}
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
              <>
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
                {transactionsSection}
              </>
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
