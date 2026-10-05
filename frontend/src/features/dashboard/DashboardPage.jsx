import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Alert from '@/components/ui/Alert.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { dateTime } from '@/utils/format.js';
import { useMarketData } from './hooks/useMarketData.js';
import MarketClosedState from './components/MarketClosedState.jsx';
import MarketTable from './components/MarketTable.jsx';

export default function DashboardPage() {
  const [auto, setAuto] = useState(true);
  const [sort, setSort] = useState({ key: 'changePercent', direction: 'desc' });
  const { data, loading, error } = useMarketData(auto);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Top {data?.topN ?? '—'} Gainers</h1>
          <p className="page-description">
            {data?.marketStatus || 'NSE equity market data'}
            {data?.lastUpdated && ` · Updated ${dateTime(data.lastUpdated)}`}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={auto}
            onChange={(event) => setAuto(event.target.checked)}
          />
          Auto sync
        </label>
      </div>

      {error && (
        <Alert>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold">Market data unavailable</div>
              <div>{error}</div>
              {data?.lastUpdated && (
                <div className="mt-1 text-xs">Showing last successful update.</div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {data?.stale && !error && (
        <Alert tone="warning">Market data unavailable. Showing last successful update.</Alert>
      )}

      {loading && !data ? (
        <Spinner label="Loading market data…" />
      ) : data?.marketOpen === false ? (
        <MarketClosedState />
      ) : (
        <MarketTable rows={data?.rows || []} sort={sort} setSort={setSort} />
      )}
    </div>
  );
}
