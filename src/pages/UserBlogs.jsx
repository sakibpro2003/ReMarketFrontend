import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserSidebar from "../components/UserSidebar";

const statusLabels = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
};

const statusTone = {
  draft: "border-[#ff6da6]/20 bg-[#fff1f7] text-[#a12d5d]",
  pending: "border-[#ff6da6]/20 bg-[#fff3e6] text-[#a35b00]",
  approved: "border-[#ff6da6]/20 bg-[#eef7f6] text-[#14635e]",
  rejected: "border-[#ff6da6]/20 bg-[#ffecee] text-[#b3362b]"
};

const blogChecklist = [
  "Write a clear title and helpful tags.",
  "Add images that highlight real-world usage.",
  "Submit for approval to publish on the blog feed."
];

const UserBlogs = () => {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const previewUrlsRef = useRef([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: ""
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/blogs/mine`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load blogs");
        }
        setBlogs(data.blogs || []);
      } catch (error) {
        toast.error(error.message || "Failed to load blogs", {
          toastId: "load-blogs-error"
        });
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [apiBase]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const items = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      return { file, preview };
    });

    setSelectedImages((prev) => [...prev, ...items]);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => {
      const item = prev[index];
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== item.preview
        );
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem("remarket_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiBase}/api/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data;
  };

  const uploadSelectedImages = async () => {
    const uploads = [];
    for (const item of selectedImages) {
      const uploaded = await uploadImage(item.file);
      uploads.push(uploaded);
    }
    return uploads;
  };

  const buildPayload = (uploadedImages) => {
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const imagesPayload = (uploadedImages || [])
      .map((img) => ({ url: img.url }))
      .filter((img) => img.url);

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      tags,
      images: imagesPayload,
      status: "pending"
    };
  };

  const clearForm = () => {
    setForm({ title: "", description: "", tags: "" });
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setSelectedImages([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.", {
        toastId: "blog-required"
      });
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImages = selectedImages.length
        ? await uploadSelectedImages()
        : [];
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(`${apiBase}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildPayload(uploadedImages))
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit blog");
      }

      setBlogs((prev) => [data.blog, ...prev]);
      clearForm();
      toast.success("Blog submitted for approval. Admins notified.");
    } catch (error) {
      toast.error(error.message || "Failed to submit blog");
    } finally {
      setSubmitting(false);
    }
  };

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

  const tagList = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const summaryTitle = form.title.trim() || "Untitled blog";
  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]";
  const inputClass =
    "mt-2 w-full rounded-xl border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40";

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <UserSidebar />

          <main className="content-area bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]">
            <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)] animate-[hero-fade_0.5s_ease_both]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                    Blog posts
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Share your pre-loved shopping tips
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Write helpful advice for buyers and sellers. Every blog goes
                    through admin approval before it is published.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/80 px-4 py-2 text-sm font-semibold text-[#a12d5d] shadow-[0_10px_18px_rgba(255,88,150,0.18)]"
                      to="/dashboard"
                    >
                      Back to dashboard
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/blogs"
                    >
                      View public blogs
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Drafting: {tagList.length} tags
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Images: {selectedImages.length}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Blog checklist
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    {blogChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)]">
                <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-[card-rise_0.5s_ease_both]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      New blog
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                      Blog details
                    </h2>
                  </div>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label htmlFor="title" className={labelClass}>
                        Title
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleFormChange}
                        placeholder="e.g. How to spot a genuine refurbished phone"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={labelClass}>
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Share your tips, experience, and advice."
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="tags" className={labelClass}>
                        Tags
                      </label>
                      <input
                        id="tags"
                        name="tags"
                        type="text"
                        value={form.tags}
                        onChange={handleFormChange}
                        placeholder="Separate tags with commas"
                        className={inputClass}
                      />
                      <p className="mt-2 text-xs text-[#7a3658]">
                        Example: tips, pre-owned, authenticity
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Images</label>
                      <div className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-[#ff6da6]/40 bg-white/70 p-4">
                        <input
                          id="blog-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelection}
                          disabled={submitting}
                          className="hidden"
                        />
                        <label
                          htmlFor="blog-images"
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                        >
                          {submitting ? "Uploading..." : "Choose images"}
                        </label>
                        <span className="text-xs text-[#7a3658]">
                          {selectedImages.length} selected
                        </span>
                      </div>
                      {selectedImages.length ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {selectedImages.map((img, index) => (
                            <div
                              key={img.preview}
                              className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-3 shadow-[0_12px_24px_rgba(255,88,150,0.12)]"
                            >
                              <img
                                src={img.preview}
                                alt={`Blog image ${index + 1}`}
                                className="h-32 w-full rounded-xl object-cover"
                              />
                              <button
                                className="mt-3 w-full rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-2 text-xs font-semibold text-[#a12d5d]"
                                type="button"
                                onClick={() => removeImage(index)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                  <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                      Blog summary
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                      {summaryTitle}
                    </h3>
                    <div className="mt-3 grid gap-3 text-sm text-[#6f3552]">
                      <div className="flex items-center justify-between gap-3">
                        <span>Tags</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {tagList.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Images</span>
                        <span className="font-semibold text-[#4b0f29]">
                          {selectedImages.length}
                        </span>
                      </div>
                    </div>
                    {tagList.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tagList.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-[#7a3658]">
                        Add a few tags to help readers find your post.
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                    <h3 className="text-lg font-semibold text-[#4b0f29]">
                      Ready to submit?
                    </h3>
                    <p className="mt-2 text-sm text-[#6f3552]">
                      Admins review blog submissions before they appear publicly.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit for approval"}
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </form>

            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    My posts
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Blog status tracker
                  </h2>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    See which posts are live or awaiting approval.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                  to="/blogs"
                >
                  Browse all blogs
                </Link>
              </div>

              <div className="mt-4 grid gap-4">
                {loading ? (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-4 text-sm text-[#6f3552]">
                    Loading your posts...
                  </div>
                ) : blogs.length ? (
                  blogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.12)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-xl border border-[#ff6da6]/20 bg-[#fff1f7] text-base font-semibold text-[#a12d5d]">
                            {blog.title?.[0] || "B"}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#4b0f29]">
                              {blog.title}
                            </h3>
                            <p className="mt-1 text-xs text-[#7a3658]">
                              Submitted: {formatDate(blog.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                            statusTone[blog.status] ||
                            "border-[#ff6da6]/25 bg-white/85 text-[#a12d5d]"
                          }`}
                        >
                          {statusLabels[blog.status] || blog.status}
                        </span>
                      </div>
                      {blog.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
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
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/90 p-5 text-sm text-[#6f3552]">
                    You have not posted any blogs yet.
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserBlogs;
