import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserSidebar from "../components/UserSidebar";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalItems: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    const storedPage = Number(window.localStorage.getItem("user_orders_page"));
    return Number.isFinite(storedPage) && storedPage > 0 ? storedPage : 1;
  });
  const [total, setTotal] = useState(0);
  const pageSize = 6;
  const fallbackImage = "/placeholder-product.svg";

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("user_orders_page", String(page));
  }, [page]);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(
          `${apiBase}/api/orders/history?page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load order history");
        }
        setOrders(data.orders || []);
        setSummary(
          data.summary || { totalOrders: 0, totalItems: 0, totalSpent: 0 }
        );
        setTotal(data.total || 0);
      } catch (error) {
        toast.error(error.message || "Failed to load order history", {
          toastId: "user-orders"
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [apiBase, page, pageSize]);

  const formatPrice = (value) => {
    if (Number.isNaN(value)) {
      return "0";
    }
    return new Intl.NumberFormat("en-BD").format(value);
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = (() => {
    const maxButtons = 5;
    const start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);
    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index
    );
  })();
  const showingStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(total, page * pageSize);
  const showingRange = total === 0 ? "0" : `${showingStart}-${showingEnd}`;
  const lastPurchaseDate = orders.length ? formatDate(orders[0].createdAt) : "-";
  const lastPurchaseTitle = orders[0]?.product?.title || "No purchases yet.";

  useEffect(() => {
    if (loading) {
      return;
    }
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area user-orders">
            <section className="user-orders-hero">
              <div className="user-orders-hero-copy">
                <div className="user-orders-kicker">
                  <span className="badge">Orders</span>
                  <span className="user-orders-queue">Buying history</span>
                </div>
                <h1 className="user-orders-title">Your purchases</h1>
                <p className="user-orders-subtitle">
                  Track everything you have bought across ReMarket.
                </p>
                <div className="user-orders-stats">
                  <div className="user-orders-stat">
                    <span className="user-orders-stat-label">Orders</span>
                    <span className="user-orders-stat-value">
                      {summary.totalOrders}
                    </span>
                  </div>
                  <div className="user-orders-stat">
                    <span className="user-orders-stat-label">Items</span>
                    <span className="user-orders-stat-value">
                      {summary.totalItems}
                    </span>
                  </div>
                  <div className="user-orders-stat">
                    <span className="user-orders-stat-label">Total spent</span>
                    <span className="user-orders-stat-value">
                      BDT {formatPrice(summary.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="user-orders-hero-panel">
                <div className="user-orders-summary-card">
                  <p className="user-orders-summary-label">Latest purchase</p>
                  <p className="user-orders-summary-value">{lastPurchaseDate}</p>
                  <p className="user-orders-summary-meta">{lastPurchaseTitle}</p>
                  <p className="user-orders-summary-range">
                    Showing {showingRange} of {total}
                  </p>
                </div>
                <div className="user-orders-tip">
                  <span className="user-orders-tip-label">Buyer tip</span>
                  <p className="user-orders-tip-text">
                    Save receipts and delivery details in case you need support.
                  </p>
                </div>
              </div>
            </section>

            {loading ? (
              <div className="list-grid user-orders-grid">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={`order-skeleton-${index}`}
                    className="list-card list-card-strong list-card-skeleton"
                  >
                    <div className="list-card-header">
                      <div className="list-card-title-row">
                        <div className="list-skeleton-thumb skeleton-block" />
                        <div className="list-card-title-stack">
                          <span className="list-skeleton-title skeleton-block" />
                          <span className="list-skeleton-subtitle skeleton-block" />
                        </div>
                      </div>
                      <span className="list-skeleton-pill skeleton-block" />
                    </div>
                    <div className="list-card-meta list-card-meta-skeleton">
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                      <div className="list-card-tags">
                        <span className="list-skeleton-meta list-skeleton-meta-wide skeleton-block" />
                      </div>
                    </div>
                    <div className="list-card-body">
                      <span className="list-skeleton-price skeleton-block" />
                      <span className="list-skeleton-button skeleton-block" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length ? (
              <>
                <div className="list-grid user-orders-grid">
                  {orders.map((order) => {
                    const productTitle = order.product?.title || "Listing removed";
                    const productImage = order.product?.images?.[0]?.url || fallbackImage;
                    const deliveryCity = order.delivery?.city
                      ? `, ${order.delivery.city}`
                      : "";

                    return (
                      <div key={order.id} className="list-card list-card-strong">
                        <div className="list-card-header">
                          <div className="list-card-title-row">
                            <img
                              src={productImage}
                              alt={productTitle || "Product image"}
                              className="list-card-thumb"
                              onError={(event) => {
                                if (!event.currentTarget.src.includes(fallbackImage)) {
                                  event.currentTarget.src = fallbackImage;
                                }
                              }}
                            />
                            <div>
                              <h3 className="list-card-title">{productTitle}</h3>
                              <p className="helper-text">
                                Seller: {order.seller?.name || "Unknown"}
                              </p>
                              <p className="helper-text">
                                Ordered: {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <span className="status-pill status-purchased">
                            Purchased
                          </span>
                        </div>
                        <div className="list-card-meta">
                          <div>
                            <span className="detail-label">Quantity</span>
                            <span>{order.quantity}</span>
                          </div>
                          <div>
                            <span className="detail-label">Subtotal</span>
                            <span>BDT {formatPrice(order.price)}</span>
                          </div>
                          <div>
                            <span className="detail-label">Commission</span>
                            <span>BDT {formatPrice(order.commissionAmount)}</span>
                          </div>
                          <div>
                            <span className="detail-label">Total</span>
                            <span>BDT {formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className="list-card-tags">
                            <span className="detail-label">Delivery</span>
                            <span>
                              {order.delivery?.address || "-"}
                              {deliveryCity}
                            </span>
                          </div>
                        </div>
                        <div className="list-card-body">
                          <span className="text-xs text-[#7a3658]">
                            Order placed by {order.delivery?.name || "you"}
                          </span>
                          {order.product?.id ? (
                            <Link
                              className="secondary-btn button-link user-orders-view-btn"
                              to={`/products/${order.product.id}`}
                            >
                              View product
                            </Link>
                          ) : (
                            <span className="helper-text">Product unavailable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 ? (
                  <div className="pagination pagination-market user-orders-pagination">
                    <button
                      className="pagination-btn"
                      type="button"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      Prev
                    </button>
                    <div className="pagination-pages">
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={
                            pageNumber === page
                              ? "pagination-btn pagination-btn-active"
                              : "pagination-btn"
                          }
                          type="button"
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    <button
                      className="pagination-btn"
                      type="button"
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                    <span className="pagination-info">
                      Page {page} of {totalPages}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="list-card user-orders-empty">
                <h3 className="list-card-title">No purchases yet</h3>
                <p className="helper-text">
                  Your buying history will show up here after your first order.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserOrders;
