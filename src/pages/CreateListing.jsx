import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";

const emptyAttribute = { key: "", value: "" };
const emptyImage = { url: "" };

const CreateListing = () => {
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
  const [status, setStatus] = useState("");

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("Listing ready to submit once the backend endpoint is wired.");
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

            {status ? <div className="info">{status}</div> : null}

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
                    <input
                      id="category"
                      name="category"
                      type="text"
                      value={form.category}
                      onChange={handleFormChange}
                      placeholder="e.g. Electronics, Furniture, Books"
                      required
                    />
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
                <button className="secondary-btn" type="button">
                  Save draft
                </button>
                <button className="primary-btn" type="submit">
                  Submit for approval
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
