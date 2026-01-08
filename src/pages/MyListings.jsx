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

const statusTone = {
  draft: "border-[#ff6da6]/20 bg-[#fff1f7] text-[#a12d5d]",
  pending: "border-[#ff6da6]/20 bg-[#fff3e6] text-[#a35b00]",
  approved: "border-[#ff6da6]/20 bg-[#eef7f6] text-[#14635e]",
  rejected: "border-[#ff6da6]/20 bg-[#ffecee] text-[#b3362b]",
  sold: "border-[#ff6da6]/20 bg-[#eef6f0] text-[#2e6a3e]"
};

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
  const [editingListing, setEditingListing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    negotiable: false,
    quantity: 1,
    location: "",
    description: "",
    tags: ""
  });

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

  const statusCounts = useMemo(() => {
    const counts = {
      total: listings.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      sold: 0,
      draft: 0
    };

    listings.forEach((listing) => {
      const key = listing.status;
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [listings]);

  const openEdit = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title || "",
      category: listing.category || "",
      condition: listing.condition || "",
      price: listing.price ?? "",
      negotiable: Boolean(listing.negotiable),
      quantity: listing.quantity ?? 1,
      location: listing.location || "",
      description: listing.description || "",
      tags: (listing.tags || []).join(", ")
    });
  };

  const closeEdit = () => {
    setEditingListing(null);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEditSave = async (event) => {
    event.preventDefault();
    if (!editingListing) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("remarket_token");
      const tags = editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = {
        title: editForm.title.trim(),
        category: editForm.category,
        condition: editForm.condition,
        price: Number(editForm.price),
        negotiable: editForm.negotiable,
        quantity: Number(editForm.quantity || 1),
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        tags
      };

      const response = await fetch(`${apiBase}/api/products/${editingListing._id}`, {
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

      setListings((prev) =>
        prev.map((item) => (item._id === data.product._id ? data.product : item))
      );
      toast.success("Listing updated.");
      setEditingListing(null);
    } catch (error) {
      toast.error(error.message || "Failed to update listing", {
        toastId: "update-listing-error"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (value) => {
    if (Number.isNaN(value)) {
      return "0";
    }
    return new Intl.NumberFormat("en-BD").format(value);
  };

  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]";
  const inputClass =
    "mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40";

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]">
            <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                    My listings
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Your product posts
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Track approvals, edit details, and monitor sales.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/dashboard/new"
                    >
                      New listing
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                      to="/dashboard"
                    >
                      Back to dashboard
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Total: {statusCounts.total}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Pending: {statusCounts.pending}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Live: {statusCounts.approved}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Sold: {statusCounts.sold}
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
                      <span>Refresh titles, photos, and price points.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                      <span>Confirm pickup availability and location.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                      <span>Reply fast to keep buyers engaged.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
              <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Portfolio
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                      All listings
                    </h2>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Manage everything you have posted so far.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                      type="button"
                    >
                      All {statusCounts.total}
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                      type="button"
                    >
                      Pending {statusCounts.pending}
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                      type="button"
                    >
                      Live {statusCounts.approved}
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                      type="button"
                    >
                      Drafts {statusCounts.draft}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  {loading ? (
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                      <h3 className="text-lg font-semibold text-[#4b0f29]">
                        Loading listings...
                      </h3>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Pulling your latest posts.
                      </p>
                    </div>
                  ) : listings.length ? (
                    listings.map((listing) => (
                      <div
                        key={listing._id}
                        className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.12)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-xl border border-[#ff6da6]/20 bg-[#fff1f7] text-base font-semibold text-[#a12d5d]">
                              {listing.title?.[0] || "L"}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-[#4b0f29]">
                                {listing.title}
                              </h3>
                              <p className="mt-1 text-xs text-[#7a3658]">
                                {(listing.category || "Category")}{" | "}
                                {conditionLabels[listing.condition] || "Condition"}
                              </p>
                              <p className="mt-2 text-xs text-[#7a3658]">
                                Location: {listing.location || "--"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                              statusTone[listing.status] ||
                              "border-[#ff6da6]/25 bg-white/85 text-[#a12d5d]"
                            }`}
                          >
                            {statusLabels[listing.status] || listing.status}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="font-semibold text-[#4b0f29]">
                              BDT {formatPrice(listing.price)}
                            </span>
                            <span className="text-xs text-[#7a3658]">
                              Qty: {listing.quantity ?? 1}
                            </span>
                          </div>
                          <button
                            className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => openEdit(listing)}
                            disabled={saving || listing.status === "sold"}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_12px_24px_rgba(255,88,150,0.12)]">
                      <h3 className="text-lg font-semibold text-[#4b0f29]">
                        No listings yet
                      </h3>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Create a listing to see your products here.
                      </p>
                      <Link
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                        to="/dashboard/new"
                      >
                        Create listing
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
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
                        {statusCounts.pending}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Live listings</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {statusCounts.approved}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Drafts saved</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {statusCounts.draft}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Sold items</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {statusCounts.sold}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-[#7a3658]">
                    Keep drafts ready so you can publish quickly.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Listing workflow
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                      <span>Submit for approval and wait for review.</span>
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

                <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
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
            {editingListing ? (
              <div className="modal-backdrop">
                <div className="w-full max-w-3xl rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-6 shadow-[0_24px_48px_rgba(255,88,150,0.22)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Update listing
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#4b0f29]">
                        {editingListing.title || "Edit your listing"}
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Update key details to keep your listing fresh.
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                      type="button"
                      onClick={closeEdit}
                      disabled={saving}
                    >
                      Close
                    </button>
                  </div>

                  <form className="mt-5 grid gap-4" onSubmit={handleEditSave}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="edit-title" className={labelClass}>
                          Product title
                        </label>
                        <input
                          id="edit-title"
                          name="title"
                          type="text"
                          value={editForm.title}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-category" className={labelClass}>
                          Category
                        </label>
                        <select
                          id="edit-category"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="edit-condition" className={labelClass}>
                          Condition
                        </label>
                        <select
                          id="edit-condition"
                          name="condition"
                          value={editForm.condition}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
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
                        <label htmlFor="edit-location" className={labelClass}>
                          Pickup location
                        </label>
                        <input
                          id="edit-location"
                          name="location"
                          type="text"
                          value={editForm.location}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="edit-price" className={labelClass}>
                          Price
                        </label>
                        <input
                          id="edit-price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-quantity" className={labelClass}>
                          Quantity
                        </label>
                        <input
                          id="edit-quantity"
                          name="quantity"
                          type="number"
                          min="1"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] px-4 py-3 text-sm text-[#6f3552]">
                      <input
                        id="edit-negotiable"
                        name="negotiable"
                        type="checkbox"
                        checked={editForm.negotiable}
                        onChange={handleEditChange}
                        className="h-4 w-4 accent-[#ff4f9a]"
                      />
                      <label
                        htmlFor="edit-negotiable"
                        className="text-sm font-semibold text-[#6f3552]"
                      >
                        Price is negotiable
                      </label>
                    </div>

                    <div>
                      <label htmlFor="edit-description" className={labelClass}>
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        name="description"
                        rows="4"
                        value={editForm.description}
                        onChange={handleEditChange}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-tags" className={labelClass}>
                        Tags
                      </label>
                      <input
                        id="edit-tags"
                        name="tags"
                        type="text"
                        value={editForm.tags}
                        onChange={handleEditChange}
                        className={inputClass}
                      />
                      <p className="mt-2 text-xs text-[#7a3658]">
                        Separate tags with commas.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        className="rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                        type="button"
                        onClick={closeEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyListings;

