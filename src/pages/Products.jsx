import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const categories = [
  { value: "all", label: "All" },
  { value: "Phones", label: "Phones" },
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Fashion", label: "Fashion" },
  { value: "Home Appliances", label: "Home Appliances" },
  { value: "Books", label: "Books" },
  { value: "Sports", label: "Sports" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Toys", label: "Toys" },
  { value: "Beauty", label: "Beauty" },
  { value: "Other", label: "Other" }
];

const conditions = [
  { value: "all", label: "All conditions" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" }
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" }
];

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5"
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

const RatingStars = ({ value }) => (
  <div className="flex items-center gap-1 text-[#ff4f9a]">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star}>
        <Star filled={star <= Math.round(value || 0)} />
      </span>
    ))}
  </div>
);

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationText, setLocationText] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    const storedPage = Number(window.localStorage.getItem("products_page"));
    return Number.isFinite(storedPage) && storedPage > 0 ? storedPage : 1;
  });
  const [total, setTotal] = useState(0);
  const pageSize = 9;
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const hasMountedRef = useRef(false);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (!location.search) {
      return;
    }
    const params = new URLSearchParams(location.search);
    const rawSearch = params.get("search") || "";
    const rawCategory = params.get("category") || "all";
    const rawLocation = params.get("location") || "";
    const rawCondition = params.get("condition") || "all";
    const rawMinPrice = params.get("minPrice") || "";
    const rawMaxPrice = params.get("maxPrice") || "";
    const rawSort = params.get("sort") || "newest";
    const rawPage = params.get("page");

    const nextCategory = categories.some((option) => option.value === rawCategory)
      ? rawCategory
      : "all";
    const nextCondition = conditions.some((option) => option.value === rawCondition)
      ? rawCondition
      : "all";
    const nextSort = sortOptions.some((option) => option.value === rawSort)
      ? rawSort
      : "newest";
    const nextPage = Number.parseInt(rawPage, 10);

    setSearch(rawSearch);
    setLocationText(rawLocation);
    setCategory(nextCategory);
    setCondition(nextCondition);
    setMinPrice(rawMinPrice);
    setMaxPrice(rawMaxPrice);
    setSort(nextSort);
    if (Number.isFinite(nextPage) && nextPage > 0) {
      setPage(nextPage);
    } else {
      setPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setPage((prev) => (prev === 1 ? prev : 1));
  }, [category, condition, debouncedSearch, locationText, maxPrice, minPrice, sort]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("products_page", String(page));
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        if (locationText.trim()) {
          params.set("location", locationText.trim());
        }
        if (category !== "all") {
          params.set("category", category);
        }
        if (condition !== "all") {
          params.set("condition", condition);
        }
        if (minPrice) {
          params.set("minPrice", minPrice);
        }
        if (maxPrice) {
          params.set("maxPrice", maxPrice);
        }
        if (sort) {
          params.set("sort", sort);
        }
        params.set("page", page);
        params.set("limit", pageSize);

        const response = await fetch(`${apiBase}/api/products?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load products");
        }

        if (!isActive) {
          return;
        }

        setProducts(data.products || []);
        setTotal(typeof data.total === "number" ? data.total : data.count || 0);
        if (typeof data.page === "number" && data.page !== page) {
          setPage(data.page);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Failed to load products", {
            toastId: "products-load"
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    apiBase,
    category,
    condition,
    debouncedSearch,
    locationText,
    maxPrice,
    minPrice,
    page,
    pageSize,
    sort
  ]);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }

    let isActive = true;

    const fetchWishlist = async () => {
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
          const ids = (data.items || [])
            .map((item) => item.product?._id)
            .filter(Boolean);
          setWishlistIds(new Set(ids));
        }
      } catch (error) {
        toast.error(error.message || "Failed to load wishlist", {
          toastId: "wishlist-load"
        });
      }
    };

    fetchWishlist();

    return () => {
      isActive = false;
    };
  }, [apiBase, user]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const categoryLabel =
    categories.find((option) => option.value === category)?.label || "All";
  const locationLabel = locationText.trim()
    ? `Location: ${locationText.trim()}`
    : "Any location";
  const conditionLabel =
    conditions.find((option) => option.value === condition)?.label ||
    "All conditions";
  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ||
    "Newest first";
  const minValue = minPrice ? Number(minPrice) : null;
  const maxValue = maxPrice ? Number(maxPrice) : null;
  const priceLabel =
    minValue !== null && maxValue !== null
      ? `BDT ${formatPrice(minValue)} - ${formatPrice(maxValue)}`
      : minValue !== null
      ? `From BDT ${formatPrice(minValue)}`
      : maxValue !== null
      ? `Up to BDT ${formatPrice(maxValue)}`
      : "Any price";
  const hasFilters =
    debouncedSearch ||
    locationText.trim() ||
    category !== "all" ||
    condition !== "all" ||
    minPrice ||
    maxPrice ||
    sort !== "newest";
  const filterChips = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : "All listings",
    locationLabel,
    category !== "all" ? `Category: ${categoryLabel}` : "All categories",
    condition !== "all" ? `Condition: ${conditionLabel}` : "Any condition",
    priceLabel,
    `Sort: ${sortLabel}`
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = (() => {
    const maxButtons = 5;
    const start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);
    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index
    );
  })();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setLocationText("");
    setCategory("all");
    setCondition("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.info("Sign in to save items", { toastId: "wishlist-login" });
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("remarket_token");
    if (!token) {
      toast.error("Session expired. Please sign in again.", {
        toastId: "wishlist-auth"
      });
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistIds.has(productId);

    try {
      const response = await fetch(`${apiBase}/api/wishlist/${productId}`, {
        method: isWishlisted ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update wishlist");
      }

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
    } catch (error) {
      toast.error(error.message || "Failed to update wishlist", {
        toastId: "wishlist-update"
      });
    }
  };

  const loaderItems = Array.from({ length: pageSize }, (_, index) => index);

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

        <section className="market-hero">
          <div>
            <span className="market-hero-badge">Pink luxe market</span>
            <h1 className="market-hero-title">
              Discover pre-loved pieces with a premium glow.
            </h1>
            <p className="market-hero-text">
              Shop curated listings from trusted sellers. Mix timeless classics
              with modern essentials in a palette that feels effortlessly luxe.
            </p>
            <div className="market-hero-actions">
              <span className="market-hero-stat">
                {loading ? "Loading listings..." : `${total} listings available`}
              </span>
              <span className="market-hero-stat">
                Updated daily by local sellers
              </span>
            </div>
          </div>
          <div className="market-hero-card">
            <div className="market-hero-card-header">
              <div>
                <p className="market-hero-card-title">Filter snapshot</p>
                <p className="helper-text">Tune your results instantly.</p>
              </div>
              {hasFilters ? (
                <button
                  className="ghost-btn market-hero-reset"
                  type="button"
                  onClick={clearFilters}
                >
                  Reset
                </button>
              ) : null}
            </div>
            <div className="market-hero-chips">
              {filterChips.map((chip) => (
                <span key={chip} className="market-chip">
                  {chip}
                </span>
              ))}
            </div>
            <div className="market-hero-footer">
              <span className="helper-text">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </section>

        <div className="products-layout">
          <aside className="products-sidebar">
            <div className="filter-header">
              <h2>Find products</h2>
              <p className="helper-text">Search, filter, and sort listings.</p>
            </div>

            <div className="filter-group">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, tag, or category"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={locationText}
                onChange={(event) => setLocationText(event.target.value)}
                placeholder="City or area"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
              >
                {conditions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price range</label>
              <div className="filter-row-inline">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="ghost-btn" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </aside>

          <main className="products-content">
            <div className="products-header">
              <div>
                <h1>Approved listings</h1>
                <p className="helper-text">
                  {loading
                    ? "Loading listings..."
                    : `${total} listings available`}
                </p>
              </div>
              <div className="products-header-meta">
                <span className="products-header-chip">Sort: {sortLabel}</span>
                <span className="products-header-chip">
                  Page {page} of {totalPages}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="products-loader">
                <div className="products-grid">
                  {loaderItems.map((item) => (
                    <div key={item} className="product-card product-card-skeleton">
                      <div className="skeleton-image" />
                      <div className="product-info">
                        <div className="skeleton-line skeleton-title" />
                        <div className="skeleton-line skeleton-subtitle" />
                        <div className="skeleton-row">
                          <span className="skeleton-line skeleton-price" />
                          <span className="skeleton-line skeleton-location" />
                        </div>
                        <div className="skeleton-button" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="helper-text">Loading listings...</p>
              </div>
            ) : products.length ? (
              <>
                <div className="products-grid">
                  {products.map((product) => {
                    const isSold =
                      product.status === "sold" || product.quantity <= 0;
                    const ratingAverage = product.ratingAverage || 0;
                    const ratingCount = product.ratingCount || 0;
                    return (
                      <div key={product._id} className="product-card">
                      <div className="product-card-media">
                        <button
                          type="button"
                          className={
                            wishlistIds.has(product._id)
                              ? "wishlist-button wishlist-button-active"
                              : "wishlist-button"
                          }
                          onClick={() => toggleWishlist(product._id)}
                          aria-label={
                            wishlistIds.has(product._id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
                        <div className="product-card-overlay">
                          <span className="product-pill">{product.category}</span>
                          <span className="product-pill product-pill-outline">
                            {conditionLabels[product.condition] || "Condition"}
                          </span>
                          {isSold ? (
                            <span className="product-pill bg-[#ff4f9a] text-white">
                              Sold
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="product-info">
                        <div className="product-title-row">
                          <div className="product-title-stack">
                            <h3>{product.title}</h3>
                            <p className="product-subtitle">
                              {product.category} ·{" "}
                              {conditionLabels[product.condition] || "Condition"}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-[#7a3658]">
                              <RatingStars value={ratingAverage} />
                              <span>
                                {ratingCount
                                  ? `${ratingAverage.toFixed(1)} (${ratingCount})`
                                  : "No reviews"}
                              </span>
                            </div>
                          </div>
                          <span className="product-price-tag">
                            BDT {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="product-meta-row">
                          <span className="product-location">{product.location}</span>
                          <span className="product-stock">
                            {isSold ? "Sold out" : `${product.quantity} left`}
                          </span>
                          {product.negotiable ? (
                            <span className="product-chip">Negotiable</span>
                          ) : null}
                        </div>
                        <div className="product-actions">
                          <Link
                            className="secondary-btn button-link"
                            to={`/products/${product._id}`}
                          >
                            View product
                          </Link>
                        </div>
                      </div>
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 ? (
                  <div className="pagination pagination-market">
                    <button
                      className="pagination-btn"
                      type="button"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      Prev
                    </button>
                    <div className="pagination-pages">
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={
                            pageNumber === page
                              ? "pagination-btn pagination-btn-active"
                              : "pagination-btn"
                          }
                          type="button"
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    <button
                      className="pagination-btn"
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                    <span className="pagination-info">
                      Page {page} of {totalPages}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="list-card">
                <h3 className="list-card-title">No products found</h3>
                <p className="helper-text">Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
