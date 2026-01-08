import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "frozen", label: "Frozen" },
  { value: "blocked", label: "Blocked" }
];

const sortOptions = [
  { value: "recent", label: "Newest joined" },
  { value: "oldest", label: "Oldest joined" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "last-login", label: "Last login" }
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);
  const [freezeDays, setFreezeDays] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [promoteCandidate, setPromoteCandidate] = useState(null);
  const pageSize = 6;

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load users");
        }

        setUsers(data.users || []);
      } catch (error) {
        toast.error(error.message || "Failed to load users", {
          toastId: "admin-users"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [apiBase]);

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

  const formatCount = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);

  const isUserFrozen = (user) => {
    if (user?.blocked) {
      return false;
    }
    if (!user?.frozenUntil) {
      return false;
    }
    const frozenUntil = new Date(user.frozenUntil);
    return (
      !Number.isNaN(frozenUntil.getTime()) && frozenUntil > new Date()
    );
  };

  const getUserStatus = (user) => {
    if (user?.blocked) {
      return "blocked";
    }
    if (isUserFrozen(user)) {
      return "frozen";
    }
    return "active";
  };

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.role === "admin").length;
    const blocked = users.filter((user) => user.blocked).length;
    const frozen = users.filter((user) => isUserFrozen(user)).length;
    const active = Math.max(total - blocked - frozen, 0);
    return { total, admins, blocked, frozen, active };
  }, [users]);

  const roleOptions = useMemo(() => {
    const roles = Array.from(
      new Set(users.map((user) => user.role).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return [
      { value: "all", label: "All roles" },
      ...roles.map((role) => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1)
      }))
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = users.filter((user) => {
      const matchesSearch = normalizedSearch
        ? [
            user.firstName,
            user.lastName,
            user.email,
            user.phone,
            user.address,
            user.role
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus =
        statusFilter === "all" || getUserStatus(user) === statusFilter;
      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim();
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      const loginA = new Date(a.lastLoginAt).getTime();
      const loginB = new Date(b.lastLoginAt).getTime();
      const safeCreatedA = Number.isNaN(createdA) ? 0 : createdA;
      const safeCreatedB = Number.isNaN(createdB) ? 0 : createdB;
      const safeLoginA = Number.isNaN(loginA) ? 0 : loginA;
      const safeLoginB = Number.isNaN(loginB) ? 0 : loginB;

      switch (sortBy) {
        case "oldest":
          return safeCreatedA - safeCreatedB;
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "last-login":
          return safeLoginB - safeLoginA;
        case "recent":
        default:
          return safeCreatedB - safeCreatedA;
      }
    });

    return sorted;
  }, [users, searchTerm, statusFilter, roleFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, roleFilter, sortBy]);

  const totalResults = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const pageNumbers = (() => {
    const maxButtons = 5;
    const start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  })();
  const pagedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const resultsStart = totalResults ? (page - 1) * pageSize + 1 : 0;
  const resultsEnd = Math.min(page * pageSize, totalResults);
  const hasFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    roleFilter !== "all" ||
    sortBy !== "recent";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortBy("recent");
  };

  const openPromoteConfirm = (user) => {
    setPromoteCandidate(user);
  };

  const closePromoteConfirm = () => {
    setPromoteCandidate(null);
  };

  const handleConfirmPromote = async () => {
    if (!promoteCandidate) {
      return;
    }
    await promoteUser(promoteCandidate);
    setPromoteCandidate(null);
  };

  useEffect(() => {
    if (!loading && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  const toggleBlock = async (user) => {
    if (!user?._id) {
      return;
    }
    setActionUserId(user._id);
    try {
      const token = localStorage.getItem("remarket_token");
      const action = user.blocked ? "unblock" : "block";
      const response = await fetch(
        `${apiBase}/api/admin/users/${user._id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? data.user : item))
      );
      toast.success(
        user.blocked ? "User unblocked successfully." : "User blocked successfully.",
        { toastId: `user-${user._id}-${action}` }
      );
    } catch (error) {
      toast.error(error.message || "Failed to update user", {
        toastId: "admin-users-action"
      });
    } finally {
      setActionUserId(null);
    }
  };

  const promoteUser = async (user) => {
    if (!user?._id) {
      return;
    }
    setActionUserId(user._id);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/users/${user._id}/promote`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to promote user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? data.user : item))
      );
      toast.success("User promoted to admin.", {
        toastId: `user-${user._id}-promote`
      });
    } catch (error) {
      toast.error(error.message || "Failed to promote user", {
        toastId: "admin-users-promote"
      });
    } finally {
      setActionUserId(null);
    }
  };

  const freezeUser = async (user) => {
    if (!user?._id) {
      return;
    }
    const daysValue = Number.parseInt(freezeDays[user._id] || "7", 10);
    if (!Number.isFinite(daysValue) || daysValue < 1) {
      toast.error("Enter a valid number of days to freeze.", {
        toastId: "admin-users-freeze-days"
      });
      return;
    }
    setActionUserId(user._id);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/users/${user._id}/freeze`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ days: daysValue })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to freeze user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? data.user : item))
      );
      toast.success(`User frozen for ${daysValue} day(s).`, {
        toastId: `user-${user._id}-freeze`
      });
    } catch (error) {
      toast.error(error.message || "Failed to freeze user", {
        toastId: "admin-users-freeze"
      });
    } finally {
      setActionUserId(null);
    }
  };

  const unfreezeUser = async (user) => {
    if (!user?._id) {
      return;
    }
    setActionUserId(user._id);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/users/${user._id}/unfreeze`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to unfreeze user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? data.user : item))
      );
      toast.success("User unfrozen successfully.", {
        toastId: `user-${user._id}-unfreeze`
      });
    } catch (error) {
      toast.error(error.message || "Failed to unfreeze user", {
        toastId: "admin-users-unfreeze"
      });
    } finally {
      setActionUserId(null);
    }
  };

  const updateFreezeDays = (userId, value) => {
    setFreezeDays((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

  const loadingCards = Array.from({ length: pageSize }, (_, index) => index);

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
                    Users
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Manage marketplace users
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Review user activity, control access, and keep the community
                    trusted.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Status overview
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Active users</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {loading ? "--" : formatCount(stats.active)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Blocked</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {loading ? "--" : formatCount(stats.blocked)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Frozen</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {loading ? "--" : formatCount(stats.frozen)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Total users", value: stats.total },
                  { label: "Admins", value: stats.admins },
                  { label: "Blocked", value: stats.blocked },
                  { label: "Frozen", value: stats.frozen }
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]"
                  >
                    {item.label}: {loading ? "--" : formatCount(item.value)}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Search and filter
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Find users quickly
                  </h2>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    Search by name, email, phone, or address and sort by activity.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                    Showing {resultsStart}-{resultsEnd} of{" "}
                    {formatCount(totalResults)}
                  </span>
                  {hasFilters ? (
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Search
                  <input
                    className="w-full rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#4b0f29] placeholder:text-[#b16b8b] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Name, email, phone"
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Status
                  <select
                    className="w-full rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Role
                  <select
                    className="w-full rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Sort
                  <select
                    className="w-full rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-sm font-semibold text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {loadingCards.map((index) => (
                  <div
                    key={`user-skeleton-${index}`}
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)] animate-pulse"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#ffe3ef]" />
                        <div className="grid gap-2">
                          <div className="h-4 w-32 rounded-full bg-[#ffe3ef]" />
                          <div className="h-3 w-40 rounded-full bg-[#ffe3ef]" />
                          <div className="h-3 w-24 rounded-full bg-[#ffe3ef]" />
                        </div>
                      </div>
                      <div className="h-6 w-20 rounded-full bg-[#ffe3ef]" />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="h-3 w-28 rounded-full bg-[#ffe3ef]" />
                      <div className="h-3 w-24 rounded-full bg-[#ffe3ef]" />
                      <div className="h-3 w-32 rounded-full bg-[#ffe3ef]" />
                      <div className="h-3 w-48 rounded-full bg-[#ffe3ef]" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="h-8 w-32 rounded-full bg-[#ffe3ef]" />
                      <div className="h-8 w-40 rounded-full bg-[#ffe3ef]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {pagedUsers.map((user) => {
                  const isAdmin = user.role === "admin";
                  const isBlocked = Boolean(user.blocked);
                  const isFrozen = isUserFrozen(user);
                  const statusLabel = isBlocked
                    ? "Blocked"
                    : isFrozen
                    ? "Frozen"
                    : "Active";
                  const statusStyles = isBlocked
                    ? "border-[#ff4f9a]/35 bg-[#ffe2ec] text-[#a12d5d]"
                    : isFrozen
                    ? "border-[#ffb3d6]/60 bg-[#fff2f8] text-[#a12d5d]"
                    : "border-[#ff79c1]/40 bg-white text-[#a12d5d]";
                  const initials =
                    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
                    "U";
                  return (
                    <div
                      key={user._id}
                      className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ff6da6]/20 bg-[#fff1f7] text-base font-semibold text-[#a12d5d]">
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#4b0f29]">
                              {user.firstName || "Unknown"} {user.lastName || ""}
                            </h3>
                            <p className="mt-1 text-xs text-[#7a3658]">
                              {user.email || "-"}
                            </p>
                            <p className="text-xs text-[#7a3658]">
                              {user.phone || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}
                          >
                            {statusLabel}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-[#7a3658]">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-[#7a3658] sm:grid-cols-2">
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                          <span>Joined</span>
                          <span className="font-semibold text-[#4b0f29]">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                          <span>Last login</span>
                          <span className="font-semibold text-[#4b0f29]">
                            {formatDate(user.lastLoginAt)}
                          </span>
                        </div>
                        {isFrozen ? (
                          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2">
                            <span>Frozen until</span>
                            <span className="font-semibold text-[#4b0f29]">
                              {formatDate(user.frozenUntil)}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ff6da6]/15 bg-[#fff5fa] px-3 py-2 sm:col-span-2">
                          <span>Address</span>
                          <span className="font-semibold text-[#4b0f29]">
                            {user.address || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isAdmin ? (
                          <button
                            className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                            type="button"
                            disabled
                          >
                            Admin account
                          </button>
                        ) : (
                          <>
                            <button
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)] transition hover:translate-y-[-1px]"
                              type="button"
                              onClick={() => openPromoteConfirm(user)}
                              disabled={actionUserId === user._id}
                              title="Promote to admin"
                            >
                              Promote admin
                            </button>
                            <div className="flex items-center gap-2">
                              <input
                                className="w-16 rounded-full border border-[#ff6da6]/25 bg-white/90 px-3 py-2 text-xs font-semibold text-[#4b0f29] focus:outline-none focus:ring-2 focus:ring-[#ff79c1]/40"
                                type="number"
                                min="1"
                                max="365"
                                value={freezeDays[user._id] ?? "7"}
                                onChange={(event) =>
                                  updateFreezeDays(user._id, event.target.value)
                                }
                                disabled={actionUserId === user._id}
                                aria-label="Freeze days"
                              />
                              <button
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                                type="button"
                                onClick={() => freezeUser(user)}
                                disabled={actionUserId === user._id}
                              >
                                Freeze
                              </button>
                            </div>
                            {isFrozen ? (
                              <button
                                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                                type="button"
                                onClick={() => unfreezeUser(user)}
                                disabled={actionUserId === user._id}
                              >
                                Unfreeze
                              </button>
                            ) : null}
                            <button
                              className={
                                isBlocked
                                  ? "inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                                  : "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff3b6a] to-[#ff6da6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,88,150,0.25)]"
                              }
                              type="button"
                              onClick={() => toggleBlock(user)}
                              disabled={actionUserId === user._id}
                            >
                              {actionUserId === user._id
                                ? "Updating..."
                                : isBlocked
                                ? "Unblock user"
                                : "Block user"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 text-center shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                <h3 className="text-lg font-semibold text-[#4b0f29]">
                  No users found
                </h3>
                <p className="mt-2 text-sm text-[#6f3552]">
                  {hasFilters
                    ? "No matches for the current filters."
                    : "New users will appear here."}
                </p>
                {hasFilters ? (
                  <button
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            )}

            {filteredUsers.length > 0 && totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center">
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
              </div>
            ) : null}

            {promoteCandidate ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b0c1a]/40 px-4 py-8 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-[28px] border border-[#ff6da6]/25 bg-white/95 p-6 shadow-[0_28px_60px_rgba(255,88,150,0.28)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-[#fff1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                        Confirm action
                      </span>
                      <h2 className="mt-3 text-xl font-semibold text-[#4b0f29]">
                        Promote to admin
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        This grants full admin access and management tools.
                      </p>
                    </div>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#ff6da6]/25 text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closePromoteConfirm}
                      aria-label="Close confirmation"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M6 6l12 12M18 6l-12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#ff6da6]/20 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Selected user</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {`${promoteCandidate.firstName || ""} ${
                          promoteCandidate.lastName || ""
                        }`.trim() || "Unknown user"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span>Email</span>
                      <span className="font-semibold text-[#4b0f29]">
                        {promoteCandidate.email || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      className="flex-1 rounded-full border border-[#ff6da6]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d] transition hover:bg-[#fff1f7]"
                      type="button"
                      onClick={closePromoteConfirm}
                      disabled={actionUserId === promoteCandidate._id}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)] transition hover:translate-y-[-1px]"
                      type="button"
                      onClick={handleConfirmPromote}
                      disabled={actionUserId === promoteCandidate._id}
                    >
                      {actionUserId === promoteCandidate._id
                        ? "Promoting..."
                        : "Confirm promotion"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
