import { Search } from "lucide-react";
import Card from "@/components/ui/Card.jsx";
export default function TableToolbar({ topN, search, setSearch, count }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="font-semibold">Top {topN ?? "—"} Gainers</h2>
          <p className="text-xs text-slate-500">
            Sorted by percentage change. The saved Top N setting is applied
            server-side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
              aria-hidden="true"
            />
            <input
              aria-label="Search symbols"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search symbol…"
              className="input w-52 pl-9"
            />
          </div>
          <span className="badge">{count} rows</span>
        </div>
      </div>
    </Card>
  );
}
