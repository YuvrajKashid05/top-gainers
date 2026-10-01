import DataTable from "@/components/ui/DataTable.jsx";
import { dateTime, integer, money, percent } from "@/utils/format.js";
const columns = [
  { key: "rank", label: "Rank", render: (r) => `#${r.rank}` },
  { key: "symbol", label: "Symbol", render: (r) => r.tradingSymbol },
  { key: "ltp", label: "LTP", render: (r) => money(r.ltp) },
  {
    key: "changePercent",
    label: "Change %",
    render: (r) => (
      <span className="font-semibold text-emerald-600">
        {percent(r.changePercent)}
      </span>
    ),
  },
  { key: "volume", label: "Volume", render: (r) => integer(r.volume) },
  {
    key: "tradedValue",
    label: "Traded Value",
    render: (r) => money(r.tradedValue),
  },
  { key: "topNAtCapture", label: "Top N", render: (r) => r.topNAtCapture },
  {
    key: "capturedAt",
    label: "Captured",
    render: (r) => dateTime(r.capturedAt),
  },
];
export default function HistoryTable({ rows }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      emptyMessage="No history matches these filters."
    />
  );
}
