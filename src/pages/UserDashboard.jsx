import React from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import UserSidebar from "../components/UserSidebar";

const orderSteps = [
  "Review delivery details and confirm availability.",
  "Contact the buyer to arrange pickup or shipping.",
  "Confirm payment and document the handoff.",
];

const handoffChecklist = [
  "Verify buyer contact details before meeting.",
  "Agree on time and location for pickup or delivery.",
  "Keep proof of handoff or shipment.",
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
    totalGross: 0,
  });
  const [transactionsLoading, setTransactionsLoading] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    avatarUrl: "",
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
            Authorization: `Bearer ${token}`,
          },
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
            Authorization: `Bearer ${token}`,
          },
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
            totalGross: 0,
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
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  const header = isListings
    ? {
        badge: "Listings",
        title: "Manage your product listings",
        subtitle: "Edit prices, update photos, and keep items fresh.",
      }
    : isOrders
    ? {
        badge: "Orders",
        title: "Track orders and delivery",
        subtitle: "Stay on top of payments and handoffs.",
      }
    : isProfile
    ? {
        badge: "Profile",
        title: "Update your profile",
        subtitle: "Keep your details accurate for buyers.",
      }
    : {
        badge: "Overview",
        title: "Track your listings and orders",
        subtitle:
          "Keep an eye on approvals, active sales, and delivery updates.",
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
      year: "numeric",
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
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
        toastId: "profile-image-upload",
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
        address: profileForm.address.trim(),
      };

      if (profileForm.avatarUrl) {
        payload.avatarUrl = profileForm.avatarUrl;
      }

      const response = await fetch(`${apiBase}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      updateUser(data.user);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        toastId: "profile-update-error",
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
            {isOverview ? (
              <>
                <div className="rounded-[24px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe5f0] to-[#fff9fd] p-6 shadow-[0_26px_52px_rgba(255,88,150,0.2)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                    {header.badge}
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    {header.title}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    {header.subtitle}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d] shadow-[0_10px_18px_rgba(255,88,150,0.18)]"
                      to="/"
                    >
                      Home
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/dashboard/new"
                    >
                      New listing
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
                      Listings pending
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                      --
                    </h2>
                    <span className="text-sm text-[#7a3658]">
                      Waiting for approval
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
                      Active listings
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                      --
                    </h2>
                    <span className="text-sm text-[#7a3658]">
                      Visible to buyers
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
                      Orders placed
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                      --
                    </h2>
                    <span className="text-sm text-[#7a3658]">
                      Across all listings
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Create a listing
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Add new products and submit them for admin approval.
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/dashboard/new"
                    >
                      New listing
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Your listings
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Manage pricing, photos, and status.
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                      to="/dashboard/listings"
                    >
                      View listings
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Orders and delivery
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Track delivery info and payment status.
                    </p>
                    <Link
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                      to="/dashboard/orders"
                    >
                      View orders
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
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
                  </div>
                </div>
                {isListings ? (
                  <div className="panel-grid">
                    <div className="panel-card">
                      <h3>Pending approvals</h3>
                      <p className="helper-text">
                        Listings waiting for admin review.
                      </p>
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
                  <div className="grid gap-6">
                    <form className="grid gap-6" onSubmit={handleProfileSave}>
                      <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-[#4b0f29]">
                              Profile image
                            </h2>
                            <p className="mt-1 text-sm text-[#6f3552]">
                              Upload a clear image to build trust with buyers.
                            </p>
                          </div>
                          <label
                            htmlFor="profile-image"
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                          >
                            {uploadingAvatar ? "Uploading..." : "Upload photo"}
                          </label>
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelection}
                            disabled={uploadingAvatar || profileSaving}
                            className="hidden"
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-4">
                          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-[#ff6da6]/25 bg-[#fff1f7] text-lg font-semibold text-[#a12d5d]">
                            {profileForm.avatarUrl ? (
                              <img src={profileForm.avatarUrl} alt="Profile" />
                            ) : (
                              <span>{user?.firstName?.[0] || "U"}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#4b0f29]">
                              {profileForm.avatarUrl
                                ? "Image uploaded"
                                : "No image yet"}
                            </p>
                            <p className="mt-1 text-xs text-[#7a3658]">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                        <h2 className="text-xl font-semibold text-[#4b0f29]">
                          Personal info
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <label
                              htmlFor="profile-firstName"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              First name
                            </label>
                            <input
                              id="profile-firstName"
                              name="firstName"
                              type="text"
                              value={profileForm.firstName}
                              onChange={handleProfileChange}
                              required
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="profile-lastName"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              Last name
                            </label>
                            <input
                              id="profile-lastName"
                              name="lastName"
                              type="text"
                              value={profileForm.lastName}
                              onChange={handleProfileChange}
                              required
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="profile-gender"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              Gender
                            </label>
                            <select
                              id="profile-gender"
                              name="gender"
                              value={profileForm.gender}
                              onChange={handleProfileChange}
                              required
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
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
                            <label
                              htmlFor="profile-address"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              Address
                            </label>
                            <textarea
                              id="profile-address"
                              name="address"
                              rows="2"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                              required
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                        <h2 className="text-xl font-semibold text-[#4b0f29]">
                          Contact info
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <label
                              htmlFor="profile-email"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              Email
                            </label>
                            <input
                              id="profile-email"
                              type="email"
                              value={user?.email || ""}
                              disabled
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/20 bg-[#fff1f7] px-3 py-2 text-sm text-[#7a3658]"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="profile-phone"
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                            >
                              Phone
                            </label>
                            <input
                              id="profile-phone"
                              type="tel"
                              value={user?.phone || ""}
                              disabled
                              className="mt-2 w-full rounded-xl border border-[#ff6da6]/20 bg-[#fff1f7] px-3 py-2 text-sm text-[#7a3658]"
                            />
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-[#7a3658]">
                          Email and phone are managed by support for security.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                          type="button"
                          disabled
                        >
                          Cancel
                        </button>
                        <button
                          className="rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                          type="submit"
                          disabled={profileSaving || uploadingAvatar}
                        >
                          {profileSaving ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    </form>
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
                          <span className="notif-count">
                            {orderUnreadCount}
                          </span>
                          <span className="helper-text">New orders</span>
                        </div>
                        <div className="notif-list">
                          {notificationsLoading ? (
                            <span className="helper-text">
                              Loading notifications...
                            </span>
                          ) : orderNotifications.length ? (
                            orderNotifications.map((item) => (
                              <div key={item.id} className="notif-item">
                                <div>
                                  <strong>{item.message}</strong>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="helper-text">
                              No new orders yet.
                            </span>
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
                            <h3 className="list-card-title">
                              Loading transactions...
                            </h3>
                            <p className="helper-text">
                              Pulling your latest orders.
                            </p>
                          </div>
                        ) : transactions.length ? (
                          transactions.map((item) => (
                            <div
                              key={item.id}
                              className="list-card list-card-strong"
                            >
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
                                  <span>
                                    BDT {formatPrice(item.commissionAmount)}
                                  </span>
                                </div>
                                <div>
                                  <span>Buyer total</span>
                                  <span>
                                    BDT {formatPrice(item.totalAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="list-card">
                            <h3 className="list-card-title">
                              No transactions yet
                            </h3>
                            <p className="helper-text">
                              Completed orders will show here.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
