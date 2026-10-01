import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { integer, money, number, percent, shortTime } from "../utils/format.js";

const columns = [
  ["ltp", "LTP"],
  ["changeValue", "Change"],
  ["changePercent", "Change %"],
  ["volume", "Volume"],
  ["tradedValue", "Traded Value"],
  ["highPrice", "High"],
  ["lowPrice", "Low"],
  ["weekHigh52", "52W High"],
  ["weekLow52", "52W Low"],
];

export default function MarketTable({ rows, sort, setSort }) {
  const navigate = useNavigate();
  const sorted = [...rows].sort((a, b) => {
    if (!sort.key) return 0;
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return (av > bv ? 1 : -1) * (sort.direction === "asc" ? 1 : -1);
  });
  const toggle = (key) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" },
    );
  const SortIcon = ({ active, direction }) =>
    active ? (
      direction === "asc" ? (
        <ArrowUp size={13} />
      ) : (
        <ArrowDown size={13} />
      )
    ) : (
      <ArrowUpDown size={13} />
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-3">Rank</th>
              <th className="px-3 py-3">Symbol</th>
              {columns.map(([key, label]) => (
                <th key={key} className="px-3 py-3">
                  <button
                    onClick={() => toggle(key)}
                    className="flex items-center gap-1 whitespace-nowrap hover:text-indigo-600"
                  >
                    {label}
                    <SortIcon
                      active={sort.key === key}
                      direction={sort.direction}
                    />
                  </button>
                </th>
              ))}
              <th className="px-3 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((row) => (
              <tr
                key={row.token || row.tradingSymbol}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-3 py-3 font-semibold text-slate-500">
                  #{row.rank}
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() =>
                      navigate(
                        `/stock/${encodeURIComponent(row.tradingSymbol)}`,
                      )
                    }
                    className="flex items-center gap-2 font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                  >
                    <span>{row.tradingSymbol}</span>
                    <ExternalLink
                      size={13}
                      className="opacity-0 group-hover:opacity-100"
                    />
                  </button>
                  <div className="text-[11px] text-slate-500">
                    {row.companyName || row.symbol}
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold">{money(row.ltp)}</td>
                <td
                  className={`px-3 py-3 font-medium ${row.changeValue >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {row.changeValue >= 0 ? "+" : ""}
                  {number(row.changeValue)}
                </td>
                <td
                  className={`px-3 py-3 font-bold ${row.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {percent(row.changePercent)}
                </td>
                <td className="px-3 py-3">{integer(row.volume)}</td>
                <td className="px-3 py-3">{money(row.tradedValue)}</td>
                <td className="px-3 py-3">{money(row.highPrice)}</td>
                <td className="px-3 py-3">{money(row.lowPrice)}</td>
                <td className="px-3 py-3">{money(row.weekHigh52)}</td>
                <td className="px-3 py-3">{money(row.weekLow52)}</td>
                <td className="px-3 py-3 text-xs text-slate-500">
                  {shortTime(row.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="p-12 text-center text-sm text-slate-500">
          No market rows available.
        </div>
      )}
    </div>
  );
}
