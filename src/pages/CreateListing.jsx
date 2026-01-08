import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserSidebar from "../components/UserSidebar";

const emptyAttribute = { key: "", value: "" };
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

const listingChecklist = [
  "Add at least three clear photos.",
  "Confirm price, condition, and pickup location.",
  "Submit for approval to go live."
];

const approvalSteps = [
  "Admins review your submission within 24 hours.",
  "Once approved, your listing appears in search.",
  "Track orders and delivery updates in the dashboard."
];

const CreateListing = () => {
  const navigate = useNavigate();
  const previewUrlsRef = useRef([]);
  const [form, setForm] = useState({
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
  const [attributes, setAttributes] = useState([emptyAttribute]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

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
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)
    );
  };

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const items = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      return { file, preview };
    });

    setSelectedImages((prev) => [...prev, ...items]);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => {
      const item = prev[index];
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== item.preview
        );
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem("remarket_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/uploads/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data;
  };

  const uploadSelectedImages = async () => {
    const uploads = [];
    for (const item of selectedImages) {
      const uploaded = await uploadImage(item.file);
      uploads.push(uploaded);
    }
    return uploads;
  };

  const buildPayload = (statusValue, uploadedImages) => {
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

    const imagesPayload = (uploadedImages || [])
      .map((img) => ({ url: img.url }))
      .filter((img) => img.url);

    return {
      title: form.title.trim(),
      category: form.category,
      condition: form.condition,
      price: Number(form.price || 0),
      negotiable: form.negotiable,
      quantity: Number(form.quantity || 1),
      location: form.location.trim(),
      description: form.description.trim(),
      tags,
      attributes: attributesPayload,
      images: imagesPayload,
      status: statusValue
    };
  };

  const submitListing = async (statusValue) => {
    setSubmitting(true);
    try {
      let uploadedImages = [];
      if (statusValue === "pending" && selectedImages.length) {
        uploadedImages = await uploadSelectedImages();
      }

      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(buildPayload(statusValue, uploadedImages))
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      if (statusValue === "draft") {
        toast.success("Draft saved. You can submit it for approval anytime.");
      } else {
        navigate("/dashboard/listings", {
          state: { toast: "Listing submitted for approval. Admins notified." }
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to save listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitListing("pending");
  };

  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]";
  const inputClass =
    "mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40";
  const inputInlineClass =
    "w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40";
  const helperTextClass = "text-xs text-[#7a3658]";
  const tagList = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const attributeCount = attributes.filter(
    (attr) => attr.key.trim() && attr.value.trim()
  ).length;
  const priceValue = Number(form.price);
  const priceLabel =
    form.price !== "" && !Number.isNaN(priceValue)
      ? `BDT ${new Intl.NumberFormat("en-BD").format(priceValue)}`
      : "--";
  const summaryTitle = form.title.trim() || "Untitled listing";
  const locationLabel = form.location.trim() || "--";

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
                    New listing
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Create a product post
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Add details and custom attributes so buyers understand your item.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/80 px-4 py-2 text-sm font-semibold text-[#a12d5d] shadow-[0_10px_18px_rgba(255,88,150,0.18)]"
                      to="/dashboard"
                    >
                      Back to dashboard
                    </Link>
                    <a
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      href="#listing-form"
                    >
                      Jump to form
                    </a>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Photos: {selectedImages.length}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Attributes: {attributeCount}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Tags: {tagList.length}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.15)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Listing checklist
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    {listingChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form id="listing-form" className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
                <div className="grid gap-6">
                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.05s" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Step 1
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Core details
                        </h2>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                        Required
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="title" className={labelClass}>
                            Product title
                          </label>
                          <input
                            id="title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleFormChange}
                            placeholder="e.g. iPhone 13 Pro Max"
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="category" className={labelClass}>
                            Category
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleFormChange}
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
                          <label htmlFor="condition" className={labelClass}>
                            Condition
                          </label>
                          <select
                            id="condition"
                            name="condition"
                            value={form.condition}
                            onChange={handleFormChange}
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
                          <label htmlFor="location" className={labelClass}>
                            Pickup location
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={form.location}
                            onChange={handleFormChange}
                            placeholder="City or area"
                            required
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Step 2
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Pricing
                        </h2>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                        Flexible
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="price" className={labelClass}>
                            Price
                          </label>
                          <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={handleFormChange}
                            placeholder="0.00"
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="quantity" className={labelClass}>
                            Quantity
                          </label>
                          <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            value={form.quantity}
                            onChange={handleFormChange}
                            required
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] px-4 py-3 text-sm text-[#6f3552]">
                        <input
                          id="negotiable"
                          name="negotiable"
                          type="checkbox"
                          checked={form.negotiable}
                          onChange={handleFormChange}
                          className="h-4 w-4 accent-[#ff4f9a]"
                        />
                        <label
                          htmlFor="negotiable"
                          className="text-sm font-semibold text-[#6f3552]"
                        >
                          Price is negotiable
                        </label>
                      </div>
                    </div>
                  </section>

                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.15s" }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Step 3
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        Description
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Tell buyers what makes your item special and what comes with
                        it.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-4">
                      <div>
                        <label htmlFor="description" className={labelClass}>
                          Details
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows="4"
                          value={form.description}
                          onChange={handleFormChange}
                          placeholder="Share key details, usage history, and included accessories."
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="tags" className={labelClass}>
                          Tags
                        </label>
                        <input
                          id="tags"
                          name="tags"
                          type="text"
                          value={form.tags}
                          onChange={handleFormChange}
                          placeholder="Separate tags with commas"
                          className={inputClass}
                        />
                        <p className={`mt-2 ${helperTextClass}`}>
                          Example: iphone, apple, 256gb
                        </p>
                      </div>
                    </div>
                  </section>

                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Step 4
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        Images
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Select images now. They will upload when you submit for approval.
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-[#ff6da6]/40 bg-white/70 p-4">
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelection}
                        disabled={submitting}
                        className="hidden"
                      />
                      <label
                        htmlFor="images"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                      >
                        {submitting ? "Uploading..." : "Choose images"}
                      </label>
                      <span className={helperTextClass}>
                        {selectedImages.length} selected
                      </span>
                      <span className={helperTextClass}>PNG or JPG up to 5MB</span>
                    </div>
                    {selectedImages.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedImages.map((img, index) => (
                          <div
                            key={img.preview}
                            className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-3 shadow-[0_12px_24px_rgba(255,88,150,0.12)]"
                          >
                            <img
                              src={img.preview}
                              alt={`Listing ${index + 1}`}
                              className="h-32 w-full rounded-xl object-cover"
                            />
                            <button
                              className="mt-3 w-full rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                              type="button"
                              onClick={() => removeImage(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>

                  <section
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.25s" }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Step 5
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        Custom attributes
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Add specs unique to this product type (size, material, model,
                        edition, warranty).
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {attributes.map((attribute, index) => (
                        <div
                          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                          key={`attribute-${index}`}
                        >
                          <input
                            type="text"
                            value={attribute.key}
                            onChange={(event) =>
                              updateAttribute(index, "key", event.target.value)
                            }
                            placeholder="Attribute name"
                            className={inputInlineClass}
                          />
                          <input
                            type="text"
                            value={attribute.value}
                            onChange={(event) =>
                              updateAttribute(index, "value", event.target.value)
                            }
                            placeholder="Attribute value"
                            className={inputInlineClass}
                          />
                          <button
                            className="rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                            type="button"
                            onClick={() => removeAttribute(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                      type="button"
                      onClick={addAttribute}
                    >
                      Add attribute
                    </button>
                  </section>
                </div>

                <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                  <div
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.12s" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Listing summary
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                      {summaryTitle}
                    </h3>
                    <div className="mt-3 grid gap-3 text-sm text-[#6f3552]">
                      <div className="flex items-center justify-between gap-3">
                        <span>Category</span>
                        <span className="font-semibold text-[#4b0f29] capitalize">
                          {form.category || "--"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Condition</span>
                        <span className="font-semibold text-[#4b0f29] capitalize">
                          {form.condition ? form.condition.replace(/_/g, " ") : "--"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Location</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {locationLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Price</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {priceLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Quantity</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {form.quantity || "--"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Negotiable</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {form.negotiable ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Photos</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {selectedImages.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Attributes</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {attributeCount}
                        </span>
                      </div>
                    </div>
                    {tagList.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tagList.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-[#7a3658]">
                        Add tags to help buyers discover your item.
                      </p>
                    )}
                  </div>

                  <div
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.16s" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      After you submit
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                      {approvalSteps.map((step) => (
                        <div key={step} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)] animate-[card-rise_0.5s_ease_both]"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Ready to submit?
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Save a draft or send it for approval whenever you are ready.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                        type="button"
                        onClick={() => submitListing("draft")}
                        disabled={submitting}
                      >
                        Save draft
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit for approval"}
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;

