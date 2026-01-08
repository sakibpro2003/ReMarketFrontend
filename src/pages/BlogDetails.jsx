import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadBlog = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/blogs/${id}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load blog");
        }
        if (!isActive) {
          return;
        }
        setBlog(data.blog);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Failed to load blog", {
            toastId: "blog-load"
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadBlog();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [apiBase, id]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/blogs/${id}/comments`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load comments");
        }
        if (isActive) {
          setComments(data.comments || []);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Failed to load comments", {
            toastId: "blog-comments"
          });
        }
      } finally {
        if (isActive) {
          setCommentsLoading(false);
        }
      }
    };

    loadComments();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [apiBase, id]);

  useEffect(() => {
    if (!user) {
      setFeedback(null);
      return;
    }

    const loadFeedback = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/blogs/${id}/feedback/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load feedback");
        }
        setFeedback(data.feedback);
      } catch (error) {
        console.error("Failed to load blog feedback", error);
      }
    };

    loadFeedback();
  }, [apiBase, id, user]);

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

  const handleFeedback = async (helpful) => {
    if (!user) {
      toast.info("Sign in to rate this blog.", { toastId: "blog-rate-login" });
      navigate("/login");
      return;
    }
    if (feedbackSubmitting) {
      return;
    }
    try {
      setFeedbackSubmitting(true);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/blogs/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ helpful })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit feedback");
      }
      setFeedback(data.feedback);
      setBlog((prev) =>
        prev
          ? {
              ...prev,
              helpfulCount: data.helpfulCount ?? prev.helpfulCount,
              notHelpfulCount: data.notHelpfulCount ?? prev.notHelpfulCount
            }
          : prev
      );
      toast.success("Thanks for your feedback!", { toastId: "blog-feedback" });
    } catch (error) {
      toast.error(error.message || "Failed to submit feedback", {
        toastId: "blog-feedback-error"
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to comment.", { toastId: "blog-comment-login" });
      navigate("/login");
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error("Write a comment first.", { toastId: "blog-comment-empty" });
      return;
    }
    if (commentSubmitting) {
      return;
    }

    try {
      setCommentSubmitting(true);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/blogs/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: trimmed })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to add comment");
      }
      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
      setBlog((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev
      );
      toast.success("Comment added.", { toastId: "blog-comment-added" });
    } catch (error) {
      toast.error(error.message || "Failed to add comment", {
        toastId: "blog-comment-error"
      });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const helpfulSelected = feedback?.helpful === true;
  const notHelpfulSelected = feedback?.helpful === false;

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

        {loading ? (
          <div className="list-card">
            <h3 className="list-card-title">Loading blog...</h3>
            <p className="helper-text">Fetching the latest story.</p>
          </div>
        ) : blog ? (
          <div className="grid gap-6">
            <section className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                  Blog details
                </span>
                <h1 className="text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a3658]">
                  <span>{blog.author?.name || "ReMarket"}</span>
                  <span>|</span>
                  <span>{formatDate(blog.createdAt)}</span>
                  <span>|</span>
                  <span>{blog.commentCount || 0} comments</span>
                </div>
                {blog.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
              <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                {blog.images?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {blog.images.map((image, index) => (
                      <div
                        key={`${image.url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-[#ff6da6]/15 bg-[#fff1f7]"
                      >
                        <img
                          src={image.url}
                          alt={`Blog image ${index + 1}`}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 whitespace-pre-line text-sm text-[#4b0f29]">
                  {blog.description}
                </div>
              </section>

              <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Helpful rating
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Was this blog useful?
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    <div className="flex items-center justify-between">
                      <span>Helpful</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {blog.helpfulCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Not helpful</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {blog.notHelpfulCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <button
                      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-[0_14px_24px_rgba(255,79,154,0.25)] ${
                        helpfulSelected
                          ? "bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] text-white"
                          : "border border-[#ff6da6]/25 bg-white/85 text-[#a12d5d]"
                      }`}
                      type="button"
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackSubmitting}
                    >
                      {helpfulSelected ? "Marked helpful" : "Helpful"}
                    </button>
                    <button
                      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${
                        notHelpfulSelected
                          ? "bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] text-white"
                          : "border border-[#ff6da6]/25 bg-white/85 text-[#a12d5d]"
                      }`}
                      type="button"
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackSubmitting}
                    >
                      {notHelpfulSelected ? "Marked not helpful" : "Not helpful"}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Want to share your own tips?
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Submit a blog from your dashboard and help other shoppers.
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                    to="/dashboard/blogs"
                  >
                    Write a blog
                  </Link>
                </div>
              </aside>
            </div>

            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Comments
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Reader feedback
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                  {blog.commentCount || 0} total
                </span>
              </div>

              <form className="mt-4 grid gap-3" onSubmit={handleCommentSubmit}>
                <textarea
                  rows="3"
                  placeholder={
                    user
                      ? "Share your thoughts or ask a question..."
                      : "Sign in to leave a comment."
                  }
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  disabled={!user || commentSubmitting}
                  className="w-full rounded-2xl border border-[#ff6da6]/20 bg-white/90 px-4 py-3 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                />
                <button
                  className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                  type="submit"
                  disabled={!user || commentSubmitting}
                >
                  {commentSubmitting ? "Posting..." : "Post comment"}
                </button>
              </form>

              <div className="mt-5 grid gap-3">
                {commentsLoading ? (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    Loading comments...
                  </div>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.12)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#ff6da6]/20 bg-[#ffe5f0] text-xs font-semibold text-[#a12d5d]">
                          {comment.user?.avatarUrl ? (
                            <img
                              src={comment.user.avatarUrl}
                              alt={comment.user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{comment.user?.name?.[0] || "U"}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#4b0f29]">
                            {comment.user?.name || "Reader"}
                          </p>
                          <p className="mt-1 text-xs text-[#7a3658]">
                            {formatDate(comment.createdAt)}
                          </p>
                          <p className="mt-2 text-sm text-[#6f3552]">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    No comments yet. Be the first to share feedback.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="list-card">
            <h3 className="list-card-title">Blog not found</h3>
            <p className="helper-text">
              The blog might be unavailable or still awaiting approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;
