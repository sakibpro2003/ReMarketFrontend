import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
      value: "--%",
      caption: "Set in settings"
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
                          Recent listings
                        </h2>
                        <p className="mt-2 text-sm text-[#6f3552]">
                          Review new submissions and message sellers.
                        </p>
                      </div>
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                        to="/admin/listings"
                      >
                        Open queue
                      </Link>
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
                              Seller: {item.sellerName}
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
                      >
                        Change rate
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                        type="button"
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
