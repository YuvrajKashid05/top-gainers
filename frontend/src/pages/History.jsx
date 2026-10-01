import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { integer, money, percent, dateTime } from "../utils/format.js";

export default function History() {
  const [filters, setFilters] = useState({
    date: "",
    symbol: "",
    rank: "",
    topN: "",
    page: 1,
    pageSize: 50,
  });
  const [data, setData] = useState({
    rows: [],
    totalPages: 1,
    page: 1,
    total: 0,
  });
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setData(await api.history(filters));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [filters.date, filters.symbol, filters.rank, filters.topN, filters.page]);
  const update = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));

  const exportFile = (format) => {
    window.open(
      api.exportUrl(format, filters),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Saved Top N snapshots retained according to the Settings page.
        </p>
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
        <label className="text-xs font-medium text-slate-500">
          Date
          <input
            type="date"
            value={filters.date}
            onChange={(e) => update("date", e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Symbol
          <input
            placeholder="e.g. SBIN"
            value={filters.symbol}
            onChange={(e) => update("symbol", e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Rank
          <input
            type="number"
            min="1"
            value={filters.rank}
            onChange={(e) => update("rank", e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Top N
          <input
            type="number"
            min="5"
            value={filters.topN}
            onChange={(e) => update("topN", e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            onClick={load}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Search size={15} /> Apply
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-500">
          {data.total.toLocaleString("en-IN")} records
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportFile("csv")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-slate-700"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={() => exportFile("json")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-slate-700"
          >
            <Download size={15} /> JSON
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                {[
                  "Rank",
                  "Symbol",
                  "LTP",
                  "Change %",
                  "Volume",
                  "Traded Value",
                  "Top N",
                  "Captured",
                ].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {data.rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-3">#{row.rank}</td>
                  <td className="px-4 py-3 font-semibold">
                    {row.tradingSymbol}
                  </td>
                  <td className="px-4 py-3">{money(row.ltp)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">
                    {percent(row.changePercent)}
                  </td>
                  <td className="px-4 py-3">{integer(row.volume)}</td>
                  <td className="px-4 py-3">{money(row.tradedValue)}</td>
                  <td className="px-4 py-3">{row.topNAtCapture}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {dateTime(row.capturedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.rows.length && (
            <div className="p-12 text-center text-sm text-slate-500">
              No history matches these filters.
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          disabled={data.page <= 1}
          onClick={() => update("page", data.page - 1)}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {data.page} / {data.totalPages}
        </span>
        <button
          disabled={data.page >= data.totalPages}
          onClick={() => update("page", data.page + 1)}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
