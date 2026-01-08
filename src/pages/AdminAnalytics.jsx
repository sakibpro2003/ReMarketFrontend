import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const buildMonthRange = (count) => {
  const now = new Date();
  const months = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const label = date.toLocaleDateString("en-GB", { month: "short" });
    months.push({ key, label });
  }
  return months;
};

const buildSmoothPath = (points) => {
  if (points.length < 2) {
    return "";
  }
  const toFixed = (value) => Number(value.toFixed(2));
  let path = `M ${toFixed(points[0].x)} ${toFixed(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] || points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${toFixed(cp1x)} ${toFixed(cp1y)}, ${toFixed(cp2x)} ${toFixed(
      cp2y
    )}, ${toFixed(p2.x)} ${toFixed(p2.y)}`;
  }
  return path;
};

const LineChart = ({ labels, series, secondarySeries }) => {
  const width = 640;
  const height = 240;
  const padding = 28;
  const maxValue = Math.max(
    1,
    ...series,
    ...(secondarySeries || [])
  );
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const step = series.length > 1 ? innerWidth / (series.length - 1) : 0;

  const toPoint = (value, index) => ({
    x: padding + index * step,
    y: padding + (1 - value / maxValue) * innerHeight
  });

  const points = series.map(toPoint);
  const secondaryPoints = secondarySeries
    ? secondarySeries.map(toPoint)
    : [];
  const linePath = buildSmoothPath(points);
  const secondaryPath = secondaryPoints.length
    ? buildSmoothPath(secondaryPoints)
    : "";
  const baseY = height - padding;
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`
    : "";

  const labelStep = labels.length > 6 ? 2 : 1;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff79c1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff79c1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((index) => {
          const y = padding + (innerHeight / 3) * index;
          return (
            <line
              key={y}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#f7c6dc"
              strokeDasharray="4 6"
              strokeWidth="1"
            />
          );
        })}
        {areaPath ? (
          <path d={areaPath} fill="url(#revenue-fill)" />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="#ff4f9a"
            strokeWidth="3"
          />
        ) : null}
        {secondaryPath ? (
          <path
            d={secondaryPath}
            fill="none"
            stroke="#a12d5d"
            strokeWidth="2"
          />
        ) : null}
        {points.map((point) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#ff4f9a"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="mt-3 flex justify-between text-[11px] text-[#7a3658]">
        {labels.map((label, index) => (
          <span key={label} className="min-w-[32px] text-center">
            {index % labelStep === 0 ? label : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ labels, series }) => {
  const height = 160;
  const maxValue = Math.max(1, ...series);
  const labelStep = labels.length > 6 ? 2 : 1;
  return (
    <div>
      <div
        className="grid items-end gap-2"
        style={{
          height,
          gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`
        }}
      >
        {series.map((value, index) => {
          const barHeight = Math.max(8, (value / maxValue) * (height - 20));
          return (
            <div key={`${value}-${index}`} className="flex items-end">
              <div
                className="w-full rounded-xl bg-gradient-to-t from-[#ff4f9a] to-[#ffd0e5]"
                style={{ height: `${barHeight}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-[#7a3658]">
        {labels.map((label, index) => (
          <span key={label} className="min-w-[32px] text-center">
            {index % labelStep === 0 ? label : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ segments, totalLabel }) => {
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffe3ef"
          strokeWidth={strokeWidth}
        />
        {segments.map((segment) => {
          const length = (segment.value / segment.total) * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fontSize="12"
          fill="#7a3658"
        >
          Total
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill="#4b0f29"
        >
          {totalLabel}
        </text>
      </svg>
    </div>
  );
};

const AdminAnalytics = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(6);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("remarket_token");
        const response = await fetch(`${apiBase}/api/admin/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [apiBase]);

  const monthRange = useMemo(() => buildMonthRange(range), [range]);

  const analytics = useMemo(() => {
    const buckets = new Map(
      monthRange.map((month) => [
        month.key,
        { revenue: 0, profit: 0, orders: 0, payouts: 0 }
      ])
    );

    transactions.forEach((item) => {
      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!buckets.has(key)) {
        return;
      }
      const bucket = buckets.get(key);
      bucket.revenue += item.totalAmount || 0;
      bucket.profit += item.commissionAmount || 0;
      bucket.payouts += item.price || 0;
      bucket.orders += 1;
    });

    const revenueSeries = monthRange.map(
      (month) => buckets.get(month.key).revenue
    );
    const profitSeries = monthRange.map(
      (month) => buckets.get(month.key).profit
    );
    const orderSeries = monthRange.map(
      (month) => buckets.get(month.key).orders
    );
    const payoutSeries = monthRange.map(
      (month) => buckets.get(month.key).payouts
    );

    const totalRevenue = revenueSeries.reduce((sum, value) => sum + value, 0);
    const totalProfit = profitSeries.reduce((sum, value) => sum + value, 0);
    const totalPayouts = payoutSeries.reduce((sum, value) => sum + value, 0);
    const totalOrders = orderSeries.reduce((sum, value) => sum + value, 0);
    const margin = totalRevenue
      ? Math.round((totalProfit / totalRevenue) * 100)
      : 0;
    const avgOrderValue = totalOrders
      ? Math.round(totalRevenue / totalOrders)
      : 0;

    return {
      revenueSeries,
      profitSeries,
      orderSeries,
      totalRevenue,
      totalProfit,
      totalPayouts,
      totalOrders,
      margin,
      avgOrderValue
    };
  }, [monthRange, transactions]);

  const hasData = transactions.length > 0;
  const placeholder = useMemo(() => {
    return monthRange.map((_, index) => ({
      revenue: 85000 + index * 12000 + (index % 2) * 4500,
      profit: 12000 + index * 1400 + (index % 3) * 800,
      orders: 24 + index * 4 + (index % 2) * 2
    }));
  }, [monthRange]);

  const revenueSeries = hasData
    ? analytics.revenueSeries
    : placeholder.map((item) => item.revenue);
  const profitSeries = hasData
    ? analytics.profitSeries
    : placeholder.map((item) => item.profit);
  const orderSeries = hasData
    ? analytics.orderSeries
    : placeholder.map((item) => item.orders);

  const totalRevenue = hasData
    ? analytics.totalRevenue
    : placeholder.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = hasData
    ? analytics.totalProfit
    : placeholder.reduce((sum, item) => sum + item.profit, 0);
  const totalOrders = hasData
    ? analytics.totalOrders
    : placeholder.reduce((sum, item) => sum + item.orders, 0);
  const totalPayouts = hasData
    ? analytics.totalPayouts
    : Math.max(totalRevenue - totalProfit, 0);
  const margin = hasData
    ? analytics.margin
    : totalRevenue
    ? Math.round((totalProfit / totalRevenue) * 100)
    : 0;
  const avgOrderValue = hasData
    ? analytics.avgOrderValue
    : totalOrders
    ? Math.round(totalRevenue / totalOrders)
    : 0;

  const trend =
    revenueSeries.length > 1
      ? revenueSeries[revenueSeries.length - 1] -
        revenueSeries[revenueSeries.length - 2]
      : 0;
  const trendDirection = trend > 0 ? "up" : trend < 0 ? "down" : "flat";
  const trendIcon =
    trendDirection === "up" ? (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#ff4f9a]"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 4l6 6h-4v10h-4V10H6l6-6z"
          fill="currentColor"
        />
      </svg>
    ) : trendDirection === "down" ? (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#a12d5d]"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 20l-6-6h4V4h4v10h4l-6 6z"
          fill="currentColor"
        />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#7a3658]"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M4 12h16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-BD").format(Math.round(value || 0));

  const donutSegments = [
    {
      label: "Seller payouts",
      value: totalPayouts,
      color: "#ff79c1"
    },
    {
      label: "Platform profit",
      value: totalProfit,
      color: "#ff4f9a"
    }
  ];
  const donutTotal = donutSegments.reduce((sum, item) => sum + item.value, 0) || 1;
  const donutSegmentsWithTotal = donutSegments.map((segment) => ({
    ...segment,
    total: donutTotal
  }));

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
                    Analytics
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold text-[#4b0f29] md:text-3xl">
                    Revenue and profit trends
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[#6f3552]">
                    Track monthly revenue, platform profit, and order volume with
                    trend curves.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,79,154,0.35)]"
                      to="/admin/commission"
                    >
                      Review commission
                    </Link>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-sm font-semibold text-[#a12d5d]"
                      type="button"
                    >
                      Export report
                    </button>
                  </div>
                  {!hasData ? (
                    <div className="mt-4 inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Sample data shown
                    </div>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/80 p-4 shadow-[0_16px_32px_rgba(255,88,150,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Trend status
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-[#6f3552]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Latest month</span>
                      <span className="font-semibold text-[#4b0f29]">
                        BDT {formatPrice(revenueSeries[revenueSeries.length - 1] || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Direction</span>
                      <span
                        className="inline-flex items-center gap-2 font-semibold text-[#4b0f29]"
                        aria-label={`Trend ${trendDirection}`}
                        title={`Trend ${trendDirection}`}
                      >
                        {trendIcon}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Delta</span>
                      <span className="font-semibold text-[#4b0f29]">
                        BDT {formatPrice(Math.abs(trend))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)]">
              <div className="grid gap-6">
                <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Revenue curve
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        Revenue vs profit
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        View monthly revenue, profit, and the pace of growth.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[6, 12].map((value) => (
                        <button
                          key={value}
                          className={
                            value === range
                              ? "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4f9a] to-[#ff79c1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_12px_22px_rgba(255,79,154,0.3)]"
                              : "inline-flex items-center justify-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a12d5d]"
                          }
                          type="button"
                          onClick={() => setRange(value)}
                        >
                          {value}M
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                    <LineChart
                      labels={monthRange.map((item) => item.label)}
                      series={revenueSeries}
                      secondarySeries={profitSeries}
                    />
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#7a3658]">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff4f9a]" />
                        Revenue
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#a12d5d]" />
                        Profit
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffd0e5]" />
                        Projection range
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-6 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Orders
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        Monthly order volume
                      </h2>
                      <p className="mt-2 text-sm text-[#6f3552]">
                        Track order counts alongside revenue changes.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[#ff6da6]/25 bg-white/85 px-3 py-1 text-xs font-semibold text-[#a12d5d]">
                      Total orders: {totalOrders}
                    </span>
                  </div>
                  <div className="mt-6 rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                    <BarChart
                      labels={monthRange.map((item) => item.label)}
                      series={orderSeries}
                    />
                  </div>
                </section>
              </div>

              <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Key metrics
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-[#fff1f7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Total revenue
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        BDT {formatPrice(totalRevenue)}
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Platform profit
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        BDT {formatPrice(totalProfit)}
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Profit margin
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        {margin}%
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-[#ff6da6]/20 bg-white/95 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                        Avg order
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                        BDT {formatPrice(avgOrderValue)}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ff6da6]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(255,88,150,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3658]">
                    Payout split
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#4b0f29]">
                    Gross distribution
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    See how gross revenue splits between sellers and profit.
                  </p>
                  <div className="mt-4">
                    <DonutChart
                      segments={donutSegmentsWithTotal}
                      totalLabel={`BDT ${formatPrice(totalRevenue)}`}
                    />
                    <div className="mt-4 grid gap-2 text-xs text-[#7a3658]">
                      {donutSegmentsWithTotal.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span>
                            {segment.label}: BDT {formatPrice(segment.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ff6da6]/25 bg-gradient-to-br from-[#fff1f7] via-[#ffe5f0] to-[#fff9fd] p-5 shadow-[0_20px_40px_rgba(255,88,150,0.16)]">
                  <h3 className="text-lg font-semibold text-[#4b0f29]">
                    Analyst notes
                  </h3>
                  <p className="mt-2 text-sm text-[#6f3552]">
                    {loading
                      ? "Loading fresh analytics data..."
                      : "Monitor revenue spikes around new listing approvals."}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-[#6f3552]">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                      <span>Review commission changes with each peak.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff79c1]" />
                      <span>Track payout totals for settlement planning.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff4f9a]" />
                      <span>Compare revenue curves before promotions.</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
