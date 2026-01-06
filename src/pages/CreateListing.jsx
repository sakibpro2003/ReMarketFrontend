import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserSidebar from "../components/UserSidebar";

const emptyAttribute = { key: "", value: "" };
const emptyImage = { url: "" };
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

const CreateListing = () => {
  const navigate = useNavigate();
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
  const [images, setImages] = useState([emptyImage]);
  const [loading, setLoading] = useState(false);

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

  const updateImage = (index, value) => {
    setImages((prev) =>
      prev.map((item, idx) => (idx === index ? { url: value } : item))
    );
  };

  const addImage = () => {
    setImages((prev) => [...prev, emptyImage]);
  };

  const removeImage = (index) => {
    setImages((prev) =>
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)
    );
  };

  const buildPayload = (statusValue) => {
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
    setLoading(true);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(buildPayload(statusValue))
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
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitListing("pending");
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">New listing</span>
                <h1>Create a product post</h1>
                <p className="helper-text">
                  Add details and custom attributes so buyers understand your item.
                </p>
              </div>
              <Link className="secondary-btn button-link" to="/dashboard">
                Back to dashboard
              </Link>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="section-title">Core details</h2>
                <div className="form-row">
                  <div>
                    <label htmlFor="title">Product title</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. iPhone 13 Pro Max"
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
                      placeholder="City or area"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2 className="section-title">Pricing</h2>
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
                      placeholder="0.00"
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

              <div className="form-section">
                <h2 className="section-title">Description</h2>
                <div>
                  <label htmlFor="description">Details</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Share key details, usage history, and included accessories."
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
                  <p className="helper-text">Example: iphone, apple, 256gb</p>
                </div>
              </div>

              <div className="form-section">
                <h2 className="section-title">Images</h2>
                <p className="helper-text">
                  Add multiple image URLs for now. Uploads will be connected later.
                </p>
                <div className="stack">
                  {images.map((image, index) => (
                    <div className="attribute-row attribute-row-two" key={`image-${index}`}>
                      <input
                        type="url"
                        value={image.url}
                        onChange={(event) => updateImage(index, event.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        className="ghost-btn"
                        type="button"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button className="secondary-btn button-link" type="button" onClick={addImage}>
                  Add another image
                </button>
              </div>

              <div className="form-section">
                <h2 className="section-title">Custom attributes</h2>
                <p className="helper-text">
                  Add specs that are unique to this product type (size, material, model,
                  edition, warranty).
                </p>
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

              <div className="form-actions">
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => submitListing("draft")}
                  disabled={loading}
                >
                  Save draft
                </button>
                <button className="primary-btn" type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit for approval"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
