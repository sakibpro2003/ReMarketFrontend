import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
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
          Your trusted marketplace for pre-owned gems. Buy smart, sell fast, and
          keep value moving.
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
      <span>{new Date().getFullYear()} ReMarket. All rights reserved.</span>
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
);

export default Footer;
