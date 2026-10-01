import { dateTime, money, percent } from "@/utils/format.js";
export default function CaptureList({ rows }) {
  return (
    <CardLike>
      <h2 className="mb-3 font-semibold">Capture timestamps</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows
          .slice()
          .reverse()
          .map((row) => (
            <div key={row.id} className="metric-card">
              <div className="font-semibold">
                Rank #{row.rank} · {percent(row.changePercent)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {dateTime(row.capturedAt)} · LTP {money(row.ltp)}
              </div>
            </div>
          ))}
      </div>
    </CardLike>
  );
}
function CardLike({ children }) {
  return <section className="card p-4">{children}</section>;
}
