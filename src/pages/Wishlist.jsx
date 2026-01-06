import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

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

        <div className="wishlist-header">
          <div>
            <h1>Wishlist</h1>
            <p className="helper-text">Saved items you want to track.</p>
          </div>
          <Link className="secondary-btn button-link" to="/products">
            Browse products
          </Link>
        </div>

        {loading ? (
          <div className="list-card">
            <h3 className="list-card-title">Loading wishlist...</h3>
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
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image product-image-placeholder">
                      <span>{product.category?.[0] || "P"}</span>
                    </div>
                  )}
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
          <div className="list-card">
            <h3 className="list-card-title">No items yet</h3>
            <p className="helper-text">
              Tap the heart on a product card to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
