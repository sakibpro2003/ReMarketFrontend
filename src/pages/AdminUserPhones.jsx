import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const phonePrefix = "+8801";
const normalizePhoneSuffix = (value) =>
  value.replace(/\D/g, "").slice(0, 9);
const extractPhoneSuffix = (value) => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  const match = trimmed.match(/^\+8801([3-9]\d{8})$/);
  if (match) {
    return match[1];
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("8801") && digits.length >= 13) {
    return digits.slice(4, 13);
  }
  if (digits.startsWith("01") && digits.length >= 11) {
    return digits.slice(2, 11);
  }
  return "";
};
const isValidPhoneSuffix = (value) => /^[3-9]\d{8}$/.test(value);

const AdminUserPhones = () => {
  const [users, setUsers] = useState([]);
  const [phoneEdits, setPhoneEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
        const nextUsers = data.users || [];
        setUsers(nextUsers);
        setPhoneEdits(
          nextUsers.reduce((acc, user) => {
            acc[user._id] = extractPhoneSuffix(user.phone);
            return acc;
          }, {})
        );
      } catch (error) {
        toast.error(error.message || "Failed to load users", {
          toastId: "admin-phones-load"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [apiBase]);

  const filteredUsers = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return users;
    }
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [users, searchTerm]);

  const handlePhoneChange = (userId, value) => {
    setPhoneEdits((prev) => ({
      ...prev,
      [userId]: normalizePhoneSuffix(value)
    }));
  };

  const handleSavePhone = async (user) => {
    const suffix = phoneEdits[user._id] || "";
    if (!isValidPhoneSuffix(suffix)) {
      toast.error("Enter a valid 9-digit phone suffix.", {
        toastId: `admin-phones-invalid-${user._id}`
      });
      return;
    }
    setSavingId(user._id);
    try {
      const token = localStorage.getItem("remarket_token");
      const response = await fetch(
        `${apiBase}/api/admin/users/${user._id}/phone`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ phone: `${phonePrefix}${suffix}` })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update phone number");
      }
      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? data.user : item))
      );
      setPhoneEdits((prev) => ({
        ...prev,
        [user._id]: extractPhoneSuffix(data.user.phone)
      }));
      toast.success("Phone number updated.", {
        toastId: `admin-phones-success-${user._id}`
      });
    } catch (error) {
      toast.error(error.message || "Failed to update phone number", {
        toastId: `admin-phones-error-${user._id}`
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area bg-[#fff8fb] border border-[#ff6da6]/20 shadow-[0_24px_48px_rgba(255,88,150,0.16)]">
            <section className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-6 shadow-[0_24px_48px_rgba(255,88,150,0.2)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6da6]/25 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                    Phonebook
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Manage user phone numbers
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    View all registered numbers and correct them when needed.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 text-sm text-[#6f3552] shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Total users</span>
                    <span className="font-semibold text-[#4b0f29]">
                      {loading ? "--" : users.length}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
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
            </section>

            {loading ? (
              <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 text-sm text-[#6f3552] shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                Loading phone numbers...
              </div>
            ) : filteredUsers.length ? (
              <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                <div className="grid gap-4">
                  {filteredUsers.map((user) => {
                    const suffix = phoneEdits[user._id] || "";
                    return (
                      <div
                        key={user._id}
                        className="flex flex-col gap-4 rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa]/70 p-4 shadow-[0_12px_24px_rgba(255,88,150,0.1)] md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#4b0f29]">
                            {user.firstName || "Unknown"}{" "}
                            {user.lastName || ""}
                          </p>
                          <p className="text-xs text-[#7a3658]">
                            {user.email || "-"}
                          </p>
                          <span className="mt-2 inline-flex items-center rounded-full border border-[#ff6da6]/20 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a12d5d]">
                            {user.role}
                          </span>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                          <div className="flex w-full overflow-hidden rounded-full border border-[#ff6da6]/25 bg-white/90 text-sm text-[#4b0f29] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus-within:ring-2 focus-within:ring-[#ff79c1]/40 md:w-[240px]">
                            <span className="flex items-center border-r border-[#ff6da6]/25 bg-[#fff1f7] px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                              {phonePrefix}
                            </span>
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[3-9][0-9]{8}"
                              maxLength={9}
                              value={suffix}
                              onChange={(event) =>
                                handlePhoneChange(user._id, event.target.value)
                              }
                              placeholder="123456789"
                              className="w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-2 text-sm text-[#4b0f29] placeholder:text-[#b77491] shadow-none focus:border-transparent focus:outline-none focus:ring-0 mt-0"
                            />
                          </div>
                          <button
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff79c1] to-[#ff4f9a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(255,79,154,0.25)]"
                            type="button"
                            onClick={() => handleSavePhone(user)}
                            disabled={savingId === user._id}
                          >
                            {savingId === user._id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 text-center text-sm text-[#6f3552] shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                No users match the current search.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPhones;
