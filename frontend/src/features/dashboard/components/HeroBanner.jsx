import { Settings2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { dateTime } from "@/utils/format.js";
import { MARKET_WINDOW } from "@/config/constants.js";

export default function HeroBanner({ data, countdown, auto, setAuto }) {
  return (
    <section className="hero-banner">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="hero-eyebrow">
            <TrendingUp size={15} aria-hidden="true" /> NSE Equity ·{" "}
            {data?.dataSource || "Angel One SmartAPI"}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            NSE Top {data?.topN ?? "—"} Gainers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100">
            Live NSE equity gainers filtered to stocks trading below ₹
            {data?.minPrice ?? "—"}, ranked by percentage change.
          </p>
        </div>
        <Link to="/settings" className="button button-hero">
          <Settings2 size={16} aria-hidden="true" /> Settings
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-indigo-100">
        <span>Market {data?.marketStatus || "—"}</span>
        <span>Last successful: {dateTime(data?.lastUpdated)}</span>
        <span>
          Next snapshot:{" "}
          {countdown == null
            ? "—"
            : `${Math.floor(countdown / 60)}m ${countdown % 60}s`}
        </span>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={auto}
            onChange={(event) => setAuto(event.target.checked)}
          />{" "}
          Auto sync
        </label>
        <span>
          Snapshots: {MARKET_WINDOW.open}–{MARKET_WINDOW.close} IST
        </span>
      </div>
    </section>
  );
}
