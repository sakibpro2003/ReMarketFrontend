import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9L12 3.5z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const RatingStars = ({ value, onChange }) => (
  <div className="flex items-center gap-1 text-[#ff4f9a]">
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= Math.round(value || 0);
      return onChange ? (
        <button
          key={star}
          type="button"
          className="transition hover:scale-105"
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star filled={filled} />
        </button>
      ) : (
        <span key={star}>
          <Star filled={filled} />
        </span>
      );
    })}
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    avgRating: 0,
    count: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewEditing, setReviewEditing] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewDeleting, setReviewDeleting] = useState(false);

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
          toastId: "product-detail",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [apiBase, id]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await fetch(`${apiBase}/api/reviews/product/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load reviews");
        }
        setReviews(data.reviews || []);
        setReviewsSummary({
          avgRating: data.summary?.avgRating || 0,
          count: data.summary?.count || 0,
        });
      } catch (error) {
        toast.error(error.message || "Failed to load reviews", {
          toastId: "product-reviews",
        });
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      loadReviews();
    }
  }, [apiBase, id]);

  useEffect(() => {
    const loadUserReview = async () => {
      if (!user) {
        setUserReview(null);
        setCanReview(false);
        setReviewEditing(false);
        return;
      }

      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/reviews/product/${id}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load review status");
        }
        setCanReview(Boolean(data.canReview));
        setUserReview(data.review || null);
        if (data.review) {
          setReviewForm({
            rating: data.review.rating || 5,
            comment: data.review.comment || "",
          });
        } else {
          setReviewForm({ rating: 5, comment: "" });
        }
      } catch (error) {
        toast.error(error.message || "Failed to load review status", {
          toastId: "product-review-status",
        });
      }
    };

    if (id) {
      loadUserReview();
    }
  }, [apiBase, id, user]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const formatDateTime = (value) => {
    if (!value) {
      return "--";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      toast.error("Sign in to leave a review.", { toastId: "review-auth" });
      return;
    }
    if (!canReview) {
      toast.error("You need to buy this item before reviewing.", {
        toastId: "review-purchase",
      });
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Add a comment before submitting.", {
        toastId: "review-comment",
      });
      return;
    }

    try {
      setReviewSaving(true);
      const token = localStorage.getItem("remarket_token");
      const endpoint = userReview
        ? `${apiBase}/api/reviews/${userReview.id}`
        : `${apiBase}/api/reviews/product/${id}`;
      const method = userReview ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save review");
      }
      setUserReview(data.review || null);
      setReviewEditing(false);
      setReviews((prev) => {
        const next = prev.filter((review) => review.id !== data.review?.id);
        if (data.review) {
          return [
            {
              ...data.review,
              user: {
                id: user?.id || user?._id,
                name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
                avatarUrl: user?.avatarUrl || "",
              },
            },
            ...next,
          ];
        }
        return next;
      });
      const reviewsResponse = await fetch(
        `${apiBase}/api/reviews/product/${id}`
      );
      const reviewsData = await reviewsResponse.json();
      if (reviewsResponse.ok) {
        setReviews(reviewsData.reviews || []);
        setReviewsSummary({
          avgRating: reviewsData.summary?.avgRating || 0,
          count: reviewsData.summary?.count || 0,
        });
      }
      toast.success("Review saved.", { toastId: "review-saved" });
    } catch (error) {
      toast.error(error.message || "Failed to save review", {
        toastId: "review-save-error",
      });
    } finally {
      setReviewSaving(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!userReview) {
      return;
    }
    const confirmed = window.confirm("Delete your review?");
    if (!confirmed) {
      return;
    }
    try {
      setReviewDeleting(true);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/reviews/${userReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete review");
      }
      setUserReview(null);
      setReviewEditing(false);
      setReviewForm({ rating: 5, comment: "" });
      const reviewsResponse = await fetch(
        `${apiBase}/api/reviews/product/${id}`
      );
      const reviewsData = await reviewsResponse.json();
      if (reviewsResponse.ok) {
        setReviews(reviewsData.reviews || []);
        setReviewsSummary({
          avgRating: reviewsData.summary?.avgRating || 0,
          count: reviewsData.summary?.count || 0,
        });
      }
      toast.success("Review deleted.", { toastId: "review-deleted" });
    } catch (error) {
      toast.error(error.message || "Failed to delete review", {
        toastId: "review-delete-error",
      });
    } finally {
      setReviewDeleting(false);
    }
  };

  const startEditingReview = () => {
    if (!userReview) {
      return;
    }
    setReviewEditing(true);
    setReviewForm({
      rating: userReview.rating || 5,
      comment: userReview.comment || "",
    });
  };

  const cancelEditingReview = () => {
    setReviewEditing(false);
    if (userReview) {
      setReviewForm({
        rating: userReview.rating || 5,
        comment: userReview.comment || "",
      });
    }
  };

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
        <Footer />
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
        <Footer />
      </div>
    </div>
  );
}

  const userId = user?.id || user?._id;
  const sellerId = product.seller?._id || product.seller;
  const isOwner = userId && sellerId && String(userId) === String(sellerId);
  const commissionPercent = Math.round(commissionRate * 1000) / 10;
  const previewQuantity = 1;
  const subtotal = Number((product.price * previewQuantity).toFixed(2));
  const commissionAmount = Number((subtotal * commissionRate).toFixed(2));
  const totalAmount = Number((subtotal + commissionAmount).toFixed(2));
  const isSold = product.status === "sold" || product.quantity <= 0;
  const averageRating = reviewsSummary.avgRating || 0;

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
              <span className="badge product-detail-badge">
                {isSold ? "Sold listing" : "Approved listing"}
              </span>
              <h1 className="product-detail-title">{product.title}</h1>
              <div className="product-detail-meta">
                <span className="product-detail-chip">{product.category}</span>
                <span className="product-detail-chip">
                  {conditionLabels[product.condition] || "Condition"}
                </span>
                {product.location ? (
                  <span className="product-detail-chip">
                    {product.location}
                  </span>
                ) : null}
                <span className="product-detail-chip flex items-center gap-2">
                  <RatingStars value={averageRating} />
                  <span className="text-xs text-[#7a3658]">
                    {reviewsSummary.count
                      ? `${averageRating.toFixed(1)} (${reviewsSummary.count})`
                      : "No reviews"}
                  </span>
                </span>
                {/* <span className="product-detail-chip">
                  {product.negotiable ? "Negotiable" : "Fixed price"}
                </span> */}
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
                    {isSold ? "Sold" : product.quantity ?? "-"}
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

                {isSold ? (
                  <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff1f7] p-4 text-sm text-[#6f3552]">
                    <p className="text-sm font-semibold text-[#4b0f29]">
                      This product is stocked out...
                    </p>
                    <p className="mt-1 text-xs text-[#7a3658]">
                      This listing is sold out and no longer accepting orders.
                    </p>
                  </div>
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

                <div className="product-summary-stack">
                  <div className="detail-card detail-card-compact">
                    <h3 className="section-title">Attributes</h3>
                    {product.attributes?.length ? (
                      <div className="attribute-grid">
                        {product.attributes.map((attr, index) => (
                          <div
                            key={`${attr.key}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-pink-200 px-2 py-1 text-xs font-semibold text-pink-800"
                          >
                            <span>{attr.key}:</span>
                            <span>{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="helper-text">
                        No custom attributes provided.
                      </p>
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

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-6 shadow-[0_18px_32px_rgba(255,88,150,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Reviews
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Buyer feedback
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <RatingStars value={averageRating} />
                  <span className="text-sm font-semibold text-[#4b0f29]">
                    {reviewsSummary.count
                      ? `${averageRating.toFixed(1)} (${reviewsSummary.count})`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {reviewsLoading ? (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    Loading reviews...
                  </div>
                ) : reviews.length ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#4b0f29]">
                            {review.user?.name || "Buyer"}
                          </p>
                          <p className="mt-1 text-xs text-[#7a3658]">
                            {formatDateTime(review.createdAt)}
                          </p>
                        </div>
                        <RatingStars value={review.rating} />
                      </div>
                      <p className="mt-3 text-sm text-[#6f3552]">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    No reviews yet. Be the first to share feedback.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-6 shadow-[0_18px_32px_rgba(255,88,150,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                Your review
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                Share your experience
              </h2>
              <p className="mt-2 text-sm text-[#6f3552]">
                Only verified buyers can leave a review.
              </p>

              {!user ? (
                <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                  Sign in to leave a review.
                </div>
              ) : !canReview ? (
                <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                  Purchase this item to leave a review.
                </div>
              ) : userReview && !reviewEditing ? (
                <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                  <div className="flex items-center justify-between gap-3">
                    <RatingStars value={userReview.rating} />
                    <span className="text-xs text-[#7a3658]">
                      {formatDateTime(userReview.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#6f3552]">
                    {userReview.comment}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-full border border-[#ff6da6]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={startEditingReview}
                    >
                      Edit review
                    </button>
                    <button
                      className="rounded-full bg-gradient-to-r from-[#ff3b6a] to-[#ff6da6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_10px_18px_rgba(255,88,150,0.25)]"
                      type="button"
                      onClick={handleReviewDelete}
                      disabled={reviewDeleting}
                    >
                      {reviewDeleting ? "Deleting..." : "Delete review"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Rating
                    </label>
                    <div className="mt-2">
                      <RatingStars
                        value={reviewForm.rating}
                        onChange={(value) =>
                          setReviewForm((prev) => ({ ...prev, rating: value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Comment
                    </label>
                    <textarea
                      className="mt-2 w-full rounded-2xl border border-[#ff6da6]/25 bg-white/90 p-3 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                      rows="4"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          comment: event.target.value,
                        }))
                      }
                      placeholder="Share details about your purchase."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reviewEditing ? (
                      <button
                        className="rounded-full border border-[#ff6da6]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                        type="button"
                        onClick={cancelEditingReview}
                        disabled={reviewSaving}
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      className="flex-1 rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)] transition hover:translate-y-[-1px]"
                      type="button"
                      onClick={handleReviewSubmit}
                      disabled={reviewSaving}
                    >
                      {reviewSaving
                        ? "Saving..."
                        : reviewEditing
                        ? "Update review"
                        : "Submit review"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetails;
