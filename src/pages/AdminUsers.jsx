import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);
  const [freezeDays, setFreezeDays] = useState({});

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

  const loadingCards = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Users</span>
                <h1>Manage marketplace users</h1>
                <p className="helper-text">
                  Block or unblock accounts to prevent unwanted activity.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="list-grid">
                {loadingCards.map((index) => (
                  <div
                    key={`user-skeleton-${index}`}
                    className="list-card list-card-strong list-card-skeleton"
                  >
                    <div className="list-card-header">
                      <div className="list-card-title-row">
                        <div className="list-skeleton-thumb skeleton-block" />
                        <div className="list-card-title-stack">
                          <span className="list-skeleton-title skeleton-block" />
                          <span className="list-skeleton-subtitle skeleton-block" />
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
                      <div>
                        <span className="list-skeleton-meta list-skeleton-meta-wide skeleton-block" />
                      </div>
                    </div>
                    <div className="list-card-body list-card-body-right">
                      <span className="list-skeleton-button skeleton-block" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length ? (
              <div className="list-grid">
                {users.map((user) => {
                  const isAdmin = user.role === "admin";
                  const isBlocked = Boolean(user.blocked);
                  const frozenUntil = user.frozenUntil
                    ? new Date(user.frozenUntil)
                    : null;
                  const isFrozen =
                    !isBlocked &&
                    frozenUntil &&
                    !Number.isNaN(frozenUntil.getTime()) &&
                    frozenUntil > new Date();
                  const statusClass = isBlocked
                    ? "status-blocked"
                    : isFrozen
                    ? "status-frozen"
                    : "status-active";
                  const statusLabel = isBlocked
                    ? "Blocked"
                    : isFrozen
                    ? "Frozen"
                    : "Active";
                  return (
                    <div key={user._id} className="list-card list-card-strong">
                      <div className="list-card-header">
                        <div className="list-card-title-row">
                          <div className="list-card-thumb list-card-thumb-placeholder">
                            <span>{user.firstName?.[0] || "U"}</span>
                          </div>
                          <div>
                            <h3 className="list-card-title">
                              {user.firstName || "Unknown"} {user.lastName || ""}
                            </h3>
                            <p className="helper-text">{user.email || "-"}</p>
                            <p className="helper-text">{user.phone || "-"}</p>
                          </div>
                        </div>
                        <div className="list-card-status-stack">
                          <span
                            className={`status-pill ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                          <span className="list-card-role">{user.role}</span>
                        </div>
                      </div>
                      <div className="list-card-meta">
                        <div>
                          <span className="detail-label">Joined</span>
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                        <div>
                          <span className="detail-label">Last login</span>
                          <span>{formatDate(user.lastLoginAt)}</span>
                        </div>
                        {isFrozen ? (
                          <div>
                            <span className="detail-label">Frozen until</span>
                            <span>{formatDate(user.frozenUntil)}</span>
                          </div>
                        ) : null}
                        <div className="list-card-meta-wide">
                          <span className="detail-label">Address</span>
                          <span>{user.address || "-"}</span>
                        </div>
                      </div>
                      <div className="list-card-body list-card-body-right">
                        {isAdmin ? (
                          <div className="list-card-actions">
                            <button className="secondary-btn" type="button" disabled>
                              Admin account
                            </button>
                          </div>
                        ) : (
                          <div className="list-card-actions">
                            <button
                              className="secondary-btn"
                              type="button"
                              onClick={() => promoteUser(user)}
                              disabled={actionUserId === user._id}
                            >
                              Promote to admin
                            </button>
                            <div className="freeze-controls">
                              <input
                                type="number"
                                min="1"
                                max="365"
                                value={freezeDays[user._id] ?? "7"}
                                onChange={(event) =>
                                  updateFreezeDays(user._id, event.target.value)
                                }
                                disabled={actionUserId === user._id}
                              />
                              <button
                                className="secondary-btn"
                                type="button"
                                onClick={() => freezeUser(user)}
                                disabled={actionUserId === user._id}
                              >
                                Freeze
                              </button>
                            </div>
                            {isFrozen ? (
                              <button
                                className="secondary-btn"
                                type="button"
                                onClick={() => unfreezeUser(user)}
                                disabled={actionUserId === user._id}
                              >
                                Unfreeze
                              </button>
                            ) : null}
                            <button
                              className={isBlocked ? "secondary-btn" : "danger-btn"}
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
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="list-card">
                <h3 className="list-card-title">No users found</h3>
                <p className="helper-text">New users will appear here.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
