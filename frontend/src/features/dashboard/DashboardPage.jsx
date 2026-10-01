import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Alert from "@/components/ui/Alert.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { REFRESH_INTERVAL_MINUTES } from "@/config/constants.js";
import { useCountdown } from "@/hooks/useCountdown.js";
import { useMarketData } from "./hooks/useMarketData.js";
import HeroBanner from "./components/HeroBanner.jsx";
import StatsGrid from "./components/StatsGrid.jsx";
import TableToolbar from "./components/TableToolbar.jsx";
import MarketTable from "./components/MarketTable.jsx";

export default function DashboardPage() {
  const [auto, setAuto] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "changePercent", direction: "desc" });
  const { data, loading, error } = useMarketData(auto);
  const countdown = useCountdown(
    data?.lastUpdated,
    REFRESH_INTERVAL_MINUTES * 60,
  );
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? (data?.rows || []).filter((row) =>
          `${row.tradingSymbol} ${row.symbol} ${row.companyName || ""}`
            .toLowerCase()
            .includes(query),
        )
      : data?.rows || [];
  }, [data, search]);
  return (
    <div className="space-y-5">
      <HeroBanner
        data={data}
        countdown={countdown}
        auto={auto}
        setAuto={setAuto}
      />
      {error && (
        <Alert>
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold">Market data unavailable</div>
              <div>{error}</div>
              {data?.lastUpdated && (
                <div className="mt-1 text-xs">
                  Showing last successful update.
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}
      {data?.stale && !error && (
        <Alert tone="warning">
          Market data unavailable. Showing last successful update.
        </Alert>
      )}
      <StatsGrid data={data} />
      <TableToolbar
        topN={data?.topN}
        search={search}
        setSearch={setSearch}
        count={filteredRows.length}
      />
      {loading ? (
        <Spinner label="Loading market data…" />
      ) : (
        <MarketTable rows={filteredRows} sort={sort} setSort={setSort} />
      )}
    </div>
  );
}
