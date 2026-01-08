import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" }
];

const statusLabels = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
};

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "all";
    }
    const storedStatus = window.localStorage.getItem("admin_blogs_status");
    const isValid = statusOptions.some((option) => option.value === storedStatus);
    return isValid ? storedStatus : "all";
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    const storedPage = Number(window.localStorage.getItem("admin_blogs_page"));
    return Number.isFinite(storedPage) && storedPage > 0 ? storedPage : 1;
  });
  const [total, setTotal] = useState(0);
  const pageSize = 6;

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("admin_blogs_status", status);
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("admin_blogs_page", String(page));
  }, [page]);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(
          `${apiBase}/api/admin/blogs?status=${status}&page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load blogs");
        }

        setBlogs(data.blogs || []);
        setTotal(data.total || 0);
      } catch (error) {
        toast.error(error.message || "Failed to load blogs", {
          toastId: `admin-blogs-${status}`
        });
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [apiBase, page, pageSize, status]);

  const updateBlogStatus = async (id, action) => {
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/admin/blogs/${id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update blog");
      }
      setBlogs((prev) => {
        const updated = prev.map((blog) =>
          blog._id === data.blog._id ? data.blog : blog
        );
        if (status !== "all" && data.blog.status !== status) {
          return updated.filter((blog) => blog._id !== data.blog._id);
        }
        return updated;
      });
      toast.success(
        action === "approve" ? "Blog approved." : "Blog rejected.",
        { toastId: `blog-${id}-${action}` }
      );
    } catch (error) {
      toast.error(error.message || "Failed to update blog", {
        toastId: `blog-${id}-error`
      });
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const truncate = (text, length = 140) => {
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
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Blogs</span>
                <h1>Review blog submissions</h1>
                <p className="helper-text">
                  Approve or reject community blog posts.
                </p>
              </div>
              <div className="filter-row">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={
                      status === option.value
                        ? "filter-btn filter-btn-active"
                        : "filter-btn"
                    }
                    type="button"
                    onClick={() => {
                      setStatus(option.value);
                      setPage(1);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="list-grid">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={`blog-skeleton-${index}`}
                    className="list-card list-card-strong list-card-skeleton"
                  >
                    <div className="list-card-header">
                      <div className="list-card-title-row">
                        <div className="list-skeleton-thumb skeleton-block" />
                        <div className="list-card-title-stack">
                          <span className="list-skeleton-title skeleton-block" />
                          <span className="list-skeleton-subtitle skeleton-block" />
                        </div>
                      </div>
                      <span className="list-skeleton-pill skeleton-block" />
                    </div>
                    <div className="list-card-meta list-card-meta-skeleton">
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                      <div>
                        <span className="list-skeleton-meta skeleton-block" />
                      </div>
                    </div>
                    <div className="list-card-body">
                      <span className="list-skeleton-price skeleton-block" />
                      <span className="list-skeleton-button skeleton-block" />
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length ? (
              <>
                <div className="list-grid">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="list-card list-card-strong">
                      <div className="list-card-header">
                        <div className="list-card-title-row">
                          {blog.images?.[0]?.url ? (
                            <img
                              src={blog.images[0].url}
                              alt={blog.title}
                              className="list-card-thumb"
                            />
                          ) : (
                            <div className="list-card-thumb list-card-thumb-placeholder">
                              <span>{blog.title?.[0] || "B"}</span>
                            </div>
                          )}
                        <div>
                            <h3 className="list-card-title">{blog.title}</h3>
                            <p className="helper-text">
                              Author:{" "}
                              {blog.author
                                ? `${blog.author.firstName} ${blog.author.lastName}`
                                : "Unknown"}
                            </p>
                            <p className="helper-text">
                              Posted: {formatDate(blog.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`status-pill status-${blog.status}`}>
                          {statusLabels[blog.status] || blog.status}
                        </span>
                      </div>
                      <div className="list-card-meta">
                        <div className="list-card-meta-wide">
                          <span className="detail-label">Summary</span>
                          <span>{truncate(blog.description)}</span>
                        </div>
                        <div className="list-card-tags">
                          <span className="detail-label">Tags</span>
                          <span>{blog.tags?.length ? blog.tags.join(", ") : "None"}</span>
                        </div>
                      </div>
                      <div className="list-card-body">
                        <span className="text-xs text-[#7a3658]">
                          {blog.author?.email || "Author email unavailable"}
                        </span>
                        {blog.status === "pending" ? (
                          <div className="list-card-actions">
                            <button
                              className="secondary-btn"
                              type="button"
                              onClick={() => updateBlogStatus(blog._id, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              className="danger-btn"
                              type="button"
                              onClick={() => updateBlogStatus(blog._id, "reject")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="helper-text">No action required</span>
                        )}
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
                <p className="helper-text">Try another status filter.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;
