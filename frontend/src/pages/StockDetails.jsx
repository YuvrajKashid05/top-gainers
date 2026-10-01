import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../services/api.js";
import { dateTime, integer, money, number, percent } from "../utils/format.js";

function ChartCard({ title, data, dataKey, suffix = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" hide />
              <YAxis
                domain={["auto", "auto"]}
                width={60}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)}${suffix}`,
                  title,
                ]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                dot={false}
                stroke="currentColor"
                className="text-indigo-500"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            Not enough history yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function StockDetails() {
  const { symbol } = useParams();
  const decoded = decodeURIComponent(symbol || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .symbolHistory(decoded)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [decoded]);
  const rows = data?.rows || [];
  const latest = rows[rows.length - 1];
  const price = rows.map((r, i) => ({ label: i, value: r.ltp }));
  const change = rows.map((r, i) => ({ label: i, value: r.changePercent }));
  const rank = rows.map((r, i) => ({ label: i, value: r.rank }));

  if (error)
    return (
      <div className="rounded-2xl bg-rose-50 p-5 text-rose-700">{error}</div>
    );
  if (!latest)
    return (
      <div className="p-12 text-center">
        <RefreshCw className="mx-auto animate-spin text-indigo-500" />
        <p className="mt-3 text-sm text-slate-500">Loading stock history…</p>
      </div>
    );

  return (
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
          <Metric label="Previous close" value={money(latest.previousClose)} />
          <Metric label="Volume" value={integer(latest.volume)} />
          <Metric label="Traded value" value={money(latest.tradedValue)} />
          <Metric label="Rank" value={`#${latest.rank}`} />
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Historical LTP"
          data={price}
          dataKey="value"
          suffix=""
        />
        <ChartCard
          title="Historical % change"
          data={change}
          dataKey="value"
          suffix="%"
        />
        <ChartCard title="Historical rank" data={rank} dataKey="value" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Capture timestamps</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows
            .slice()
            .reverse()
            .map((row) => (
              <div
                key={row.id}
                className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"
              >
                <div className="font-semibold">
                  Rank #{row.rank} · {percent(row.changePercent)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {dateTime(row.capturedAt)} · LTP {money(row.ltp)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
