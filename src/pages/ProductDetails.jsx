import React, { useEffect, useMemo, useState } from "react";
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
                  ৳{formatPrice(product.price)}
                </span>
                <span className="helper-text">
                  {product.negotiable ? "Negotiable" : "Fixed price"}
                </span>
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
                    <span className="detail-label">Seller</span>
                    <span>
                      {product.seller?.firstName} {product.seller?.lastName}
                    </span>
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
