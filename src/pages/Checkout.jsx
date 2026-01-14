import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

const Checkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const phonePrefix = "+8801";
  const normalizePhoneSuffix = (value) =>
    value.replace(/\D/g, "").slice(0, 9);
  const extractPhoneSuffix = (value) => {
    if (!value) {
      return "";
    }
    const trimmed = value.trim();
    const match = trimmed.match(/^(?:\+?88)?01([3-9]\d{8})$/);
    if (match) {
      return match[1];
    }
    const digits = trimmed.replace(/\D/g, "");
    if (digits.startsWith("8801") && digits.length >= 13) {
      return digits.slice(4, 13);
    }
    if (digits.startsWith("01") && digits.length >= 11) {
      return digits.slice(2, 11);
    }
    return "";
  };
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    phone: "",
    quantity: 1,
    address: "",
  });

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (user) {
      return;
    }
    toast.info("Sign in to continue checkout.", { toastId: "checkout-login" });
    navigate("/login", { replace: true, state: { from: location.pathname } });
  }, [user, navigate, location.pathname]);

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
          toastId: "checkout-product",
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
    setPurchaseForm((prev) => {
      const nextPhone =
        prev.phone || extractPhoneSuffix(user.phone);
      return {
        ...prev,
        phone: nextPhone,
        address: prev.address || user.address || "",
      };
    });
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
    const nextValue =
      field === "phone" ? normalizePhoneSuffix(value) : value;
    setPurchaseForm((prev) => ({ ...prev, [field]: nextValue }));
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

  const removeFromWishlist = async (token, productId) => {
    if (!token || !productId) {
      return;
    }
    try {
      await fetch(`${apiBase}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to remove wishlist item after order", error);
    }
  };

  const handlePurchase = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in to buy this product.");
      return;
    }

    if (!product) {
      toast.error("Product details are missing.");
      return;
    }
    const buyerId = user?.id || user?._id;
    const sellerId = product.seller?._id || product.seller;
    if (buyerId && sellerId && String(buyerId) === String(sellerId)) {
      toast.error("You cannot buy your own listing.");
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
          `Only ${product.quantity} unit${
            product.quantity === 1 ? "" : "s"
          } available.`
        );
        return;
      }

      setPurchaseLoading(true);
      const deliveryName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
      const deliveryEmail = user.email || "";
      const payload = {
        productId: product._id,
        quantity: requestedQuantity,
        delivery: {
          name: deliveryName,
          email: deliveryEmail.trim(),
          phone: `${phonePrefix}${purchaseForm.phone}`.trim(),
          address: purchaseForm.address.trim(),
        },
      };

      const response = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to place order");
      }

      removeFromWishlist(token, product._id);
      toast.success("Order placed. The seller will contact you soon.");
      navigate("/products");
    } catch (error) {
      toast.error(error.message || "Failed to place order", {
        toastId: "purchase-error",
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="checkout-shell checkout-shell-compact checkout-loading">
            <div className="checkout-header checkout-header-compact">
              <div className="checkout-loader-header">
                <span className="skeleton-line skeleton-title" />
                <span className="skeleton-line skeleton-subtitle" />
              </div>
              <span className="skeleton-line checkout-loader-pill" />
            </div>
            <div className="checkout-grid">
              <div className="checkout-form">
                <div className="checkout-card">
                  <span className="skeleton-line skeleton-title" />
                  <div className="checkout-loader-row">
                    <span className="skeleton-line skeleton-subtitle" />
                    <span className="skeleton-line skeleton-subtitle" />
                  </div>
                  <div className="checkout-loader-row">
                    <span className="skeleton-line skeleton-subtitle" />
                    <span className="skeleton-line skeleton-subtitle" />
                  </div>
                </div>
                <div className="checkout-card">
                  <span className="skeleton-line skeleton-title" />
                  <span className="skeleton-line skeleton-subtitle" />
                  <span className="skeleton-line skeleton-subtitle" />
                </div>
              </div>
              <aside className="checkout-summary">
                <div className="checkout-card">
                  <div className="checkout-loader-product">
                    <div className="skeleton-image checkout-loader-thumb" />
                    <div className="checkout-loader-product-info">
                      <span className="skeleton-line skeleton-title" />
                      <span className="skeleton-line skeleton-subtitle" />
                    </div>
                  </div>
                </div>
                <div className="checkout-card">
                  <span className="skeleton-line skeleton-title" />
                  <div className="checkout-loader-list">
                    <span className="skeleton-line skeleton-subtitle" />
                    <span className="skeleton-line skeleton-subtitle" />
                    <span className="skeleton-line skeleton-subtitle" />
                  </div>
                  <div className="skeleton-button" />
                </div>
              </aside>
            </div>
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
  const isOwner = userId && sellerId && String(userId) === String(sellerId);
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
  const commissionPercent = Math.round(commissionRate * 1000) / 10;
  const isSoldOut = product.status === "sold" || product.quantity <= 0;

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <Navbar />

        <div className="checkout-shell checkout-shell-compact">
          <div className="checkout-header checkout-header-compact">
            <div>
              <span className="badge">Checkout</span>
              <h1 className="checkout-title">Confirm your order</h1>
              <p className="helper-text">
                Review details and add delivery information.
              </p>
            </div>
            <div className="checkout-header-actions">
              <span className="checkout-step">Step 2 of 2</span>
              <Link
                className="ghost-btn button-link checkout-back"
                to={`/products/${product._id}`}
              >
                Back to product
              </Link>
            </div>
          </div>

          {isOwner ? (
            <div className="list-card">
              <h3 className="list-card-title">This is your own listing</h3>
              <p className="helper-text">
                You cannot purchase your own product.
              </p>
            </div>
          ) : (
            <form className="checkout-grid" onSubmit={handlePurchase}>
              <div className="checkout-form">
                <div className="checkout-card">
                  <h3 className="section-title">Order details</h3>
                  <p className="helper-text">
                    Buyer name and email are pulled from your profile.
                  </p>
                  <div className="form-row checkout-two-col">
                    <div className="form-section">
                      <label htmlFor="checkout-phone">Phone</label>
                      <div className="mt-2 flex rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus-within:ring-2 focus-within:ring-[#ff79c1]/40">
                        <span className="flex items-center rounded-l-xl border-r border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                          {phonePrefix}
                        </span>
                        <input
                          id="checkout-phone"
                          type="tel"
                          inputMode="numeric"
                          pattern="[3-9][0-9]{8}"
                          maxLength={9}
                          value={purchaseForm.phone}
                          onChange={(event) =>
                            updatePurchaseField("phone", event.target.value)
                          }
                          required
                          className="w-full rounded-r-xl bg-transparent px-3 py-2 text-sm text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="form-section">
                      <label htmlFor="checkout-quantity">
                        Quantity ({product.quantity} pc's in stock)
                      </label>
                      <input
                        id="checkout-quantity"
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={purchaseForm.quantity}
                        onChange={(event) => updateQuantity(event.target.value)}
                        required
                      />
                      
                    </div>
                  </div>
                </div>

                <div className="checkout-card">
                  <h3 className="section-title">Delivery details</h3>
                  <div className="form-section">
                    <label htmlFor="checkout-address">Address</label>
                    <textarea
                      id="checkout-address"
                      rows="3"
                      value={purchaseForm.address}
                      onChange={(event) =>
                        updatePurchaseField("address", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <aside className="checkout-summary">
                <div className="checkout-card checkout-product-card">
                  <div className="checkout-product">
                    {activeImage ? (
                      <img src={activeImage} alt={product.title} />
                    ) : (
                      <div className="checkout-product-placeholder">
                        <span>{product.category?.[0] || "P"}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="checkout-product-title">
                        {product.title}
                      </h3>
                      <p className="helper-text">
                        {product.category} -{" "}
                        {conditionLabels[product.condition] || "Condition"}
                      </p>
                      <div className="checkout-product-chips">
                        <span className="checkout-chip">
                          {product.category}
                        </span>
                        <span className="checkout-chip">
                          {conditionLabels[product.condition] || "Condition"}
                        </span>
                      </div>
                      <span className="checkout-price">
                        BDT {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="checkout-card checkout-summary-card">
                  <h3 className="section-title">Order summary</h3>
                  <div className="detail-list checkout-summary-list">
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
                        Commission ({commissionPercent}%)
                      </span>
                      <span>BDT {formatPrice(commissionAmount)}</span>
                    </div>
                    <div>
                      <span className="detail-label">Total due</span>
                      <span className="checkout-total">
                        BDT {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {isSoldOut ? (
                    <p className="helper-text">
                      This item has already been sold.
                    </p>
                  ) : (
                    <button
                      className="primary-btn checkout-confirm-btn"
                      type="submit"
                      disabled={purchaseLoading}
                    >
                      {purchaseLoading ? "Placing order..." : "Confirm order"}
                    </button>
                  )}
                </div>
              </aside>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
