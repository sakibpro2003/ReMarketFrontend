import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar";

const categories = [
  "Phones",
  "Electronics",
  "Furniture",
  "Fashion",
  "Home Appliances"
];

const AdminHomeImages = () => {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      try {
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/home-images`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load images");
        }
        const map = {};
        (data.items || []).forEach((item) => {
          map[item.category] = item.imageUrl;
        });
        setImages(map);
      } catch (error) {
        toast.error(error.message || "Failed to load images", {
          toastId: "home-images-load"
        });
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [apiBase]);

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

  const saveHomeImage = async (category, imageUrl) => {
    const token = localStorage.getItem("remarket_token");
    const response = await fetch(`${apiBase}/api/admin/home-images`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ category, imageUrl })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to save image");
    }

    return data.item;
  };

  const handleFileChange = async (category, event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading((prev) => ({ ...prev, [category]: true }));
    try {
      const uploaded = await uploadImage(file);
      const saved = await saveHomeImage(category, uploaded.url);
      setImages((prev) => ({ ...prev, [category]: saved.imageUrl }));
      toast.success(`${category} image updated.`);
    } catch (error) {
      toast.error(error.message || "Failed to update image", {
        toastId: `home-image-${category}`
      });
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
      event.target.value = "";
    }
  };

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <div className="dashboard-layout">
          <AdminSidebar />

          <main className="content-area">
            <div className="content-header">
              <div>
                <span className="badge">Home Images</span>
                <h1>Homepage category visuals</h1>
                <p className="helper-text">
                  Upload new background images for the category cards.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => {
                const imageUrl = images[category];
                const isUploading = uploading[category];
                const inputId = `home-image-${category.replace(/\s+/g, "-")}`;

                return (
                  <div
                    key={category}
                    className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_18px_36px_rgba(255,88,150,0.16)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                          {category}
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                          Category card
                        </h2>
                      </div>
                      <label
                        htmlFor={inputId}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                      >
                        {isUploading ? "Uploading..." : "Upload image"}
                      </label>
                      <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleFileChange(category, event)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#ff6da6]/20 bg-[#fff1f7]">
                      {loading ? (
                        <div className="grid h-40 place-items-center text-sm text-[#7a3658]">
                          Loading...
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${category} preview`}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-40 place-items-center text-sm text-[#7a3658]">
                          No image uploaded yet.
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-[#7a3658]">
                      Recommended: 900x600 JPG or PNG.
                    </p>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeImages;
