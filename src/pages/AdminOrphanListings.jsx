import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

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

const AdminOrphanListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sellerId, setSellerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const pageSize = 6;

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  const loadListings = useCallback(
    async (pageNumber) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(
          `${apiBase}/api/admin/orphan-listings?page=${pageNumber}&limit=${pageSize}`,
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
          toastId: "admin-orphan-listings"
        });
      } finally {
        setLoading(false);
      }
    },
    [apiBase, pageSize]
  );

  useEffect(() => {
    loadListings(page);
  }, [loadListings, page]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (!loading && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, pageSize, total]);

  const handleAssignSeller = async () => {
    const trimmedId = sellerId.trim();
    if (!trimmedId) {
      toast.error("Enter a seller user id.");
      return;
    }

    setAssignLoading(true);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/orphan-listings/assign-seller`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ sellerId: trimmedId })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to assign seller");
      }

      const updatedCount = data.updatedCount || 0;
      toast.success(
        `Assigned seller to ${updatedCount} listing${updatedCount === 1 ? "" : "s"}.`
      );
      setSellerId("");
      setPage(1);
      await loadListings(1);
    } catch (error) {
      toast.error(error.message || "Failed to assign seller", {
        toastId: "orphan-assign"
      });
    } finally {
      setAssignLoading(false);
    }
  };

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

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Orphan listings</span>
                <h1>Listings without sellers</h1>
                <p className="helper-text">
                  Products missing a valid seller account.
                </p>
              </div>
              <div className="notif-card">
                <span className="notif-count">{total}</span>
                <span className="helper-text">Need review</span>
              </div>
            </div>

            <div className="list-card list-card-strong orphan-assign-card">
              <div className="orphan-assign-header">
                <div>
                  <h3 className="list-card-title">Assign a seller</h3>
                  <p className="helper-text">
                    Paste a user _id to attach to every orphan listing.
                  </p>
                </div>
                <span className="status-pill status-pending">
                  {total} pending
                </span>
              </div>
              <div className="form-row orphan-assign-row">
                <div className="form-section">
                  <label htmlFor="orphan-seller-id">Seller user id</label>
                  <input
                    id="orphan-seller-id"
                    type="text"
                    value={sellerId}
                    onChange={(event) => setSellerId(event.target.value)}
                    placeholder="64b3f1..."
                  />
                </div>
                <div className="form-section orphan-assign-action">
                  <label className="helper-text">Action</label>
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={handleAssignSeller}
                    disabled={assignLoading || !sellerId.trim()}
                  >
                    {assignLoading ? "Assigning..." : "Assign seller"}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="list-grid">
                {loadingCards.map((index) => (
                  <div
                    key={`orphan-skeleton-${index}`}
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
                    <div className="list-card-meta">
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
                              {listing.category} -{" "}
                              {conditionLabels[listing.condition] || "Condition"}
                            </p>
                          </div>
                        </div>
                        <div className="list-card-status-stack">
                          <span className="status-pill status-blocked">
                            Missing seller
                          </span>
                          <span className="helper-text">
                            {formatDate(listing.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="list-card-meta">
                        <div>
                          <span className="detail-label">Status</span>
                          <span>
                            {statusLabels[listing.status] || listing.status}
                          </span>
                        </div>
                        <div>
                          <span className="detail-label">Location</span>
                          <span>{listing.location || "-"}</span>
                        </div>
                        <div>
                          <span className="detail-label">Quantity</span>
                          <span>{listing.quantity ?? "-"}</span>
                        </div>
                        <div>
                          <span className="detail-label">Price</span>
                          <span>BDT {formatPrice(listing.price)}</span>
                        </div>
                      </div>
                      <div className="list-card-body">
                        <span className="list-price">
                          BDT {formatPrice(listing.price)}
                        </span>
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
                <h3 className="list-card-title">No orphan listings found</h3>
                <p className="helper-text">
                  All products are attached to a seller.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminOrphanListings;
