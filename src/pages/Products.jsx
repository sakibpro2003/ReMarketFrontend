import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const response = await fetch(`${apiBase}/api/products?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load products");
        }

        setProducts(data.products || []);
      } catch (error) {
        toast.error(error.message || "Failed to load products", {
          toastId: "products-load"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiBase, category, condition, debouncedSearch, maxPrice, minPrice, sort]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setCondition("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

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
                    : `${products.length} listings available`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="list-card">
                <h3 className="list-card-title">Fetching products...</h3>
                <p className="helper-text">Hang tight while we load listings.</p>
              </div>
            ) : products.length ? (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
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
                    </div>
                  </div>
                ))}
              </div>
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
