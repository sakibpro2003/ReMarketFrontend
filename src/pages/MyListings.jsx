import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserSidebar from "../components/UserSidebar";

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

const MyListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      try {
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

        setListings(data.products || []);
      } catch (error) {
        toast.error(error.message || "Failed to load listings", {
          toastId: "load-listings-error"
        });
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [apiBase]);

  const formatPrice = (value) => {
    if (Number.isNaN(value)) {
      return "0";
    }
    return new Intl.NumberFormat("en-BD").format(value);
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">My listings</span>
                <h1>Your product posts</h1>
                <p className="helper-text">
                  Track approvals, edit details, and monitor sales.
                </p>
              </div>
              <Link className="primary-btn button-link" to="/dashboard/new">
                New listing
              </Link>
            </div>

            {loading ? (
              <div className="list-card">
                <h3 className="list-card-title">Loading listings...</h3>
                <p className="helper-text">Fetching your posts.</p>
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
                      </div>
                      <span className={`status-pill status-${listing.status}`}>
                        {statusLabels[listing.status] || listing.status}
                      </span>
                    </div>
                    <div className="list-card-body">
                      <span className="list-price">৳{formatPrice(listing.price)}</span>
                      <span className="helper-text">{listing.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="list-grid">
                <div className="list-card">
                  <h3 className="list-card-title">No listings yet</h3>
                  <p className="helper-text">
                    Create a listing to see your products here.
                  </p>
                  <Link className="secondary-btn button-link" to="/dashboard/new">
                    Create listing
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
