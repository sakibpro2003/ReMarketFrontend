import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    []
  );
  const [imageMap, setImageMap] = useState({});
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [arrivals, setArrivals] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const categoryButtons = [
    {
      title: "Phones",
      subtitle: "Upgrade without the markup",
      category: "Phones",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Electronics",
      subtitle: "Refurbished tech essentials",
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Furniture",
      subtitle: "Curated pieces for every room",
      category: "Furniture",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Fashion",
      subtitle: "Second-hand style refresh",
      category: "Fashion",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Home Appliances",
      subtitle: "Everyday home upgrades",
      category: "Home Appliances",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Books",
      subtitle: "Pre-loved reads and classics",
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
    }
  ];
  const locationButtons = [
    {
      label: "Dhaka",
      location: "Dhaka",
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"
    },
    {
      label: "Chattogram",
      location: "Chattogram",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
    },
    {
      label: "Sylhet",
      location: "Sylhet",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80"
    },
    {
      label: "Rajshahi",
      location: "Rajshahi",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80"
    },
    {
      label: "Khulna",
      location: "Khulna",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
    },
    {
      label: "Barishal",
      location: "Barishal",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    }
  ];
  const testimonials = [
    {
      quote: "Sold my laptop in two days and got paid fast. Smooth process.",
      name: "Afsana Rahman",
      role: "Seller, Dhaka"
    },
    {
      quote: "Found a great phone deal and the condition was exactly as listed.",
      name: "Nayeem Hasan",
      role: "Buyer, Chattogram"
    },
    {
      quote: "The approval system keeps listings clean. I trust the marketplace.",
      name: "Sabina Akter",
      role: "Buyer, Sylhet"
    }
  ];

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch(`${apiBase}/api/home-images`);
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        const map = {};
        (data.items || []).forEach((item) => {
          map[item.category] = item.imageUrl;
        });
        setImageMap(map);
      } catch (error) {
        console.error("Failed to load home images", error);
      }
    };

    loadImages();
  }, [apiBase]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setFeaturedLoading(true);
        const params = new URLSearchParams({
          sort: "price_asc",
          limit: "8",
          page: "1"
        });
        const response = await fetch(
          `${apiBase}/api/products?${params.toString()}`
        );
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        setFeatured(data.products || []);
      } catch (error) {
        console.error("Failed to load featured products", error);
      } finally {
        setFeaturedLoading(false);
      }
    };

    loadFeatured();
  }, [apiBase]);

  useEffect(() => {
    const loadArrivals = async () => {
      try {
        setArrivalsLoading(true);
        const params = new URLSearchParams({
          sort: "newest",
          limit: "6",
          page: "1"
        });
        const response = await fetch(
          `${apiBase}/api/products?${params.toString()}`
        );
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        setArrivals(data.products || []);
      } catch (error) {
        console.error("Failed to load fresh arrivals", error);
      } finally {
        setArrivalsLoading(false);
      }
    };

    loadArrivals();
  }, [apiBase]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(value || 0);
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
  const truncate = (text, length = 110) => {
    const trimmed = text?.trim() || "";
    if (trimmed.length <= length) {
      return trimmed;
    }
    return `${trimmed.slice(0, length).trim()}...`;
  };

  useEffect(() => {
    const loadLatestBlogs = async () => {
      try {
        setBlogsLoading(true);
        const params = new URLSearchParams({
          limit: "4",
          page: "1"
        });
        const response = await fetch(
          `${apiBase}/api/blogs?${params.toString()}`
        );
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        setLatestBlogs(data.blogs || []);
      } catch (error) {
        console.error("Failed to load latest blogs", error);
      } finally {
        setBlogsLoading(false);
      }
    };

    loadLatestBlogs();
  }, [apiBase]);

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <Navbar />
        <div className="rounded-[28px] p-8 overflow-hidden">
          <div className="relative mt-2 overflow-hidden rounded-[30px] border border-[#2b1521]/40 bg-[#1b0b13] p-8 text-white shadow-[0_30px_60px_rgba(38,8,20,0.35)] animate-[hero-fade_0.6s_ease_both]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-70"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=80)"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b0b13]/95 via-[#1b0b13]/80 to-[#3a1024]/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b0b13]/80 via-transparent to-transparent" />
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#ff8fc1]/35 blur-3xl" />
            <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-[#ffc28a]/35 blur-3xl" />
            <div className="relative z-10 grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  Seasonal highlight
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                  Curated resale finds, verified for real life.
                </h2>
                <p className="mt-3 text-sm text-white/80">
                  Buy premium preloved pieces or list your own in minutes. Every
                  item is reviewed before it goes live.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#3a1024] shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
                    to="/products"
                  >
                    Browse deals
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur"
                    to="/dashboard/new"
                  >
                    Create listing
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                    Verified sellers
                  </span>
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                    Admin-reviewed listings
                  </span>
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                    Local handoff ready
                  </span>
                </div>
              </div>
              <div className="grid gap-3 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Why ReMarket
                </p>
                <div className="grid gap-3 text-sm text-white/85">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                    <span>Approved listings for trusted shopping.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ffd19c]" />
                    <span>Local pickups with verified sellers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                    <span>Fast posting with admin approval.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-6">
            <div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Browse marketplace
                </p>
                <h2 className="text-xl font-semibold text-[#4b0f29]">
                  Shop by category
                </h2>
                <p className="text-sm text-[#6f3552]">
                  Explore top collections and filter by location.
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryButtons.map((item) => (
                  <Link
                    key={item.category}
                    className="group relative flex min-h-[160px] w-full flex-col justify-end overflow-hidden rounded-3xl border border-[#ff6da6]/25 bg-[#fff1f7] p-5 text-white shadow-[0_18px_36px_rgba(255,88,150,0.2)] transition hover:-translate-y-0.5"
                    to={`/products?category=${encodeURIComponent(item.category)}`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          imageMap[item.category] || item.image
                        })`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4b0f29]/90 via-[#4b0f29]/45 to-transparent" />
                    <div className="relative z-10">
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="mt-1 text-xs text-white/80">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a3658]">
                  Popular locations
                </p>
                <div className="mt-3 grid grid-cols-6 gap-3">
                  {locationButtons.map((item) => (
                    <Link
                      key={item.location}
                      className="group relative inline-flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#ff6da6]/25 px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#4b0f29] shadow-[0_14px_24px_rgba(255,88,150,0.16)] transition hover:-translate-y-0.5"
                      to={`/products?location=${encodeURIComponent(item.location)}`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/45" />
                      <div className="relative z-10 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-[#ff6da6]/25 bg-white/80 text-[#a12d5d] shadow-[0_8px_14px_rgba(255,88,150,0.16)]">
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            focusable="false"
                            className="h-4 w-4"
                          >
                            <path
                              d="M12 4.5c3.1 0 5.6 2.4 5.6 5.4 0 3.9-3.7 7.1-5.6 9-1.9-1.9-5.6-5.1-5.6-9 0-3 2.5-5.4 5.6-5.4z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <circle
                              cx="12"
                              cy="10"
                              r="2.2"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Curated deals
            </p>
            <h2 className="text-xl font-semibold text-[#4b0f29]">
              Featured picks
            </h2>
            <p className="text-sm text-[#6f3552]">
              Hand-selected listings with standout value.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Featured picks
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                  Best deals today
                </h2>
                <p className="mt-1 text-sm text-[#6f3552]">
                  Hand-picked listings with standout value.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a12d5d]"
                to="/products?sort=price_asc"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
              {featuredLoading
                ? Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={`featured-skeleton-${index}`}
                      className="min-w-[200px] flex-shrink-0 rounded-3xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 sm:min-w-[220px]"
                    >
                      <div className="h-28 w-full rounded-2xl bg-[#ffe3ef]" />
                      <div className="mt-3 h-3 w-3/4 rounded-full bg-[#ffe3ef]" />
                      <div className="mt-2 h-3 w-1/2 rounded-full bg-[#ffe3ef]" />
                    </div>
                  ))
                : featured.map((item) => (
                    <Link
                      key={item._id}
                      className="min-w-[200px] flex-shrink-0 rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.14)] sm:min-w-[220px]"
                      to={`/products/${item._id}`}
                    >
                      <div className="overflow-hidden rounded-2xl border border-[#ff6da6]/15 bg-[#fff1f7]">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="h-28 w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-28 place-items-center text-base font-semibold text-[#a12d5d]">
                            {item.title?.[0] || "P"}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[#4b0f29] truncate">
                            {item.title}
                          </h3>
                          <span className="text-xs font-semibold text-[#a12d5d]">
                            BDT {formatPrice(item.price)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7a3658] truncate">
                          {item.location || "Unknown"} |{" "}
                          {item.category || "Category"}
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
          <div className="mt-8 grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              New drops
            </p>
            <h2 className="text-xl font-semibold text-[#4b0f29]">
              Fresh arrivals
            </h2>
            <p className="text-sm text-[#6f3552]">
              Recently approved listings from verified sellers.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Fresh arrivals
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                  Latest approved listings
                </h2>
                <p className="mt-1 text-sm text-[#6f3552]">
                  New items added by verified sellers.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a12d5d]"
                to="/products?sort=newest"
              >
                Explore all
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {arrivalsLoading
                ? Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`arrival-skeleton-${index}`}
                      className="rounded-3xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4"
                    >
                      <div className="h-32 w-full rounded-2xl bg-[#ffe3ef]" />
                      <div className="mt-3 h-3 w-3/4 rounded-full bg-[#ffe3ef]" />
                      <div className="mt-2 h-3 w-1/2 rounded-full bg-[#ffe3ef]" />
                    </div>
                  ))
                : arrivals.map((item) => (
                    <Link
                      key={item._id}
                      className="rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.14)]"
                      to={`/products/${item._id}`}
                    >
                      <div className="overflow-hidden rounded-2xl border border-[#ff6da6]/15 bg-[#fff1f7]">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="h-32 w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-32 place-items-center text-base font-semibold text-[#a12d5d]">
                            {item.title?.[0] || "P"}
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[#4b0f29] truncate">
                            {item.title}
                          </h3>
                          <span className="text-xs font-semibold text-[#a12d5d]">
                            BDT {formatPrice(item.price)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7a3658] truncate">
                          {item.location || "Unknown"} |{" "}
                          {item.category || "Category"}
                        </p>
                      </div>
                    </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Community insights
            </p>
            <h2 className="text-xl font-semibold text-[#4b0f29]">
              Latest blog posts
            </h2>
            <p className="text-sm text-[#6f3552]">
              Stories and tips from the ReMarket community.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Community blog
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                  Latest stories
                </h2>
                <p className="mt-1 text-sm text-[#6f3552]">
                  Tips and insights from ReMarket sellers and buyers.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a12d5d]"
                to="/blogs"
              >
                View blogs
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {blogsLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={`blog-skeleton-${index}`}
                    className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4"
                  >
                    <div className="h-28 w-full rounded-2xl bg-[#ffe3ef]" />
                    <div className="mt-3 h-3 w-3/4 rounded-full bg-[#ffe3ef]" />
                    <div className="mt-2 h-3 w-1/2 rounded-full bg-[#ffe3ef]" />
                  </div>
                ))
              ) : latestBlogs.length ? (
                latestBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4 shadow-[0_14px_28px_rgba(255,88,150,0.14)]"
                  >
                    <div className="overflow-hidden rounded-2xl border border-[#ff6da6]/15 bg-[#fff1f7]">
                      {blog.images?.[0]?.url ? (
                        <img
                          src={blog.images[0].url}
                          alt={blog.title}
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-28 place-items-center text-base font-semibold text-[#a12d5d]">
                          {blog.title?.[0] || "B"}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#7a3658]">
                        <span>{blog.author?.name || "ReMarket"}</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#4b0f29]">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-[#6f3552]">
                        {truncate(blog.description)}
                      </p>
                      {blog.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#ff6da6]/20 bg-white/85 px-3 py-1 text-[10px] font-semibold text-[#a12d5d]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a12d5d]"
                        to={`/blogs/${blog.id}`}
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#ff6da6]/15 bg-[#fff5fa] p-4 text-sm text-[#6f3552]">
                  No blogs available yet. Check back soon.
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
              Customer voices
            </p>
            <h2 className="text-xl font-semibold text-[#4b0f29]">
              Testimonials
            </h2>
            <p className="text-sm text-[#6f3552]">
              Real feedback from buyers and sellers across Bangladesh.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                Testimonials
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                What buyers and sellers say
              </h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-3xl border border-[#ff6da6]/20 bg-white/95 p-5 shadow-[0_14px_28px_rgba(255,88,150,0.14)]"
                >
                  <p className="text-sm text-[#4b0f29]">"{item.quote}"</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[#4b0f29]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#7a3658]">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <footer className="mt-10 rounded-3xl border border-[#ff6da6]/20 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold text-[#4b0f29]">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#ff4f9a] to-[#ff79c1] text-sm font-bold text-white shadow-[0_12px_20px_rgba(255,79,154,0.3)]">
                    RM
                  </span>
                  ReMarket
                </div>
                <p className="mt-3 text-sm text-[#6f3552]">
                  Your trusted marketplace for pre-owned gems. Buy smart, sell
                  fast, and keep value moving.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Explore
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  <Link className="text-[#a12d5d]" to="/products">
                    Browse products
                  </Link>
                  <Link className="text-[#a12d5d]" to="/blogs">
                    Read community blogs
                  </Link>
                  <Link className="text-[#a12d5d]" to="/dashboard">
                    User dashboard
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                  Support
                </p>
                <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                  <span>Help center: support@remarket.test</span>
                  <span>Hotline: +880 1900 000000</span>
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#ff6da6]/20 pt-4 text-xs text-[#7a3658]">
              <span>© {new Date().getFullYear()} ReMarket. All rights reserved.</span>
              <div className="flex flex-wrap gap-3">
                <Link className="text-[#a12d5d]" to="/terms">
                  Terms
                </Link>
                <Link className="text-[#a12d5d]" to="/privacy">
                  Privacy
                </Link>
                <Link className="text-[#a12d5d]" to="/contact">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Home;
