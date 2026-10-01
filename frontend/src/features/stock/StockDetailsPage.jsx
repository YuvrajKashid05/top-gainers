import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { api } from "@/services/api.js";
import { useAsync } from "@/hooks/useAsync.js";
import Spinner from "@/components/ui/Spinner.jsx";
import Alert from "@/components/ui/Alert.jsx";
import MetricCard from "./components/MetricCard.jsx";
import PriceChart from "./components/PriceChart.jsx";
import CaptureList from "./components/CaptureList.jsx";
import { dateTime, integer, money, number, percent } from "@/utils/format.js";
export default function StockDetailsPage() {
  const { symbol } = useParams();
  const decoded = decodeURIComponent(symbol || "");
  const loader = useCallback(() => api.symbolHistory(decoded), [decoded]);
  const { data, error, loading } = useAsync(loader);
  const rows = data?.rows || [];
  const latest = rows[rows.length - 1];
  const charts = useMemo(
    () => ({
      price: rows.map((r, i) => ({ label: i, value: r.ltp })),
      change: rows.map((r, i) => ({ label: i, value: r.changePercent })),
      rank: rows.map((r, i) => ({ label: i, value: r.rank })),
    }),
    [rows],
  );
  if (loading) return <Spinner label="Loading stock history…" />;
  if (error) return <Alert>{error}</Alert>;
  if (!latest)
    return <div className="empty-state py-12">No stock history available.</div>;
  return (
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
      </Link>
      <section className="card p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">
              NSE Equity
            </div>
            <h1 className="mt-1 text-3xl font-bold">{latest.tradingSymbol}</h1>
            <p className="mt-1 text-sm text-slate-500">{latest.symbol}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-bold">{money(latest.ltp)}</div>
            <div className="font-semibold text-emerald-600">
              {percent(latest.changePercent)} · {number(latest.changeValue)}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Previous close"
            value={money(latest.previousClose)}
          />
          <MetricCard label="Volume" value={integer(latest.volume)} />
          <MetricCard label="Traded value" value={money(latest.tradedValue)} />
          <MetricCard label="Rank" value={`#${latest.rank}`} />
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <PriceChart
          title="Historical LTP"
          data={charts.price}
          dataKey="value"
        />
        <PriceChart
          title="Historical % change"
          data={charts.change}
          dataKey="value"
          suffix="%"
        />
        <PriceChart
          title="Historical rank"
          data={charts.rank}
          dataKey="value"
        />
      </div>
      <CaptureList rows={rows} />
      <p className="text-xs text-slate-500">
        Latest capture: {dateTime(latest.capturedAt)}
      </p>
    </div>
  );
}
