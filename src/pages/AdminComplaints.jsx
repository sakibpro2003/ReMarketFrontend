import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const AdminComplaints = () => {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/complaints`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load complaints");
        }
        setComplaints(data.complaints || []);
      } catch (error) {
        toast.error(error.message || "Failed to load complaints", {
          toastId: "admin-complaints",
        });
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [apiBase]);

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

  const updateDraft = (id, value) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const submitReply = async (complaint) => {
    const reply = (replyDrafts[complaint.id] || "").trim();
    if (!reply) {
      toast.error("Write a reply before sending.", {
        toastId: "admin-complaints-empty",
      });
      return;
    }

    try {
      setReplyingId(complaint.id);
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/complaints/${complaint.id}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reply");
      }

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === complaint.id
            ? {
                ...item,
                status: data.complaint?.status || "replied",
                adminReply: data.complaint?.adminReply
                  ? {
                      ...item.adminReply,
                      ...data.complaint.adminReply,
                    }
                  : item.adminReply,
              }
            : item
        )
      );
      setReplyDrafts((prev) => ({ ...prev, [complaint.id]: "" }));
      toast.success("Reply sent.", { toastId: "admin-complaints-sent" });
    } catch (error) {
      toast.error(error.message || "Failed to send reply", {
        toastId: "admin-complaints-error",
      });
    } finally {
      setReplyingId(null);
    }
  };

  const loadingCards = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]">
            <section className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                    Complaints
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Review and respond to complaints
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Track user issues, review evidence, and respond quickly.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Open cases
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[#4b0f29]">
                    {loading
                      ? "--"
                      : complaints.filter((item) => item.status === "open")
                          .length}
                  </h3>
                  <p className="text-xs text-[#7a3658]">
                    Total: {loading ? "--" : complaints.length}
                  </p>
                </div>
              </div>
            </section>

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {loadingCards.map((index) => (
                  <div
                    key={`complaint-skeleton-${index}`}
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-pulse"
                  >
                    <div className="h-4 w-32 rounded-full bg-[#ffe3ef]" />
                    <div className="mt-3 h-3 w-48 rounded-full bg-[#ffe3ef]" />
                    <div className="mt-4 h-20 rounded-2xl bg-[#ffe3ef]" />
                  </div>
                ))}
              </div>
            ) : complaints.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          {complaint.subject}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          {complaint.user?.name || "User"} •{" "}
                          {complaint.user?.email || "No email"}
                        </h3>
                        <p className="mt-1 text-xs text-[#7a3658]">
                          {formatDateTime(complaint.createdAt)}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                        {complaint.status}
                      </span>
                    </div>

                    {complaint.product ? (
                      <div className="mt-3 text-xs text-[#7a3658]">
                        Product:{" "}
                        <span className="font-semibold text-[#4b0f29]">
                          {complaint.product.title}
                        </span>
                      </div>
                    ) : null}

                    <p className="mt-3 text-sm text-[#6f3552]">
                      {complaint.message}
                    </p>

                    {complaint.imageUrl ? (
                      <a
                        className="mt-4 block overflow-hidden rounded-2xl border border-[#ff6da6]/20"
                        href={complaint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={complaint.imageUrl}
                          alt="Complaint evidence"
                          className="h-44 w-full object-cover"
                        />
                      </a>
                    ) : null}

                    {complaint.adminReply?.message ? (
                      <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          Admin reply
                        </p>
                        <p className="mt-2">{complaint.adminReply.message}</p>
                        <p className="mt-2 text-xs text-[#7a3658]">
                          {formatDateTime(complaint.adminReply.repliedAt)}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Reply
                      </label>
                      <textarea
                        className="mt-2 w-full rounded-2xl border border-[#ff6da6]/25 bg-white/90 p-3 text-sm text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                        rows="3"
                        placeholder="Write your response..."
                        value={replyDrafts[complaint.id] || ""}
                        onChange={(event) =>
                          updateDraft(complaint.id, event.target.value)
                        }
                      />
                      <button
                        className="mt-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)] transition hover:translate-y-[-1px]"
                        type="button"
                        onClick={() => submitReply(complaint)}
                        disabled={replyingId === complaint.id}
                      >
                        {replyingId === complaint.id ? "Sending..." : "Send reply"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 text-center shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                <h3 className="text-lg font-semibold text-[#4b0f29]">
                  No complaints yet
                </h3>
                <p className="mt-2 text-sm text-[#6f3552]">
                  Complaints will appear here when users submit them.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
