import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const categories = [
  "Electronics",
  "Furniture",
  "Fashion",
  "Home Appliances",
  "Books",
  "Sports",
  "Vehicles",
  "Toys",
  "Beauty",
  "Other"
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" }
];

const emptyAttribute = { key: "", value: "" };

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
  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    negotiable: false,
    quantity: 1,
    location: "",
    description: "",
    status: "pending",
    tags: ""
  });
  const [attributes, setAttributes] = useState([emptyAttribute]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const listingImages = useMemo(
    () => (listing?.images || []).filter((img) => img?.url),
    [listing]
  );
  const activeImage = listingImages[activeImageIndex] || listingImages[0];

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

  useEffect(() => {
    if (!listing) {
      return;
    }

    setForm({
      title: listing.title || "",
      category: listing.category || "",
      condition: listing.condition || "good",
      price: listing.price ?? "",
      negotiable: Boolean(listing.negotiable),
      quantity: listing.quantity ?? 1,
      location: listing.location || "",
      description: listing.description || "",
      status: listing.status || "pending",
      tags: listing.tags?.join(", ") || ""
    });
    setAttributes(listing.attributes?.length ? listing.attributes : [emptyAttribute]);
    setImages(listing.images?.length ? listing.images : []);
  }, [listing]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [listing?._id, listingImages.length]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const updateAttribute = (index, field, value) => {
    setAttributes((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, emptyAttribute]);
  };

  const removeAttribute = (index) => {
    setAttributes((prev) =>
      prev.length === 1 ? [emptyAttribute] : prev.filter((_, idx) => idx !== index)
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

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

  const uploadImage = async (file) => {
    const token = localStorage.getItem("remarket_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiBase}/api/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data;
  };

  const handleImageSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setUploadingImage(true);
    try {
      const uploads = [];
      for (const file of files) {
        const uploaded = await uploadImage(file);
        uploads.push(uploaded);
      }
      setImages((prev) => [
        ...prev,
        ...uploads.map((img) => ({ url: img.url }))
      ]);
    } catch (error) {
      toast.error(error.message || "Failed to upload image", {
        toastId: "admin-image-upload"
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const saveListing = async (event) => {
    event.preventDefault();
    if (!listing) {
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const attributesPayload = attributes
        .map((attr) => ({
          key: attr.key.trim(),
          value: attr.value.trim()
        }))
        .filter((attr) => attr.key && attr.value);

      const imagesPayload = images
        .map((img) => ({ url: img.url.trim() }))
        .filter((img) => img.url);

      const payload = {
        title: form.title.trim(),
        category: form.category,
        condition: form.condition,
        price: Number(form.price || 0),
        negotiable: form.negotiable,
        quantity: Number(form.quantity || 1),
        location: form.location.trim(),
        description: form.description.trim(),
        status: form.status,
        tags,
        attributes: attributesPayload,
        images: imagesPayload
      };

      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/admin/listings/${listing._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update listing");
      }

      navigate("/admin/listings", {
        state: { toast: "Listing updated successfully." }
      });
    } catch (error) {
      toast.error(error.message || "Failed to update listing", {
        toastId: "listing-update-error"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async () => {
    if (!listing || deleting) {
      return;
    }
    setDeleting(true);
    setShowDeleteModal(false);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/admin/listings/${listing._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete listing");
      }

      navigate("/admin/listings", { state: { toast: "Listing deleted." } });
    } catch (error) {
      toast.error(error.message || "Failed to delete listing", {
        toastId: "listing-delete-error"
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

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

  if (loading) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="dashboard-layout">
            <AdminSidebar />
            <main className="content-area admin-detail">
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
            <main className="content-area admin-detail">
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

          <main className="content-area admin-detail">
            <div className="admin-detail-header">
              <div>
                <span className="badge">Listing details</span>
                <h1 className="admin-detail-title">{listing.title}</h1>
                <p className="admin-detail-subtitle">
                  {listing.category} - {conditionLabels[listing.condition] || "Condition"}
                </p>
              </div>
              <Link className="secondary-btn button-link" to="/admin/listings">
                Back to listings
              </Link>
            </div>

            <section className="admin-detail-hero">
              <div className="admin-detail-media">
                <div className="admin-detail-media-main">
                  {activeImage ? (
                    <img src={activeImage.url} alt={listing.title} />
                  ) : (
                    <div className="admin-detail-media-placeholder">
                      <span>No image available</span>
                    </div>
                  )}
                </div>
                {listingImages.length > 1 ? (
                  <div className="admin-detail-thumb-row">
                    {listingImages.map((img, index) => (
                      <button
                        key={`${img.url}-${index}`}
                        type="button"
                        className={`admin-detail-thumb${
                          index === activeImageIndex ? " admin-detail-thumb-active" : ""
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={img.url} alt={`${listing.title} ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="admin-detail-summary">
                <div className="admin-detail-summary-header">
                  <span className={`status-pill status-${listing.status}`}>
                    {statusLabels[listing.status] || listing.status}
                  </span>
                  <span className="admin-detail-price">
                    BDT {formatPrice(listing.price)}
                  </span>
                </div>

                <div className="admin-detail-stat-grid">
                  <div className="admin-detail-stat">
                    <span className="admin-detail-stat-label">Quantity</span>
                    <span className="admin-detail-stat-value">{listing.quantity}</span>
                  </div>
                  <div className="admin-detail-stat">
                    <span className="admin-detail-stat-label">Negotiable</span>
                    <span className="admin-detail-stat-value">
                      {listing.negotiable ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="admin-detail-stat">
                    <span className="admin-detail-stat-label">Location</span>
                    <span className="admin-detail-stat-value">
                      {listing.location || "-"}
                    </span>
                  </div>
                  <div className="admin-detail-stat">
                    <span className="admin-detail-stat-label">Posted</span>
                    <span className="admin-detail-stat-value">
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="admin-detail-actions">
                  <span className="detail-label">Admin actions</span>
                  <div className="admin-detail-actions-row">
                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={saving || actionLoading || deleting || uploadingImage}
                    >
                      Delete listing
                    </button>
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() => updateStatus("reject")}
                      disabled={
                        actionLoading ||
                        saving ||
                        deleting ||
                        uploadingImage ||
                        listing.status === "rejected"
                      }
                    >
                      Reject
                    </button>
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => updateStatus("approve")}
                      disabled={
                        actionLoading ||
                        saving ||
                        deleting ||
                        uploadingImage ||
                        listing.status === "approved"
                      }
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-detail-grid">
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

              <div className="detail-card">
                <h3 className="section-title">Tags</h3>
                {listing.tags?.length ? (
                  <div className="attribute-grid">
                    {listing.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">No tags provided.</p>
                )}
              </div>

              <div className="detail-card admin-detail-span">
                <h3 className="section-title">Description</h3>
                <p className="helper-text">{listing.description}</p>
              </div>

              <div className="detail-card admin-detail-span">
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
            </section>

            <section className="admin-detail-edit">
              <form className="form-grid" onSubmit={saveListing}>
                <div className="form-section">
                  <h2 className="section-title">Edit listing</h2>
                  <div className="form-row">
                    <div>
                      <label htmlFor="title">Product title</label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div>
                      <label htmlFor="condition">Condition</label>
                      <select
                        id="condition"
                        name="condition"
                        value={form.condition}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>
                          Select condition
                        </option>
                        <option value="new">New</option>
                        <option value="like_new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location">Pickup location</label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Pricing & status</h2>
                  <div className="form-row">
                    <div>
                      <label htmlFor="price">Price</label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity">Quantity</label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div>
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="checkbox-row">
                      <input
                        id="negotiable"
                        name="negotiable"
                        type="checkbox"
                        checked={form.negotiable}
                        onChange={handleFormChange}
                      />
                      <label htmlFor="negotiable">Price is negotiable</label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Description & tags</h2>
                  <div>
                    <label htmlFor="description">Details</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={form.description}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tags">Tags</label>
                    <input
                      id="tags"
                      name="tags"
                      type="text"
                      value={form.tags}
                      onChange={handleFormChange}
                      placeholder="Separate tags with commas"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Custom attributes</h2>
                  <div className="stack">
                    {attributes.map((attribute, index) => (
                      <div className="attribute-row" key={`attribute-${index}`}>
                        <input
                          type="text"
                          value={attribute.key}
                          onChange={(event) =>
                            updateAttribute(index, "key", event.target.value)
                          }
                          placeholder="Attribute name"
                        />
                        <input
                          type="text"
                          value={attribute.value}
                          onChange={(event) =>
                            updateAttribute(index, "value", event.target.value)
                          }
                          placeholder="Attribute value"
                        />
                        <button
                          className="ghost-btn"
                          type="button"
                          onClick={() => removeAttribute(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="secondary-btn button-link"
                    type="button"
                    onClick={addAttribute}
                  >
                    Add attribute
                  </button>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Images</h2>
                  <p className="helper-text">
                    Upload images to Cloudinary. Save changes to apply them to the
                    listing.
                  </p>
                  <div className="upload-box">
                    <input
                      id="admin-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      disabled={uploadingImage || saving || deleting || actionLoading}
                    />
                    <label htmlFor="admin-images" className="upload-label">
                      {uploadingImage ? "Uploading..." : "Upload images"}
                    </label>
                    <span className="helper-text">{images.length} uploaded</span>
                  </div>
                  {images.length ? (
                    <div className="image-preview-grid">
                      {images.map((img, index) =>
                        img.url ? (
                          <div key={`${img.url}-${index}`} className="image-preview">
                            <img src={img.url} alt={`Listing ${index + 1}`} />
                            <button
                              className="ghost-btn"
                              type="button"
                              onClick={() => removeImage(index)}
                              disabled={uploadingImage}
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <p className="helper-text">No images uploaded yet.</p>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={saving || actionLoading || deleting || uploadingImage}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {showDeleteModal ? (
              <div
                className="modal-backdrop"
                role="presentation"
                onClick={() => setShowDeleteModal(false)}
              >
                <div
                  className="modal-card"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-listing-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3 id="delete-listing-title" className="modal-title">
                      Delete listing?
                    </h3>
                    <button
                      className="modal-close"
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      aria-label="Close"
                    >
                      x
                    </button>
                  </div>
                  <p className="modal-text">
                    This will permanently remove the listing and all associated data.
                    You cannot undo this action.
                  </p>
                  <div className="modal-actions">
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="danger-btn"
                      type="button"
                      onClick={deleteListing}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete listing"}
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

export default AdminListingDetails;
