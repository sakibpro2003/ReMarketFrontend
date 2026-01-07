import React from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import UserSidebar from "../components/UserSidebar";

const orderSteps = [
  "Review delivery details and confirm availability.",
  "Contact the buyer to arrange pickup or shipping.",
  "Confirm payment and document the handoff."
];

const handoffChecklist = [
  "Verify buyer contact details before meeting.",
  "Agree on time and location for pickup or delivery.",
  "Keep proof of handoff or shipment."
];

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const { pathname } = useLocation();
  const isListings = pathname.startsWith("/dashboard/listings");
  const isOrders = pathname.startsWith("/dashboard/orders");
  const isProfile = pathname.startsWith("/dashboard/profile");
  const isOverview = !isListings && !isOrders && !isProfile;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [orderNotifications, setOrderNotifications] = React.useState([]);
  const [orderUnreadCount, setOrderUnreadCount] = React.useState(0);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const [transactionSummary, setTransactionSummary] = React.useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    totalGross: 0
  });
  const [transactionsLoading, setTransactionsLoading] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    avatarUrl: ""
  });
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  React.useEffect(() => {
    if (!isOrders) {
      return;
    }

    const loadOrderNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/users/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setOrderNotifications(data.notifications || []);
        setOrderUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load order notifications", error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadOrderNotifications();
  }, [apiBase, isOrders]);

  React.useEffect(() => {
    if (!isOrders) {
      return;
    }

    const loadTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/users/transactions`, {
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

    loadTransactions();
  }, [apiBase, isOrders]);

  React.useEffect(() => {
    if (!user) {
      return;
    }
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      address: user.address || "",
      avatarUrl: user.avatarUrl || ""
    });
  }, [user]);

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
    : isProfile
    ? {
        badge: "Profile",
        title: "Update your profile",
        subtitle: "Keep your details accurate for buyers."
      }
    : {
        badge: "Overview",
        title: "Track your listings and orders",
        subtitle: "Keep an eye on approvals, active sales, and delivery updates."
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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadAvatar = async (file) => {
    const token = localStorage.getItem("remarket_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiBase}/api/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data;
  };

  const handleAvatarSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadAvatar(file);
      setProfileForm((prev) => ({ ...prev, avatarUrl: uploaded.url }));
      toast.success("Profile image uploaded.");
    } catch (error) {
      toast.error(error.message || "Failed to upload image", {
        toastId: "profile-image-upload"
      });
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    try {
      setProfileSaving(true);
      const token = localStorage.getItem("remarket_token");
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        gender: profileForm.gender,
        address: profileForm.address.trim()
      };

      if (profileForm.avatarUrl) {
        payload.avatarUrl = profileForm.avatarUrl;
      }

      const response = await fetch(`${apiBase}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      updateUser(data.user);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        toastId: "profile-update-error"
      });
    } finally {
      setProfileSaving(false);
    }
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
            ) : isProfile ? (
              <div className="list-grid">
                <div className="list-card list-card-strong">
                  <form className="form-grid" onSubmit={handleProfileSave}>
                    <div className="form-section">
                      <h2 className="section-title">Profile image</h2>
                      <p className="helper-text">
                        Upload a clear image to build trust with buyers.
                      </p>
                      <div className="upload-box">
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarSelection}
                          disabled={uploadingAvatar || profileSaving}
                        />
                        <label htmlFor="profile-image" className="upload-label">
                          {uploadingAvatar ? "Uploading..." : "Upload photo"}
                        </label>
                        <span className="helper-text">
                          {profileForm.avatarUrl ? "1 uploaded" : "No image yet"}
                        </span>
                      </div>
                      {profileForm.avatarUrl ? (
                        <div className="image-preview-grid">
                          <div className="image-preview">
                            <img src={profileForm.avatarUrl} alt="Profile" />
                          </div>
                        </div>
                      ) : (
                        <p className="helper-text">No image uploaded yet.</p>
                      )}
                    </div>

                    <div className="form-section">
                      <h2 className="section-title">Personal info</h2>
                      <div className="form-row">
                        <div>
                          <label htmlFor="profile-firstName">First name</label>
                          <input
                            id="profile-firstName"
                            name="firstName"
                            type="text"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="profile-lastName">Last name</label>
                          <input
                            id="profile-lastName"
                            name="lastName"
                            type="text"
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div>
                          <label htmlFor="profile-gender">Gender</label>
                          <select
                            id="profile-gender"
                            name="gender"
                            value={profileForm.gender}
                            onChange={handleProfileChange}
                            required
                          >
                            <option value="" disabled>
                              Select one
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="profile-address">Address</label>
                          <textarea
                            id="profile-address"
                            name="address"
                            rows="2"
                            value={profileForm.address}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h2 className="section-title">Contact info</h2>
                      <div className="form-row">
                        <div>
                          <label htmlFor="profile-email">Email</label>
                          <input
                            id="profile-email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                          />
                        </div>
                        <div>
                          <label htmlFor="profile-phone">Phone</label>
                          <input
                            id="profile-phone"
                            type="tel"
                            value={user?.phone || ""}
                            disabled
                          />
                        </div>
                      </div>
                      <p className="helper-text">
                        Email and phone are managed by support for security.
                      </p>
                    </div>

                    <div className="form-actions">
                      <button
                        className="primary-btn"
                        type="submit"
                        disabled={profileSaving || uploadingAvatar}
                      >
                        {profileSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <p className="stat-label">Total sales</p>
                    <h2 className="stat-value">
                      BDT {formatPrice(transactionSummary.totalSales)}
                    </h2>
                    <span className="helper-text">
                      {transactionSummary.totalOrders} orders
                    </span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Commission paid</p>
                    <h2 className="stat-value">
                      BDT {formatPrice(transactionSummary.totalCommission)}
                    </h2>
                    <span className="helper-text">Platform fee</span>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Buyer total</p>
                    <h2 className="stat-value">
                      BDT {formatPrice(transactionSummary.totalGross)}
                    </h2>
                    <span className="helper-text">Gross volume</span>
                  </div>
                </div>

                <div className="panel-grid">
                  <div className="panel-card">
                    <h3>Order notifications</h3>
                    <p className="helper-text">
                      New purchases across your listings.
                    </p>
                    <div className="notif-card">
                      <span className="notif-count">{orderUnreadCount}</span>
                      <span className="helper-text">New orders</span>
                    </div>
                    <div className="notif-list">
                      {notificationsLoading ? (
                        <span className="helper-text">Loading notifications...</span>
                      ) : orderNotifications.length ? (
                        orderNotifications.map((item) => (
                          <div key={item.id} className="notif-item">
                            <div>
                              <strong>{item.message}</strong>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="helper-text">No new orders yet.</span>
                      )}
                    </div>
                  </div>
                  <div className="panel-card">
                    <h3>Next steps</h3>
                    <p className="helper-text">
                      Follow up quickly to keep buyers engaged.
                    </p>
                    <div className="helper-text">
                      {orderSteps.map((step, index) => (
                        <div key={step}>{`${index + 1}. ${step}`}</div>
                      ))}
                    </div>
                  </div>
                  <div className="panel-card">
                    <h3>Handoff checklist</h3>
                    <p className="helper-text">
                      Keep every handoff smooth and secure.
                    </p>
                    <div className="helper-text">
                      {handoffChecklist.map((item, index) => (
                        <div key={item}>{`${index + 1}. ${item}`}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="stack">
                  <h3 className="section-title">Recent transactions</h3>
                  <div className="list-grid">
                    {transactionsLoading ? (
                      <div className="list-card">
                        <h3 className="list-card-title">Loading transactions...</h3>
                        <p className="helper-text">
                          Pulling your latest orders.
                        </p>
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
                                <h3 className="list-card-title">
                                  {item.productTitle}
                                </h3>
                                <span className="helper-text">
                                  Buyer: {item.buyerName}
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
                              <span>Platform fee</span>
                              <span>BDT {formatPrice(item.commissionAmount)}</span>
                            </div>
                            <div>
                              <span>Buyer total</span>
                              <span>BDT {formatPrice(item.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="list-card">
                        <h3 className="list-card-title">No transactions yet</h3>
                        <p className="helper-text">
                          Completed orders will show here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
