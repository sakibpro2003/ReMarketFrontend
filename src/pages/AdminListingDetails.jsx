import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

const statusLabels = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  sold: "Sold"
};

const AdminListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    const loadListing = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load listing");
        }

        setListing(data.product);
      } catch (error) {
        toast.error(error.message || "Failed to load listing", {
          toastId: "admin-listing-detail"
        });
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [apiBase, id]);

  const updateStatus = async (action) => {
    if (!listing) {
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/listings/${listing._id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update listing");
      }

      navigate("/admin/listings", {
        state: {
          toast:
            action === "approve"
              ? "Listing approved successfully."
              : "Listing rejected successfully."
        }
      });
    } catch (error) {
      toast.error(error.message || "Failed to update listing", {
        toastId: `listing-${action}-error`
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  if (loading) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="dashboard-layout">
            <AdminSidebar />
            <main className="content-area">
              <div className="list-card">
                <h3 className="list-card-title">Loading listing...</h3>
                <p className="helper-text">Fetching details.</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="dashboard-layout">
            <AdminSidebar />
            <main className="content-area">
              <div className="list-card">
                <h3 className="list-card-title">Listing not found</h3>
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => navigate("/admin/listings")}
                >
                  Back to listings
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Listing details</span>
                <h1>{listing.title}</h1>
                <p className="helper-text">
                  {listing.category} ·{" "}
                  {conditionLabels[listing.condition] || "Condition"}
                </p>
              </div>
              <Link className="secondary-btn button-link" to="/admin/listings">
                Back to listings
              </Link>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <h3 className="section-title">Summary</h3>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">Status</span>
                    <span className={`status-pill status-${listing.status}`}>
                      {statusLabels[listing.status] || listing.status}
                    </span>
                  </div>
                  <div>
                    <span className="detail-label">Price</span>
                    <span>৳{formatPrice(listing.price)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Quantity</span>
                    <span>{listing.quantity}</span>
                  </div>
                  <div>
                    <span className="detail-label">Location</span>
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3 className="section-title">Seller</h3>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">Name</span>
                    <span>
                      {listing.seller?.firstName} {listing.seller?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="detail-label">Email</span>
                    <span>{listing.seller?.email}</span>
                  </div>
                  <div>
                    <span className="detail-label">Phone</span>
                    <span>{listing.seller?.phone}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card detail-span">
                <h3 className="section-title">Description</h3>
                <p className="helper-text">{listing.description}</p>
              </div>

              <div className="detail-card detail-span">
                <h3 className="section-title">Attributes</h3>
                {listing.attributes?.length ? (
                  <div className="attribute-grid">
                    {listing.attributes.map((attr, index) => (
                      <div key={`${attr.key}-${index}`} className="attribute-pill">
                        <strong>{attr.key}:</strong> {attr.value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">No custom attributes provided.</p>
                )}
              </div>

              <div className="detail-card detail-span">
                <h3 className="section-title">Images</h3>
                {listing.images?.length ? (
                  <div className="image-grid">
                    {listing.images.map((img, index) => (
                      <div key={`${img.url}-${index}`} className="image-tile">
                        <img src={img.url} alt={`Listing ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">No images provided.</p>
                )}
              </div>
            </div>

            <div className="action-row">
              <button
                className="secondary-btn"
                type="button"
                onClick={() => updateStatus("reject")}
                disabled={actionLoading || listing.status === "rejected"}
              >
                Reject
              </button>
              <button
                className="primary-btn"
                type="button"
                onClick={() => updateStatus("approve")}
                disabled={actionLoading || listing.status === "approved"}
              >
                Approve
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminListingDetails;
