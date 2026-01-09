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
  const isComplaints = pathname.startsWith("/dashboard/complaints");
  const isOverview =
    !isListings && !isOrders && !isProfile && !isComplaints;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const shouldLoadTransactions = isOrders || isOverview;
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
  const [listingSummary, setListingSummary] = React.useState({
    total: 0,
    pending: 0,
    approved: 0
  });
  const [listingSummaryLoading, setListingSummaryLoading] =
    React.useState(true);
  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    avatarUrl: "",
  });
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [complaints, setComplaints] = React.useState([]);
  const [complaintsLoading, setComplaintsLoading] = React.useState(false);
  const [complaintForm, setComplaintForm] = React.useState({
    subject: "",
    message: "",
    productId: "",
    imageUrl: ""
  });
  const [complaintSaving, setComplaintSaving] = React.useState(false);
  const [uploadingComplaintImage, setUploadingComplaintImage] =
    React.useState(false);

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
    if (!shouldLoadTransactions) {
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
  }, [apiBase, shouldLoadTransactions]);

  React.useEffect(() => {
    if (!isOverview) {
      return;
    }

    const loadListingSummary = async () => {
      try {
        setListingSummaryLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/products/mine`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load listings");
        }

        const summary = (data.products || []).reduce(
          (acc, product) => {
            acc.total += 1;
            if (product.status === "pending") {
              acc.pending += 1;
            }
            if (product.status === "approved") {
              acc.approved += 1;
            }
            return acc;
          },
          { total: 0, pending: 0, approved: 0 }
        );

        setListingSummary(summary);
      } catch (error) {
        console.error("Failed to load listing summary", error);
      } finally {
        setListingSummaryLoading(false);
      }
    };

    loadListingSummary();
  }, [apiBase, isOverview]);

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

  React.useEffect(() => {
    if (!isComplaints) {
      return;
    }

    const loadComplaints = async () => {
      try {
        setComplaintsLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/complaints/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load complaints");
        }

        setComplaints(data.complaints || []);
      } catch (error) {
        toast.error(error.message || "Failed to load complaints", {
          toastId: "complaints-load",
        });
      } finally {
        setComplaintsLoading(false);
      }
    };

    loadComplaints();
  }, [apiBase, isComplaints]);

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
    : isComplaints
    ? {
        badge: "Complaints",
        title: "Report an issue",
        subtitle: "Share details and screenshots for faster support.",
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

  const uploadImage = async (file) => {
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

  const uploadAvatar = async (file) => uploadImage(file);

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

  const normalizeProductId = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const match = trimmed.match(/[a-f0-9]{24}/i);
    return match ? match[0] : trimmed;
  };

  const handleComplaintChange = (event) => {
    const { name, value } = event.target;
    setComplaintForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleComplaintImageSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingComplaintImage(true);
    try {
      const uploaded = await uploadImage(file);
      setComplaintForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
      toast.success("Evidence image uploaded.");
    } catch (error) {
      toast.error(error.message || "Failed to upload image", {
        toastId: "complaint-image-upload",
      });
    } finally {
      setUploadingComplaintImage(false);
      event.target.value = "";
    }
  };

  const clearComplaintImage = () => {
    setComplaintForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleComplaintSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    const subject = complaintForm.subject.trim();
    const message = complaintForm.message.trim();
    const productId = normalizeProductId(complaintForm.productId);

    if (!subject) {
      toast.error("Subject is required.", { toastId: "complaint-subject" });
      return;
    }
    if (!message) {
      toast.error("Message is required.", { toastId: "complaint-message" });
      return;
    }
    if (productId && !/^[a-f0-9]{24}$/i.test(productId)) {
      toast.error("Product id is invalid.", { toastId: "complaint-product" });
      return;
    }

    try {
      setComplaintSaving(true);
      const token = localStorage.getItem("remarket_token");
      const payload = {
        subject,
        message,
      };
      if (productId) {
        payload.productId = productId;
      }
      if (complaintForm.imageUrl) {
        payload.imageUrl = complaintForm.imageUrl;
      }

      const response = await fetch(`${apiBase}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit complaint");
      }

      setComplaintForm({
        subject: "",
        message: "",
        productId: "",
        imageUrl: "",
      });
      setComplaints((prev) => [data.complaint, ...prev]);
      toast.success("Complaint submitted.", { toastId: "complaint-sent" });
    } catch (error) {
      toast.error(error.message || "Failed to submit complaint", {
        toastId: "complaint-error",
      });
    } finally {
      setComplaintSaving(false);
    }
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main
            className={`content-area ${
              isListings || isOrders || isProfile || isComplaints
                ? "bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]"
                : ""
            }`}
          >
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
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/dashboard/new"
                    >
                      New listing
                    </Link>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 text-sm text-[#6f3552] shadow-[0_16px_32px_rgba(255,88,150,0.12)]">
                  {listingSummaryLoading || transactionsLoading ? (
                    <p>Building your summary snapshot...</p>
                  ) : (
                    <p>
                      You have{" "}
                      <span className="font-semibold text-[#4b0f29]">
                        {listingSummary.total}
                      </span>{" "}
                      listings total, with{" "}
                      <span className="font-semibold text-[#4b0f29]">
                        {listingSummary.pending}
                      </span>{" "}
                      pending and{" "}
                      <span className="font-semibold text-[#4b0f29]">
                        {listingSummary.approved}
                      </span>{" "}
                      active. Orders placed:{" "}
                      <span className="font-semibold text-[#4b0f29]">
                        {transactionSummary.totalOrders}
                      </span>
                      . Gross sales:{" "}
                      <span className="font-semibold text-[#4b0f29]">
                        BDT {formatPrice(transactionSummary.totalGross)}
                      </span>
                      .
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
                      Listings pending
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                      {listingSummaryLoading ? "--" : listingSummary.pending}
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
                      {listingSummaryLoading ? "--" : listingSummary.approved}
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
                      {transactionsLoading ? "--" : transactionSummary.totalOrders}
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
                {!isListings && !isOrders && !isProfile && !isComplaints && (
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
                )}
                {isListings ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                            Listings
                          </span>
                          <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                            Manage your catalog
                          </h2>
                          <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                            Track approvals, tune pricing, and highlight your
                            best items.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                              to="/dashboard/new"
                            >
                              Create listing
                            </Link>
                            <a
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              href="#listing-ops"
                            >
                              Jump to workflow
                            </a>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Pending: --
                            </span>
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Active: --
                            </span>
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Sold: --
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Focus today
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>
                                Refresh titles, photos, and price points.
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                              <span>
                                Confirm pickup details and availability.
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>
                                Reply to buyer questions within the hour.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      id="listing-ops"
                      className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]"
                    >
                      <div className="grid gap-6">
                        <section
                          className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.05s" }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Step 1
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                Status overview
                              </h3>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Live view
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Pending
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                --
                              </p>
                              <span className="text-xs text-[#7a3658]">
                                Awaiting review
                              </span>
                            </div>
                            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Active
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                --
                              </p>
                              <span className="text-xs text-[#7a3658]">
                                Live in the market
                              </span>
                            </div>
                            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Sold
                              </p>
                              <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                --
                              </p>
                              <span className="text-xs text-[#7a3658]">
                                Completed sales
                              </span>
                            </div>
                          </div>
                        </section>

                        <section
                          className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.1s" }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Step 2
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                Listing quality
                              </h3>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Improve visibility
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                              <p className="font-semibold text-[#4b0f29]">
                                Photos & clarity
                              </p>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                Use bright lighting and show all angles.
                              </p>
                            </div>
                            <div className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                              <p className="font-semibold text-[#4b0f29]">
                                Price check
                              </p>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                Compare recent sales before you publish.
                              </p>
                            </div>
                            <div className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                              <p className="font-semibold text-[#4b0f29]">
                                Description
                              </p>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                Highlight condition, usage, and accessories.
                              </p>
                            </div>
                            <div className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                              <p className="font-semibold text-[#4b0f29]">
                                Availability
                              </p>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                Keep pickup hours and location updated.
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                              to="/dashboard/new"
                            >
                              Add listing
                            </Link>
                            <button
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                              type="button"
                            >
                              Refresh details
                            </button>
                          </div>
                        </section>

                        <section
                          className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.15s" }}
                        >
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                              Step 3
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                              Buyer readiness
                            </h3>
                            <p className="mt-2 text-sm text-[#6f3552]">
                              Stay responsive to keep sales moving.
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 text-sm text-[#6f3552]">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] text-xs font-semibold text-[#a12d5d]">
                                1
                              </span>
                              <div>
                                <p className="font-semibold text-[#4b0f29]">
                                  Confirm inventory
                                </p>
                                <p className="mt-1 text-xs text-[#7a3658]">
                                  Keep quantities accurate across listings.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] text-xs font-semibold text-[#a12d5d]">
                                2
                              </span>
                              <div>
                                <p className="font-semibold text-[#4b0f29]">
                                  Respond quickly
                                </p>
                                <p className="mt-1 text-xs text-[#7a3658]">
                                  Fast replies improve trust and ranking.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] text-xs font-semibold text-[#a12d5d]">
                                3
                              </span>
                              <div>
                                <p className="font-semibold text-[#4b0f29]">
                                  Schedule pickup
                                </p>
                                <p className="mt-1 text-xs text-[#7a3658]">
                                  Lock in a time once a buyer confirms.
                                </p>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                        <div
                          className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.12s" }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Listing summary
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                            Current portfolio
                          </h3>
                          <div className="mt-3 grid gap-3 text-sm text-[#6f3552]">
                            <div className="flex items-center justify-between gap-3">
                              <span>Pending approvals</span>
                              <span className="font-semibold text-[#4b0f29]">
                                --
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Active listings</span>
                              <span className="font-semibold text-[#4b0f29]">
                                --
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Sold items</span>
                              <span className="font-semibold text-[#4b0f29]">
                                --
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Drafts saved</span>
                              <span className="font-semibold text-[#4b0f29]">
                                --
                              </span>
                            </div>
                          </div>
                          <p className="mt-4 text-xs text-[#7a3658]">
                            Keep drafts ready so you can launch quickly.
                          </p>
                        </div>

                        <div
                          className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.16s" }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Listing workflow
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                              <span>
                                Submit for approval and wait for review.
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>Go live and manage buyer questions.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                              <span>Finalize pickup and confirm payment.</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)] animate-[card-rise_0.5s_ease_both]"
                          style={{ animationDelay: "0.2s" }}
                        >
                          <h3 className="text-lg font-semibold text-[#4b0f29]">
                            Quick actions
                          </h3>
                          <p className="mt-2 text-sm text-[#6f3552]">
                            Keep your storefront active and discoverable.
                          </p>
                          <div className="mt-4 grid gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                              to="/dashboard/new"
                            >
                              Start a new listing
                            </Link>
                            <Link
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              to="/dashboard/orders"
                            >
                              View orders
                            </Link>
                            <Link
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              to="/dashboard/profile"
                            >
                              Update profile
                            </Link>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                ) : isProfile ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                            Profile
                          </span>
                          <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                            Update your profile
                          </h2>
                          <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                            Keep your details accurate so buyers can trust you.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                              to="/dashboard"
                            >
                              Back to dashboard
                            </Link>
                            <Link
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              to="/dashboard/listings"
                            >
                              My listings
                            </Link>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Email: {user?.email || "--"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                              Phone: {user?.phone || "--"}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Profile checklist
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>Add a clear profile photo.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                              <span>Confirm your pickup address.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>Keep contact info up to date.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
                      <form className="grid gap-6" onSubmit={handleProfileSave}>
                        <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Step 1
                              </p>
                              <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
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
                              {uploadingAvatar
                                ? "Uploading..."
                                : "Upload photo"}
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
                                <img
                                  src={profileForm.avatarUrl}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                />
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
                        </section>

                        <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Step 2
                          </p>
                          <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
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
                        </section>

                        <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Step 3
                          </p>
                          <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
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
                        </section>

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

                      <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                        <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Profile summary
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                            Current details
                          </h3>
                          <div className="mt-3 grid gap-3 text-sm text-[#6f3552]">
                            <div className="flex items-center justify-between gap-3">
                              <span>Name</span>
                              <span className="font-semibold text-[#4b0f29]">
                                {profileForm.firstName || "--"}{" "}
                                {profileForm.lastName || ""}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Gender</span>
                              <span className="font-semibold text-[#4b0f29] capitalize">
                                {profileForm.gender || "--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Address</span>
                              <span className="font-semibold text-[#4b0f29]">
                                {profileForm.address || "--"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Trust signals
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                              <span>Clear photos improve response rates.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                              <span>Accurate pickup info prevents delays.</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                          <h3 className="text-lg font-semibold text-[#4b0f29]">
                            Quick actions
                          </h3>
                          <p className="mt-2 text-sm text-[#6f3552]">
                            Keep your storefront active and trusted.
                          </p>
                          <div className="mt-4 grid gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                              to="/dashboard/new"
                            >
                              Start a new listing
                            </Link>
                            <Link
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              to="/dashboard/orders"
                            >
                              View orders
                            </Link>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                ) : isComplaints ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                            Complaints
                          </span>
                          <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                            Report an issue
                          </h2>
                          <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                            Share details and screenshots so the team can help
                            quickly.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                              to="/dashboard/orders"
                            >
                              View orders
                            </Link>
                            <Link
                              className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                              to="/"
                            >
                              Home
                            </Link>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Status snapshot
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                            <div className="flex items-center justify-between gap-4">
                              <span>Open</span>
                              <span className="font-semibold text-[#4b0f29]">
                                {complaints.filter((item) => item.status === "open").length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Replied</span>
                              <span className="font-semibold text-[#4b0f29]">
                                {complaints.filter((item) => item.status === "replied").length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Total</span>
                              <span className="font-semibold text-[#4b0f29]">
                                {complaints.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                      <form
                        className="grid gap-6"
                        onSubmit={handleComplaintSubmit}
                      >
                        <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Step 1
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                            Complaint details
                          </h3>
                          <div className="mt-4 grid gap-4">
                            <div>
                              <label
                                htmlFor="complaint-subject"
                                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                              >
                                Subject
                              </label>
                              <input
                                id="complaint-subject"
                                name="subject"
                                type="text"
                                value={complaintForm.subject}
                                onChange={handleComplaintChange}
                                className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                                placeholder="Short summary of the issue"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="complaint-product"
                                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                              >
                                Product ID or link (optional)
                              </label>
                              <input
                                id="complaint-product"
                                name="productId"
                                type="text"
                                value={complaintForm.productId}
                                onChange={handleComplaintChange}
                                className="mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                                placeholder="Paste the product link or id"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="complaint-message"
                                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]"
                              >
                                Details
                              </label>
                              <textarea
                                id="complaint-message"
                                name="message"
                                rows="5"
                                value={complaintForm.message}
                                onChange={handleComplaintChange}
                                className="mt-2 w-full rounded-2xl border border-[#ff6da6]/25 bg-white/90 p-3 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                                placeholder="Describe what happened and any order details."
                              />
                            </div>
                          </div>
                        </section>

                        <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Step 2
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                Evidence upload
                              </h3>
                              <p className="mt-1 text-sm text-[#6f3552]">
                                Upload a screenshot or product photo.
                              </p>
                            </div>
                            <label
                              htmlFor="complaint-image"
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                            >
                              {uploadingComplaintImage
                                ? "Uploading..."
                                : "Upload image"}
                            </label>
                            <input
                              id="complaint-image"
                              type="file"
                              accept="image/*"
                              onChange={handleComplaintImageSelection}
                              disabled={uploadingComplaintImage || complaintSaving}
                              className="hidden"
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-[#ff6da6]/25 bg-[#fff1f7] text-xs font-semibold text-[#a12d5d]">
                              {complaintForm.imageUrl ? (
                                <img
                                  src={complaintForm.imageUrl}
                                  alt="Complaint evidence"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>No image</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#4b0f29]">
                                {complaintForm.imageUrl
                                  ? "Image attached"
                                  : "No image yet"}
                              </p>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                            {complaintForm.imageUrl ? (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                                onClick={clearComplaintImage}
                              >
                                Remove image
                              </button>
                            ) : null}
                          </div>
                        </section>

                        <button
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                          type="submit"
                          disabled={complaintSaving}
                        >
                          {complaintSaving ? "Submitting..." : "Submit complaint"}
                        </button>
                      </form>

                      <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                        <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            Recent complaints
                          </p>
                          <div className="mt-4 grid gap-3">
                            {complaintsLoading ? (
                              <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                Loading complaints...
                              </div>
                            ) : complaints.length ? (
                              complaints.map((complaint) => (
                                <div
                                  key={complaint.id}
                                  className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 text-sm text-[#6f3552]"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-[#4b0f29]">
                                        {complaint.subject}
                                      </p>
                                      <p className="mt-1 text-xs text-[#7a3658]">
                                        {formatDate(complaint.createdAt)}
                                      </p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a12d5d]">
                                      {complaint.status}
                                    </span>
                                  </div>
                                  {complaint.product ? (
                                    <p className="mt-2 text-xs text-[#7a3658]">
                                      Product: {complaint.product.title}
                                    </p>
                                  ) : null}
                                  {complaint.imageUrl ? (
                                    <a
                                      className="mt-2 inline-flex text-xs font-semibold text-[#a12d5d] underline"
                                      href={complaint.imageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      View image
                                    </a>
                                  ) : null}
                                  <p className="mt-2 text-xs text-[#7a3658]">
                                    {complaint.message}
                                  </p>
                                  {complaint.adminReply?.message ? (
                                    <div className="mt-3 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] p-3 text-xs text-[#6f3552]">
                                      <p className="font-semibold text-[#4b0f29]">
                                        Admin reply
                                      </p>
                                      <p className="mt-1">
                                        {complaint.adminReply.message}
                                      </p>
                                      {complaint.adminReply.repliedAt ? (
                                        <p className="mt-2 text-[11px] text-[#7a3658]">
                                          {formatDate(complaint.adminReply.repliedAt)}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                No complaints submitted yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6">
                      <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                              Orders
                            </span>
                            <h2 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                              Track orders and payouts
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                              Stay on top of new sales, delivery handoffs, and
                              earnings.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Link
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                                to="/dashboard/listings"
                              >
                                View listings
                              </Link>
                              <Link
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                                to="/dashboard/new"
                              >
                                New listing
                              </Link>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                                New orders: {orderUnreadCount}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                                Total orders: {transactionSummary.totalOrders}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                                Gross: BDT{" "}
                                {formatPrice(transactionSummary.totalGross)}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                              Order pulse
                            </p>
                            <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                              <div className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                                <span>
                                  Respond quickly to new buyer messages.
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                                <span>
                                  Confirm handoff details within 24 hours.
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                                <span>
                                  Track payouts after delivery completion.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
                        <div className="grid gap-6">
                          <section
                            className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                            style={{ animationDelay: "0.05s" }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                  Revenue snapshot
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                  Order totals
                                </h3>
                              </div>
                              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                                Updated live
                              </span>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                              <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                  Total sales
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                  BDT{" "}
                                  {formatPrice(transactionSummary.totalSales)}
                                </p>
                                <span className="text-xs text-[#7a3658]">
                                  {transactionSummary.totalOrders} orders
                                </span>
                              </div>
                              <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                  Commission
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                  BDT{" "}
                                  {formatPrice(
                                    transactionSummary.totalCommission
                                  )}
                                </p>
                                <span className="text-xs text-[#7a3658]">
                                  Platform fee
                                </span>
                              </div>
                              <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                  Buyer total
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-[#4b0f29]">
                                  BDT{" "}
                                  {formatPrice(transactionSummary.totalGross)}
                                </p>
                                <span className="text-xs text-[#7a3658]">
                                  Gross volume
                                </span>
                              </div>
                            </div>
                          </section>

                          <section
                            className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                            style={{ animationDelay: "0.1s" }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                  Notifications
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                  Order updates
                                </h3>
                                <p className="mt-2 text-sm text-[#6f3552]">
                                  New purchases across your listings.
                                </p>
                              </div>
                              <div className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                                Unread: {orderUnreadCount}
                              </div>
                            </div>
                            <div className="mt-4 grid gap-3">
                              {notificationsLoading ? (
                                <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                  Loading notifications...
                                </div>
                              ) : orderNotifications.length ? (
                                orderNotifications.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]"
                                  >
                                    <p className="text-sm font-semibold text-[#4b0f29]">
                                      {item.message}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                  No new orders yet.
                                </div>
                              )}
                            </div>
                          </section>

                          <section
                            className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                            style={{ animationDelay: "0.15s" }}
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                                Recent transactions
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                                Latest orders
                              </h3>
                            </div>
                            <div className="mt-4 grid gap-4">
                              {transactionsLoading ? (
                                <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                  Loading transactions...
                                </div>
                              ) : transactions.length ? (
                                transactions.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.12)]"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <div className="grid h-12 w-12 place-items-center rounded-xl border border-[#ff6da6]/20 bg-[#fff1f7] text-base font-semibold text-[#a12d5d]">
                                          {item.productTitle?.[0] || "O"}
                                        </div>
                                        <div>
                                          <h4 className="text-lg font-semibold text-[#4b0f29]">
                                            {item.productTitle}
                                          </h4>
                                          <p className="mt-1 text-xs text-[#7a3658]">
                                            Buyer: {item.buyerName}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right text-xs text-[#7a3658]">
                                        <p className="font-semibold text-[#4b0f29]">
                                          Order
                                        </p>
                                        <p>{formatDate(item.createdAt)}</p>
                                      </div>
                                    </div>
                                    <div className="mt-4 grid gap-2 text-xs text-[#7a3658] sm:grid-cols-3">
                                      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                                        <span>Seller payout</span>
                                        <span className="font-semibold text-[#4b0f29]">
                                          BDT {formatPrice(item.price)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                                        <span>Platform fee</span>
                                        <span className="font-semibold text-[#4b0f29]">
                                          BDT{" "}
                                          {formatPrice(item.commissionAmount)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                                        <span>Buyer total</span>
                                        <span className="font-semibold text-[#4b0f29]">
                                          BDT {formatPrice(item.totalAmount)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                                  No transactions yet.
                                </div>
                              )}
                            </div>
                          </section>
                        </div>

                        <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                          <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                              Next steps
                            </p>
                            <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                              {orderSteps.map((step, index) => (
                                <div
                                  key={step}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] text-[10px] font-semibold text-[#a12d5d]">
                                    {index + 1}
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                              Handoff checklist
                            </p>
                            <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                              {handoffChecklist.map((item, index) => (
                                <div
                                  key={item}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] text-[10px] font-semibold text-[#a12d5d]">
                                    {index + 1}
                                  </span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                            <h3 className="text-lg font-semibold text-[#4b0f29]">
                              Quick actions
                            </h3>
                            <p className="mt-2 text-sm text-[#6f3552]">
                              Keep your storefront active while orders flow in.
                            </p>
                            <div className="mt-4 grid gap-2">
                              <Link
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                                to="/dashboard/new"
                              >
                                Start a new listing
                              </Link>
                              <Link
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                                to="/dashboard/listings"
                              >
                                View listings
                              </Link>
                              <Link
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                                to="/dashboard/profile"
                              >
                                Update profile
                              </Link>
                            </div>
                          </div>
                        </aside>
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
