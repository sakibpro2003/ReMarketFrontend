import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const Blogs = () => {
  const { user } = useAuth();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 6;
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        params.set("page", page);
        params.set("limit", pageSize);

        const response = await fetch(`${apiBase}/api/blogs?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load blogs");
        }
        if (!isActive) {
          return;
        }
        setBlogs(data.blogs || []);
        setTotal(typeof data.total === "number" ? data.total : 0);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Failed to load blogs", {
            toastId: "blogs-load"
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [apiBase, debouncedSearch, page, pageSize]);

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const truncate = (text, length = 160) => {
    const trimmed = text?.trim() || "";
    if (trimmed.length <= length) {
      return trimmed;
    }
    return `${trimmed.slice(0, length).trim()}...`;
  };

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
            <span className="market-hero-badge">Community knowledge</span>
            <h1 className="market-hero-title">
              ReMarket stories and resale wisdom
            </h1>
            <p className="market-hero-text">
              Read tips from verified sellers and shoppers. Discover how to buy
              smart, resell quickly, and keep pre-loved items moving.
            </p>
            <div className="market-hero-actions">
              <span className="market-hero-stat">
                {loading ? "Loading blogs..." : `${total} posts live`}
              </span>
              <span className="market-hero-stat">Updated weekly</span>
            </div>
          </div>
          <div className="market-hero-card">
            <div className="market-hero-card-header">
              <div>
                <p className="market-hero-card-title">Search blogs</p>
                <p className="helper-text">Find advice by topic.</p>
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="blog-search">Search</label>
              <input
                id="blog-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or tag"
              />
            </div>
          </div>
        </section>

        <main className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#4b0f29]">
                Approved blogs
              </h2>
              <p className="text-sm text-[#6f3552]">
                Browse helpful posts from the ReMarket community.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#7a3658]">
              <span className="inline-flex items-center rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 font-semibold">
                Page {page} of {totalPages}
              </span>
              {debouncedSearch ? (
                <span className="inline-flex items-center rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 font-semibold">
                  Searching: {debouncedSearch}
                </span>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: pageSize }, (_, index) => (
                <div
                  key={`blog-skeleton-${index}`}
                  className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_16px_32px_rgba(255,88,150,0.12)]"
                >
                  <div className="h-36 w-full rounded-2xl bg-[#fff1f7]" />
                  <div className="mt-4 h-4 w-2/3 rounded-full bg-[#ffe1ee]" />
                  <div className="mt-2 h-3 w-5/6 rounded-full bg-[#ffe1ee]" />
                </div>
              ))}
            </div>
          ) : blogs.length ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-5 shadow-[0_16px_32px_rgba(255,88,150,0.12)]"
                  >
                    <div className="overflow-hidden rounded-2xl border border-[#ff6da6]/15 bg-[#fff1f7]">
                      {blog.images?.[0]?.url ? (
                        <img
                          src={blog.images[0].url}
                          alt={blog.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-40 place-items-center text-lg font-semibold text-[#a12d5d]">
                          {blog.title?.[0] || "B"}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid gap-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#7a3658]">
                        <span>{blog.author?.name || "ReMarket"} </span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#4b0f29]">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-[#6f3552]">
                        {truncate(blog.description)}
                      </p>
                      {blog.tags?.length ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {blog.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#7a3658]">
                        <span>
                          Helpful: {blog.helpfulCount} | Not helpful:{" "}
                          {blog.notHelpfulCount}
                        </span>
                        <span>{blog.commentCount} comments</span>
                      </div>
                      <div className="pt-2">
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                          to={`/blogs/${blog.id}`}
                        >
                          Read full story
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
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
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
              <h3 className="list-card-title">No blogs found</h3>
              <p className="helper-text">Try a different search keyword.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Blogs;
