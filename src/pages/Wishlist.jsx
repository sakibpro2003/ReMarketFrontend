import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

const Wishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadWishlist = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load wishlist");
        }

        if (isActive) {
          setItems(data.items || []);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load wishlist", {
          toastId: "wishlist-load"
        });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      isActive = false;
    };
  }, [apiBase, user]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const wishlistStats = useMemo(() => {
    const categories = new Set();
    const totalValue = items.reduce((sum, item) => {
      const product = item.product;
      if (product?.category) {
        categories.add(product.category);
      }
      return sum + (Number(product?.price) || 0);
    }, 0);

    return {
      itemCount: items.length,
      totalValue,
      categoryCount: categories.size
    };
  }, [items]);

  const { itemCount, totalValue, categoryCount } = wishlistStats;

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("remarket_token");
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }
      const response = await fetch(`${apiBase}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update wishlist");
      }
      setItems((prev) => prev.filter((item) => item.product?._id !== productId));
    } catch (error) {
      toast.error(error.message || "Failed to update wishlist", {
        toastId: "wishlist-update"
      });
    }
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <Navbar />

        <section className="wishlist-hero">
          <div className="wishlist-hero-content">
            <span className="wishlist-badge">Wishlist</span>
            <h1 className="wishlist-hero-title">
              Your saved picks, glowing with possibility.
            </h1>
            <p className="wishlist-hero-text">
              Track the pieces you love, compare options, and come back when
              the moment is right.
            </p>
            <div className="wishlist-hero-actions">
              <Link className="wishlist-browse-btn button-link" to="/products">
                Browse products
              </Link>
              <span className="wishlist-hero-stat">{itemCount} saved</span>
              <span className="wishlist-hero-stat">
                {categoryCount} categories
              </span>
            </div>
          </div>
          <div className="wishlist-hero-card">
            <div className="wishlist-hero-card-header">
              <div>
                <p className="wishlist-hero-card-title">Collection snapshot</p>
                <p className="helper-text">
                  Keep an eye on your favorites in one place.
                </p>
              </div>
            </div>
            <div className="wishlist-hero-metrics">
              <div className="wishlist-metric">
                <span className="wishlist-metric-label">Saved items</span>
                <span className="wishlist-metric-value">{itemCount}</span>
              </div>
              <div className="wishlist-metric">
                <span className="wishlist-metric-label">Total value</span>
                <span className="wishlist-metric-value">
                  BDT {formatPrice(totalValue)}
                </span>
              </div>
              <div className="wishlist-metric">
                <span className="wishlist-metric-label">Categories</span>
                <span className="wishlist-metric-value">{categoryCount}</span>
              </div>
            </div>
            <div className="wishlist-hero-footer">
              <span className="helper-text">
                {loading
                  ? "Updating your wishlist..."
                  : itemCount
                  ? "Stay ready for price drops and restocks."
                  : "Start saving items you love."}
              </span>
              {itemCount ? (
                <Link className="ghost-btn button-link" to="/products">
                  Add more
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="wishlist-collection">
          <div className="wishlist-collection-header">
            <div>
              <h2>Saved collection</h2>
              <p className="helper-text">
                {itemCount
                  ? "Everything you marked for later."
                  : "Your wishlist will appear here."}
              </p>
            </div>
            <div className="wishlist-collection-meta">
              <span className="wishlist-chip">{itemCount} items</span>
              <span className="wishlist-chip">
                BDT {formatPrice(totalValue)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="wishlist-state">
              <h3 className="wishlist-state-title">Loading wishlist...</h3>
              <p className="helper-text">Fetching your saved items.</p>
            </div>
          ) : items.length ? (
            <div className="products-grid wishlist-grid">
              {items.map((item) => {
                const product = item.product;
                if (!product) {
                  return null;
                }
                return (
                  <div key={item._id} className="product-card">
                    <button
                      type="button"
                      className="wishlist-button wishlist-button-active"
                      aria-label="Remove from wishlist"
                      onClick={() => removeFromWishlist(product._id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M12 20.5s-7-4.4-9.3-8.2C.9 9.6 2.2 6 5.7 5.2c2-.4 3.7.5 4.8 2 1.1-1.5 2.8-2.4 4.8-2 3.5.8 4.8 4.4 3 7.1C19 16.1 12 20.5 12 20.5z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </button>
                    <img
                      src={product.images?.[0]?.url || "/placeholder-product.svg"}
                      alt={product.title || "Product image"}
                      className="product-image"
                      onError={(event) => {
                        if (!event.currentTarget.src.includes("/placeholder-product.svg")) {
                          event.currentTarget.src = "/placeholder-product.svg";
                        }
                      }}
                    />
                    <div className="product-info">
                      <div>
                        <h3>{product.title}</h3>
                        <p className="helper-text">
                          {product.category} -{" "}
                          {conditionLabels[product.condition] || "Condition"}
                        </p>
                      </div>
                      <div className="product-meta">
                        <span className="product-price">
                          BDT {formatPrice(product.price)}
                        </span>
                        <span className="helper-text">{product.location}</span>
                      </div>
                      <Link
                        className="secondary-btn button-link"
                        to={`/products/${product._id}`}
                      >
                        View product
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="wishlist-state wishlist-empty">
              <h3 className="wishlist-state-title">No items yet</h3>
              <p className="helper-text">
                Tap the heart on a product card to save it here.
              </p>
              <Link className="secondary-btn button-link" to="/products">
                Explore products
              </Link>
            </div>
          )}
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Wishlist;
