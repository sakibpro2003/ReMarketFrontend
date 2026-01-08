import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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
  const [commissionRate, setCommissionRate] = useState(null);
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [rateSaving, setRateSaving] = useState(false);
  const isListings = pathname.startsWith("/admin/listings");
  const isCommission = pathname.startsWith("/admin/commission");
  const isUsers = pathname.startsWith("/admin/users");
  const isOverview = !isListings && !isCommission && !isUsers;

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

  const formatDateTime = (value) => {
    if (!value) {
      return "--";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPercent = (value) => {
    if (typeof value !== "number") {
      return "--";
    }
    const percent = value * 100;
    const formatted = percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(2);
    return `${formatted}%`;
  };

  const loadCommission = async () => {
    try {
      setCommissionLoading(true);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/admin/commission`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setCommissionRate(typeof data.rate === "number" ? data.rate : null);
      setCommissionHistory(data.history || []);
    } catch (error) {
      console.error("Failed to load commission settings", error);
    } finally {
      setCommissionLoading(false);
    }
  };

  const openRateModal = () => {
    if (typeof commissionRate === "number") {
      const percent = commissionRate * 100;
      const formatted = percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(2);
      setRateInput(formatted);
    } else {
      setRateInput("");
    }
    setRateModalOpen(true);
  };

  const closeRateModal = () => {
    setRateModalOpen(false);
  };

  const openHistoryModal = async () => {
    if (!commissionHistory.length) {
      await loadCommission();
    }
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
  };

  const handleSaveRate = async () => {
    if (String(rateInput).trim() === "") {
      toast.error("Enter a commission rate.", {
        toastId: "commission-rate-empty"
      });
      return;
    }

    const parsed = Number(rateInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid commission rate.", {
        toastId: "commission-rate-invalid"
      });
      return;
    }

    try {
      setRateSaving(true);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/admin/commission`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rate: parsed })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update commission rate");
      }

      setCommissionRate(typeof data.rate === "number" ? data.rate : commissionRate);
      if (data.historyItem) {
        setCommissionHistory((prev) => [data.historyItem, ...prev].slice(0, 12));
      } else {
        await loadCommission();
      }
      toast.success("Commission rate updated.", {
        toastId: "commission-rate-success"
      });
      setRateModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update commission rate", {
        toastId: "commission-rate-error"
      });
    } finally {
      setRateSaving(false);
    }
  };

  useEffect(() => {
    if (!isCommission) {
      return;
    }
    loadCommission();
  }, [apiBase, isCommission]);

  const summaryPills = isCommission
    ? [
        { label: "Orders", value: transactionSummary.totalOrders },
        {
          label: "Platform revenue",
          value: `BDT ${formatPrice(transactionSummary.totalCommission)}`
        },
        {
          label: "Gross volume",
          value: `BDT ${formatPrice(transactionSummary.totalGross)}`
        }
      ]
    : isOverview
    ? [
        { label: "Unread", value: unreadCount },
        { label: "Orders", value: transactionSummary.totalOrders },
        {
          label: "Revenue",
          value: `BDT ${formatPrice(transactionSummary.totalCommission)}`
        }
      ]
    : [
        { label: "Unread", value: unreadCount },
        { label: "Orders", value: transactionSummary.totalOrders }
      ];

  const heroNotes = isCommission
    ? [
        "Review revenue trends before adjusting fees.",
        "Coordinate updates with finance and support.",
        "Track seller payout changes after updates."
      ]
    : isOverview
    ? [
        "Approve new listings within 24 hours.",
        "Monitor submissions flagged by the team.",
        "Follow up on urgent seller requests."
      ]
    : isListings
    ? [
        "Keep approval queues moving.",
        "Flag risky submissions quickly.",
        "Notify sellers about corrections."
      ]
    : [
        "Verify staff access regularly.",
        "Respond to user reports quickly.",
        "Keep support notes up to date."
      ];

  const overviewStats = [
    {
      label: "Unread submissions",
      value: unreadCount,
      caption: "Awaiting review"
    },
    {
      label: "Orders processed",
      value: transactionSummary.totalOrders,
      caption: "All time"
    },
    {
      label: "Platform revenue",
      value: `BDT ${formatPrice(transactionSummary.totalCommission)}`,
      caption: "Commission earned"
    }
  ];

  const commissionHighlights = [
    {
      label: "Current rate",
      value: commissionLoading ? "--%" : formatPercent(commissionRate),
      caption: "Applied to new orders"
    },
    {
      label: "Gross volume",
      value: `BDT ${formatPrice(transactionSummary.totalGross)}`,
      caption: "Buyer totals"
    },
    {
      label: "Platform revenue",
      value: `BDT ${formatPrice(transactionSummary.totalCommission)}`,
      caption: "Commission earned"
    }
  ];

  const transactionsSection = (
    <section
      id="admin-transactions"
      className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.14)] animate-[card-rise_0.5s_ease_both]"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
            Transactions
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
            Revenue overview
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
          Orders: {transactionSummary.totalOrders}
        </span>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff1f7] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Platform revenue
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
              BDT {formatPrice(transactionSummary.totalCommission)}
            </h2>
            <span className="text-xs text-[#7a3658]">
              {transactionSummary.totalOrders} orders
            </span>
          </div>
          <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Seller payouts
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
              BDT {formatPrice(transactionSummary.totalSales)}
            </h2>
            <span className="text-xs text-[#7a3658]">Net item totals</span>
          </div>
          <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Gross volume
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
              BDT {formatPrice(transactionSummary.totalGross)}
            </h2>
            <span className="text-xs text-[#7a3658]">Buyer payments</span>
          </div>
        </div>
        <div className="grid gap-3">
          {transactionsLoading ? (
            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
              <h3 className="text-lg font-semibold text-[#4b0f29]">
                Loading transactions...
              </h3>
              <p className="mt-2 text-sm text-[#6f3552]">
                Fetching payouts and commissions.
              </p>
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
                      <h3 className="text-lg font-semibold text-[#4b0f29]">
                        {item.productTitle || "Untitled order"}
                      </h3>
                      <p className="mt-1 text-xs text-[#7a3658]">
                        Seller: {item.sellerName || "--"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                      Order
                    </span>
                    <p className="mt-2 text-xs text-[#7a3658]">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[#6f3552] sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3">
                    <span>Seller payout</span>
                    <span className="font-semibold text-[#4b0f29]">
                      BDT {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Platform commission</span>
                    <span className="font-semibold text-[#4b0f29]">
                      BDT {formatPrice(item.commissionAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Buyer total</span>
                    <span className="font-semibold text-[#4b0f29]">
                      BDT {formatPrice(item.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Buyer</span>
                    <span className="font-semibold text-[#4b0f29]">
                      {item.buyerName || "--"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
              <h3 className="text-lg font-semibold text-[#4b0f29]">
                No transactions yet
              </h3>
              <p className="mt-2 text-sm text-[#6f3552]">
                Orders will appear here once placed.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]">
            <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
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
                    {isCommission ? (
                      <>
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                          to="/admin"
                        >
                          Back to overview
                        </Link>
                        <Link
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                          to="/admin/listings"
                        >
                          Review listings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                          to="/admin/listings"
                        >
                          Review listings
                        </Link>
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                          to="/admin/commission"
                        >
                          Update commission
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {summaryPills.map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                      >
                        {item.label}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Admin focus
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    {heroNotes.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isOverview ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
                <div className="grid gap-6">
                  <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Marketplace snapshot
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Admin overview
                        </h2>
                        <p className="mt-2 text-sm text-[#6f3552]">
                          Track submissions, orders, and revenue momentum.
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                        Unread: {unreadCount}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {overviewStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            {stat.label}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[#4b0f29]">
                            {stat.value}
                          </h3>
                          <span className="text-xs text-[#7a3658]">
                            {stat.caption}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.05s" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Submissions
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Recent submissions
                        </h2>
                        <p className="mt-2 text-sm text-[#6f3552]">
                          Review new listings and blog requests.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                          to="/admin/listings"
                        >
                          Listings queue
                        </Link>
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                          to="/admin/blogs"
                        >
                          Blog queue
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4"
                          >
                            <p className="text-sm font-semibold text-[#4b0f29]">
                              {item.message}
                            </p>
                            <p className="mt-1 text-xs text-[#7a3658]">
                              {item.submitterLabel || "Submitter"}:{" "}
                              {item.submitterName || item.sellerName || "Unknown"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                          <p className="text-sm font-semibold text-[#4b0f29]">
                            No new submissions yet
                          </p>
                          <p className="mt-1 text-xs text-[#7a3658]">
                            New listings will appear here once submitted.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {transactionsSection}
                </div>

                <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                  <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Quick actions
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                      Admin shortcuts
                    </h3>
                    <div className="mt-4 grid gap-2">
                      <Link
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                        to="/admin/listings"
                      >
                        Review listings
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                        to="/admin/blogs"
                      >
                        Review blogs
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                        to="/admin/commission"
                      >
                        Update commission
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                        to="/admin/users"
                      >
                        Manage users
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Admin checklist
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                        <span>Respond to flagged listings within a day.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>Verify commission updates before peak hours.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                        <span>Share notable issues with support.</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      System notes
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Keep momentum on submissions and revenue reviews.
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-[#6f3552]">
                      <div className="flex items-center justify-between gap-3">
                        <span>Unread submissions</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {unreadCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Notifications</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {notifications.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Transactions tracked</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {transactionSummary.totalOrders}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            ) : isCommission ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
                <div className="grid gap-6">
                  <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Commission settings
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Adjust platform fees
                        </h2>
                        <p className="mt-2 text-sm text-[#6f3552]">
                          Set the rate for new orders and monitor revenue impact.
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                        Live
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {commissionHighlights.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                            {stat.label}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[#4b0f29]">
                            {stat.value}
                          </h3>
                          <span className="text-xs text-[#7a3658]">
                            {stat.caption}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                        type="button"
                        onClick={openRateModal}
                        disabled={commissionLoading}
                      >
                        Change rate
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                        type="button"
                        onClick={openHistoryModal}
                        disabled={commissionLoading}
                      >
                        View history
                      </button>
                    </div>
                  </section>

                  {transactionsSection}
                </div>

                <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                  <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Commission tips
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>Benchmark competitor fees before updates.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                        <span>Message sellers about upcoming changes.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>Review gross volume after each update.</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Fee impact
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Monitor how the rate shifts seller and buyer totals.
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-[#6f3552]">
                      <div className="flex items-center justify-between gap-3">
                        <span>Seller payouts</span>
                        <span className="font-semibold text-[#4b0f29]">
                          BDT {formatPrice(transactionSummary.totalSales)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Platform revenue</span>
                        <span className="font-semibold text-[#4b0f29]">
                          BDT {formatPrice(transactionSummary.totalCommission)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Gross volume</span>
                        <span className="font-semibold text-[#4b0f29]">
                          BDT {formatPrice(transactionSummary.totalGross)}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            ) : isListings ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Pending approvals
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    New submissions waiting review.
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                    to="/admin/listings"
                  >
                    View pending
                  </Link>
                </div>
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Recently approved
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Audit quality and compliance.
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                    to="/admin/listings"
                  >
                    View approved
                  </Link>
                </div>
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Rejected listings
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Reasons and seller follow-up.
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                    to="/admin/listings"
                  >
                    View rejected
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Promote user
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Give admin access to trusted staff.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                    type="button"
                  >
                    Promote
                  </button>
                </div>
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Suspended users
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Handle reports and abuse.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                    type="button"
                  >
                    Review
                  </button>
                </div>
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Verification queue
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Review seller verification requests.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                    type="button"
                  >
                    Open queue
                  </button>
                </div>
              </div>
            )}

            {isCommission && rateModalOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b0c1a]/40 px-4 py-8 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-[28px] border border-[#ff6da6]/25 bg-white/95 p-6 shadow-[0_28px_60px_rgba(255,88,150,0.28)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                        Update rate
                      </span>
                      <h2 className="mt-3 text-xl font-semibold text-[#4b0f29]">
                        Change commission rate
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Enter the new rate as a percent (for example, 5 for 5%).
                      </p>
                    </div>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#ff6da6]/25 text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closeRateModal}
                      aria-label="Close rate modal"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M6 6l12 12M18 6l-12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Current rate</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {formatPercent(commissionRate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      New rate (%)
                    </label>
                    <input
                      className="w-full rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                      type="number"
                      min="0"
                      step="0.1"
                      value={rateInput}
                      onChange={(event) => setRateInput(event.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      className="flex-1 rounded-full border border-[#ff6da6]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closeRateModal}
                      disabled={rateSaving}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)] transition hover:translate-y-[-1px]"
                      type="button"
                      onClick={handleSaveRate}
                      disabled={rateSaving}
                    >
                      {rateSaving ? "Saving..." : "Save rate"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isCommission && historyModalOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b0c1a]/40 px-4 py-8 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-[28px] border border-[#ff6da6]/25 bg-white/95 p-6 shadow-[0_28px_60px_rgba(255,88,150,0.28)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                        Commission history
                      </span>
                      <h2 className="mt-3 text-xl font-semibold text-[#4b0f29]">
                        Rate changes
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Review past commission updates and who made them.
                      </p>
                    </div>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#ff6da6]/25 text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closeHistoryModal}
                      aria-label="Close history modal"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M6 6l12 12M18 6l-12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-5 max-h-[320px] overflow-y-auto pr-1">
                    {commissionLoading ? (
                      <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                        Loading history...
                      </div>
                    ) : commissionHistory.length ? (
                      <div className="grid gap-3">
                        {commissionHistory.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-[#4b0f29]">
                                  {formatPercent(item.rate)}
                                </p>
                                <p className="mt-1 text-xs text-[#7a3658]">
                                  {formatDateTime(item.createdAt)}
                                </p>
                              </div>
                              <div className="text-right text-xs text-[#7a3658]">
                                <p className="font-semibold text-[#4b0f29]">
                                  {item.createdBy?.name || "System"}
                                </p>
                                <p>{item.createdBy?.email || "-"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                        No commission changes recorded yet.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      className="rounded-full border border-[#ff6da6]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closeHistoryModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
