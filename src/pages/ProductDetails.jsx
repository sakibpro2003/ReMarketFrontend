import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: 1,
    address: "",
    city: "",
    postalCode: "",
    professionalWebsite: "",
    additionalDetails: ""
  });

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${apiBase}/api/products/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load product");
        }
        setProduct(data.product);
        setActiveImage(data.product?.images?.[0]?.url || "");
        setCommissionRate(data.commissionRate || 0);
      } catch (error) {
        toast.error(error.message || "Failed to load product", {
          toastId: "product-detail"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [apiBase, id]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setPurchaseForm((prev) => ({
      ...prev,
      name: prev.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      address: prev.address || user.address || ""
    }));
  }, [user]);

  useEffect(() => {
    if (!product?.quantity) {
      return;
    }
    setPurchaseForm((prev) => {
      const current = Number.parseInt(prev.quantity, 10) || 1;
      const clamped = Math.min(Math.max(current, 1), product.quantity);
      if (clamped === current) {
        return prev;
      }
      return { ...prev, quantity: clamped };
    });
  }, [product?.quantity]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const updatePurchaseField = (field, value) => {
    setPurchaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setPurchaseForm((prev) => ({ ...prev, quantity: "" }));
      return;
    }
    const maxQuantity = product?.quantity || 1;
    const clamped = Math.min(Math.max(parsed, 1), maxQuantity);
    setPurchaseForm((prev) => ({ ...prev, quantity: clamped }));
  };

  const handlePurchase = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in to buy this product.");
      return;
    }

    try {
      const token = localStorage.getItem("remarket_token");
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const requestedQuantity = Math.max(
        1,
        Number.parseInt(purchaseForm.quantity, 10) || 1
      );
      if (product.quantity && requestedQuantity > product.quantity) {
        toast.error(
          `Only ${product.quantity} unit${product.quantity === 1 ? "" : "s"} available.`
        );
        return;
      }

      setPurchaseLoading(true);
      const payload = {
        productId: product._id,
        quantity: requestedQuantity,
        delivery: {
          name: purchaseForm.name.trim(),
          email: purchaseForm.email.trim(),
          phone: purchaseForm.phone.trim(),
          address: purchaseForm.address.trim(),
          city: purchaseForm.city.trim(),
          postalCode: purchaseForm.postalCode.trim(),
          professionalWebsite: purchaseForm.professionalWebsite.trim(),
          additionalDetails: purchaseForm.additionalDetails.trim()
        }
      };

      const response = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to place order");
      }

      toast.success("Order placed. The seller will contact you soon.");
      navigate("/products");
    } catch (error) {
      toast.error(error.message || "Failed to place order", {
        toastId: "purchase-error"
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="list-card">
            <h3 className="list-card-title">Loading product...</h3>
            <p className="helper-text">Fetching details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="list-card">
            <h3 className="list-card-title">Product not found</h3>
            <Link className="secondary-btn button-link" to="/products">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userId = user?.id || user?._id;
  const sellerId = product.seller?._id || product.seller;
  const isOwner =
    userId && sellerId && String(userId) === String(sellerId);
  const commissionPercent = Math.round(commissionRate * 1000) / 10;
  const orderQuantity = Math.max(
    1,
    Math.min(
      Number.parseInt(purchaseForm.quantity, 10) || 1,
      product.quantity || 1
    )
  );
  const subtotal = Number((product.price * orderQuantity).toFixed(2));
  const commissionAmount = Number((subtotal * commissionRate).toFixed(2));
  const totalAmount = Number((subtotal + commissionAmount).toFixed(2));

  return (
    <div className="page page-stack">
      <div className="app-shell">
        {user ? (
          <Navbar />
        ) : (
          <div className="public-header">
            <div className="brand">
              <span className="brand-mark">RM</span>
              ReMarket
            </div>
            <div className="public-actions">
              <Link className="secondary-btn button-link" to="/login">
                Sign in
              </Link>
              <Link className="primary-btn button-link" to="/register">
                Create account
              </Link>
            </div>
          </div>
        )}

        <div className="product-detail">
          <div className="product-detail-header">
            <div>
              <span className="badge">Approved listing</span>
              <h1>{product.title}</h1>
              <p className="helper-text">
                {product.category} ·{" "}
                {conditionLabels[product.condition] || "Condition"}
              </p>
            </div>
            <Link className="secondary-btn button-link" to="/products">
              Back to products
            </Link>
          </div>

          <div className="product-detail-grid">
            <div className="product-media">
              {activeImage ? (
                <img src={activeImage} alt={product.title} />
              ) : (
                <div className="product-image product-image-placeholder">
                  <span>{product.category?.[0] || "P"}</span>
                </div>
              )}
              {product.images?.length ? (
                <div className="thumbnail-row">
                  {product.images.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      className={
                        activeImage === img.url
                          ? "thumbnail thumbnail-active"
                          : "thumbnail"
                      }
                      onClick={() => setActiveImage(img.url)}
                    >
                      <img src={img.url} alt="Thumbnail" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="product-summary">
              <div className="price-card">
                <span className="helper-text">Asking price</span>
                <span className="product-price-lg">
                  BDT {formatPrice(product.price)}
                </span>
                <span className="helper-text">
                  {product.negotiable ? "Negotiable" : "Fixed price"}
                </span>
              </div>

              <div className="detail-card">
                <h3 className="section-title">Buy this item</h3>
                <p className="helper-text">
                  Provide delivery details and a professional website if
                  applicable.
                </p>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">Item price</span>
                    <span>BDT {formatPrice(product.price)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Quantity</span>
                    <span>{orderQuantity}</span>
                  </div>
                  <div>
                    <span className="detail-label">Subtotal</span>
                    <span>BDT {formatPrice(subtotal)}</span>
                  </div>
                  <div>
                    <span className="detail-label">
                      Platform commission ({commissionPercent}%)
                    </span>
                    <span>BDT {formatPrice(commissionAmount)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Total due</span>
                    <span>BDT {formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {product.status === "sold" || product.quantity <= 0 ? (
                  <p className="helper-text">
                    This item has already been sold.
                  </p>
                ) : !user ? (
                  <div className="detail-list">
                    <span className="helper-text">
                      Sign in to complete your purchase.
                    </span>
                    <Link className="primary-btn button-link" to="/login">
                      Sign in to buy
                    </Link>
                  </div>
                ) : isOwner ? (
                  <p className="helper-text">
                    You cannot buy your own listing.
                  </p>
                ) : (
                  <form className="form-grid" onSubmit={handlePurchase}>
                    <div className="form-row">
                      <div className="form-section">
                        <label htmlFor="order-quantity">Quantity</label>
                        <input
                          id="order-quantity"
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={purchaseForm.quantity}
                          onChange={(event) => updateQuantity(event.target.value)}
                          required
                        />
                        <span className="helper-text">
                          {product.quantity} available
                        </span>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-section">
                        <label htmlFor="delivery-name">Full name</label>
                        <input
                          id="delivery-name"
                          type="text"
                          value={purchaseForm.name}
                          onChange={(event) =>
                            updatePurchaseField("name", event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-section">
                        <label htmlFor="delivery-email">Email</label>
                        <input
                          id="delivery-email"
                          type="email"
                          value={purchaseForm.email}
                          onChange={(event) =>
                            updatePurchaseField("email", event.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-section">
                        <label htmlFor="delivery-phone">Phone</label>
                        <input
                          id="delivery-phone"
                          type="tel"
                          value={purchaseForm.phone}
                          onChange={(event) =>
                            updatePurchaseField("phone", event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-section">
                        <label htmlFor="delivery-city">City</label>
                        <input
                          id="delivery-city"
                          type="text"
                          value={purchaseForm.city}
                          onChange={(event) =>
                            updatePurchaseField("city", event.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-section">
                        <label htmlFor="delivery-postal">Postal code</label>
                        <input
                          id="delivery-postal"
                          type="text"
                          value={purchaseForm.postalCode}
                          onChange={(event) =>
                            updatePurchaseField(
                              "postalCode",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="form-section">
                        <label htmlFor="delivery-website">
                          Professional website
                        </label>
                        <input
                          id="delivery-website"
                          type="url"
                          value={purchaseForm.professionalWebsite}
                          onChange={(event) =>
                            updatePurchaseField(
                              "professionalWebsite",
                              event.target.value
                            )
                          }
                          placeholder="https://"
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <label htmlFor="delivery-address">Address</label>
                      <textarea
                        id="delivery-address"
                        rows="3"
                        value={purchaseForm.address}
                        onChange={(event) =>
                          updatePurchaseField("address", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-section">
                      <label htmlFor="delivery-notes">Additional details</label>
                      <textarea
                        id="delivery-notes"
                        rows="3"
                        value={purchaseForm.additionalDetails}
                        onChange={(event) =>
                          updatePurchaseField(
                            "additionalDetails",
                            event.target.value
                          )
                        }
                        placeholder="Add directions, delivery notes, or links."
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        className="primary-btn"
                        type="submit"
                        disabled={purchaseLoading}
                      >
                        {purchaseLoading ? "Placing order..." : "Buy now"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="detail-card">
                <h3 className="section-title">Overview</h3>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">Quantity</span>
                    <span>{product.quantity}</span>
                  </div>
                  <div>
                    <span className="detail-label">Location</span>
                    <span>{product.location}</span>
                  </div>
                  <div>
                    <span className="detail-label">Seller email</span>
                    <span>{product.seller?.email || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3 className="section-title">Description</h3>
                <p className="helper-text">{product.description}</p>
              </div>

              <div className="detail-card">
                <h3 className="section-title">Attributes</h3>
                {product.attributes?.length ? (
                  <div className="attribute-grid">
                    {product.attributes.map((attr, index) => (
                      <div key={`${attr.key}-${index}`} className="attribute-pill">
                        <strong>{attr.key}:</strong> {attr.value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">No custom attributes provided.</p>
                )}
              </div>

              {product.tags?.length ? (
                <div className="detail-card">
                  <h3 className="section-title">Tags</h3>
                  <div className="attribute-grid">
                    {product.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

