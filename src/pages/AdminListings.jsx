import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" },
  { value: "draft", label: "Draft" }
];

const statusLabels = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  sold: "Sold"
};

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

const AdminListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "all";
    }
    const storedStatus = window.localStorage.getItem("admin_listings_status");
    const isValid = statusOptions.some((option) => option.value === storedStatus);
    return isValid ? storedStatus : "all";
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    const storedPage = Number(window.localStorage.getItem("admin_listings_page"));
    return Number.isFinite(storedPage) && storedPage > 0 ? storedPage : 1;
  });
  const [total, setTotal] = useState(0);
  const pageSize = 6;

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (location.state?.toast) {
      toast.success(location.state.toast, { toastId: location.state.toast });
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("admin_listings_status", status);
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("admin_listings_page", String(page));
  }, [page]);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(
          `${apiBase}/api/admin/listings?status=${status}&page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load listings");
        }

        setListings(data.products || []);
        setTotal(data.total || 0);
      } catch (error) {
        toast.error(error.message || "Failed to load listings", {
          toastId: `admin-listings-${status}`
        });
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [apiBase, page, pageSize, status]);

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
  const loadingCards = Array.from({ length: 4 }, (_, index) => index);

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
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Listings</span>
                <h1>Review listings</h1>
                <p className="helper-text">
                  Approve or reject submissions from sellers.
                </p>
              </div>
              <div className="filter-row">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={
                      status === option.value
                        ? "filter-btn filter-btn-active"
                        : "filter-btn"
                    }
                    type="button"
                    onClick={() => {
                      setStatus(option.value);
                      setPage(1);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="list-grid">
                {loadingCards.map((index) => (
                  <div
                    key={`listing-skeleton-${index}`}
                    className="list-card list-card-strong list-card-skeleton"
                  >
                    <div className="list-card-header">
                      <div className="list-card-title-row">
                        <div className="list-skeleton-thumb skeleton-block" />
                        <div className="list-card-title-stack">
                          <span className="list-skeleton-title skeleton-block" />
                          <span className="list-skeleton-subtitle skeleton-block" />
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
            ) : listings.length ? (
              <>
                <div className="list-grid">
                  {listings.map((listing) => (
                  <div key={listing._id} className="list-card list-card-strong">
                    <div className="list-card-header">
                      <div className="list-card-title-row">
                        {listing.images?.[0]?.url ? (
                          <img
                            src={listing.images[0].url}
                            alt={listing.title}
                            className="list-card-thumb"
                          />
                        ) : (
                          <div className="list-card-thumb list-card-thumb-placeholder">
                            <span>{listing.title?.[0] || "P"}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="list-card-title">{listing.title}</h3>
                          <p className="helper-text">
                            {listing.category} -
                            {` ${conditionLabels[listing.condition] || "Condition"}`}
                          </p>
                          <p className="helper-text">
                            Seller: {listing.seller?.firstName}{" "}
                            {listing.seller?.lastName}
                          </p>
                        </div>
                      </div>
                      <span className={`status-pill status-${listing.status}`}>
                        {statusLabels[listing.status] || listing.status}
                      </span>
                    </div>
                    <div className="list-card-meta">
                      <div>
                        <span className="detail-label">Location</span>
                        <span>{listing.location || "-"}</span>
                      </div>
                      <div>
                        <span className="detail-label">Quantity</span>
                        <span>{listing.quantity ?? "-"}</span>
                      </div>
                      <div>
                        <span className="detail-label">Posted</span>
                        <span>{formatDate(listing.createdAt)}</span>
                      </div>
                      <div>
                        <span className="detail-label">Negotiable</span>
                        <span>{listing.negotiable ? "Yes" : "No"}</span>
                      </div>
                      <div className="list-card-tags">
                        <span className="detail-label">Tags</span>
                        <span>
                          {listing.tags?.length ? listing.tags.join(", ") : "None"}
                        </span>
                      </div>
                    </div>
                    <div className="list-card-body">
                      <span className="list-price">BDT {formatPrice(listing.price)}</span>
                      <Link
                        className="secondary-btn button-link"
                        to={`/admin/listings/${listing._id}`}
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                  ))}
                </div>
                {totalPages > 1 ? (
                  <div className="pagination">
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
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
              <div className="list-card">
                <h3 className="list-card-title">No listings found</h3>
                <p className="helper-text">Try another status filter.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminListings;






