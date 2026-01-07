import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const categories = [
  { value: "all", label: "All" },
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

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 9;
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage((prev) => (prev === 1 ? prev : 1));
  }, [category, condition, debouncedSearch, maxPrice, minPrice, sort]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
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

        const response = await fetch(`${apiBase}/api/products?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load products");
        }

        setProducts(data.products || []);
        setTotal(typeof data.total === "number" ? data.total : data.count || 0);
      } catch (error) {
        toast.error(error.message || "Failed to load products", {
          toastId: "products-load"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiBase, category, condition, debouncedSearch, maxPrice, minPrice, page, pageSize, sort]);

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

  const clearFilters = () => {
    setSearch("");
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
                  {products.map((product) => (
                  <div key={product._id} className="product-card">
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
                    <div className="product-info">
                      <div>
                        <h3>{product.title}</h3>
                        <p className="helper-text">
                          {product.category} ·{" "}
                          {conditionLabels[product.condition] || "Condition"}
                        </p>
                      </div>
                      <div className="product-meta">
                        <span className="product-price">
                          ৳{formatPrice(product.price)}
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
                  ))}
                </div>
                {totalPages > 1 ? (
                  <div className="pagination">
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
