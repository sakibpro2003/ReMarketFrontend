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
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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
              <div className="list-card">
                <h3 className="list-card-title">Loading listings...</h3>
                <p className="helper-text">Fetching submissions.</p>
              </div>
            ) : listings.length ? (
              <div className="list-grid">
                {listings.map((listing) => (
                  <div key={listing._id} className="list-card list-card-strong">
                    <div className="list-card-header">
                      <div>
                        <h3 className="list-card-title">{listing.title}</h3>
                        <p className="helper-text">
                          {listing.category} ·
                          {` ${conditionLabels[listing.condition] || "Condition"}`}
                        </p>
                        <p className="helper-text">
                          Seller: {listing.seller?.firstName}{" "}
                          {listing.seller?.lastName}
                        </p>
                      </div>
                      <span className={`status-pill status-${listing.status}`}>
                        {statusLabels[listing.status] || listing.status}
                      </span>
                    </div>
                    <div className="list-card-body">
                      <span className="list-price">৳{formatPrice(listing.price)}</span>
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
