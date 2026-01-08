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
    }
  ];
  const locationButtons = [
    { label: "Dhaka", location: "Dhaka" },
    { label: "Chattogram", location: "Chattogram" },
    { label: "Sylhet", location: "Sylhet" },
    { label: "Rajshahi", location: "Rajshahi" },
    { label: "Khulna", location: "Khulna" },
    { label: "Barishal", location: "Barishal" }
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

  return (
    <div className="page page-stack">
      <div className="app-shell">
        <Navbar />
        <div className="rounded-[28px] border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff2f8] via-[#ffe3ef] to-[#fff9fd] p-8 shadow-[0_24px_48px_rgba(255,88,150,0.2)] overflow-hidden">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <p className="mt-1 text-xs text-white/80">{item.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {locationButtons.map((item) => (
                <Link
                  key={item.location}
                  className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a12d5d] shadow-[0_10px_18px_rgba(255,88,150,0.15)]"
                  to={`/products?location=${encodeURIComponent(item.location)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
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
          <div className="mt-8 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
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
          <div className="mt-8 rounded-3xl border border-[#ff6da6]/20 bg-white/80 p-6 shadow-[0_18px_36px_rgba(255,88,150,0.16)]">
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
