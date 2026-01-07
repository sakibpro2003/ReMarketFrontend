import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0);

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

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

 

  if (loading) {
    return (
      <div className="page page-stack">
        <div className="app-shell">
          <div className="product-detail product-detail-compact product-detail-loading">
            <div className="product-detail-loader">
              <div className="skeleton-image product-detail-loader-media" />
              <div className="product-detail-loader-info">
                <span className="skeleton-line skeleton-title" />
                <span className="skeleton-line skeleton-subtitle" />
                <div className="product-detail-loader-row">
                  <span className="skeleton-line skeleton-price" />
                  <span className="skeleton-line skeleton-location" />
                </div>
                <span className="skeleton-line skeleton-subtitle" />
                <div className="skeleton-button" />
              </div>
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
  const isOwner =
    userId && sellerId && String(userId) === String(sellerId);
  const commissionPercent = Math.round(commissionRate * 1000) / 10;
  const previewQuantity = 1;
  const subtotal = Number((product.price * previewQuantity).toFixed(2));
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

        <div className="product-detail product-detail-compact">
          <div className="product-detail-header">
            <div className="product-detail-title-stack">
              <span className="badge product-detail-badge">Approved listing</span>
              <h1 className="product-detail-title">{product.title}</h1>
              <div className="product-detail-meta">
                <span className="product-detail-chip">{product.category}</span>
                <span className="product-detail-chip">
                  {conditionLabels[product.condition] || "Condition"}
                </span>
                {product.location ? (
                  <span className="product-detail-chip">{product.location}</span>
                ) : null}
                <span className="product-detail-chip">
                  {product.negotiable ? "Negotiable" : "Fixed price"}
                </span>
              </div>
            </div>
            <div className="product-detail-actions">
              <Link
                className="ghost-btn button-link product-detail-back"
                to="/products"
              >
                Back to products
              </Link>
              <span className="product-detail-price-pill">
                BDT {formatPrice(product.price)}
              </span>
            </div>
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
              <div className="product-media-details">
                <div className="product-media-pill">
                  <span className="product-media-label">Price</span>
                  <span className="product-media-value">
                    BDT {formatPrice(product.price)}
                  </span>
                </div>
                <div className="product-media-pill">
                  <span className="product-media-label">Location</span>
                  <span className="product-media-value">
                    {product.location || "Location not set"}
                  </span>
                </div>
                <div className="product-media-pill">
                  <span className="product-media-label">Available</span>
                  <span className="product-media-value">
                    {product.quantity ?? "-"}
                  </span>
                </div>
                <div className="product-media-pill">
                  <span className="product-media-label">Terms</span>
                  <span className="product-media-value">
                    {product.negotiable ? "Negotiable" : "Fixed price"}
                  </span>
                </div>
              </div>
              <div className="detail-card product-media-description">
                <h3 className="section-title">Description</h3>
                <p className="helper-text">{product.description}</p>
              </div>
            </div>

            <div className="product-summary">
              <div className="detail-card product-purchase-card">
                <div className="product-purchase-header">
                  <h3 className="section-title">Checkout</h3>
                  <span className="product-purchase-step">Step 1 of 2</span>
                </div>
                <p className="helper-text">
                  Choose quantity and add delivery details on the next screen.
                </p>
                <div className="detail-list product-purchase-list">
                  <div>
                    <span className="detail-label">Item price</span>
                    <span>BDT {formatPrice(product.price)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Quantity</span>
                    <span>{previewQuantity} item</span>
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
                  <Link
                    className="primary-btn button-link product-buy-btn"
                    to="/login"
                  >
                    Sign in to buy
                  </Link>
                ) : isOwner ? (
                  <p className="helper-text">
                    You cannot buy your own listing.
                  </p>
                ) : (
                  <Link
                    className="primary-btn button-link product-buy-btn"
                    to={`/checkout/${product._id}`}
                  >
                    Buy now
                  </Link>
                )}
              </div>

              <div className="product-summary-grid">
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
                  <h3 className="section-title">Attributes</h3>
                  {product.attributes?.length ? (
                    <div className="attribute-grid">
                      {product.attributes.map((attr, index) => (
                        <div key={`${attr.key}-${index}`} className="text-pink-800 flex bg-pink-200 h-6 p-2 rounded-lg items-center justify-between content-center text-sm">
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
    </div>
  );
};

export default ProductDetails;


