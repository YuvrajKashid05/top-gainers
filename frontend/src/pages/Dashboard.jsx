import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Database, RefreshCw, Search, Settings2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import MarketTable from '../components/MarketTable.jsx';
import StatCard from '../components/StatCard.jsx';
import { dateTime, money, percent } from '../utils/format.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auto, setAuto] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'changePercent', direction: 'desc' });
  const [seconds, setSeconds] = useState(0);

  const load = useCallback(async () => {
    try { const response = await api.top(); setData(response); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [auto, load]);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.rows || [];
    return (data?.rows || []).filter(row => `${row.tradingSymbol} ${row.symbol} ${row.companyName || ''}`.toLowerCase().includes(query));
  }, [data, search]);

  async function manualRefresh() {
    setRefreshing(true); setError('');
    try { await api.refresh(); await load(); setSeconds(0); }
    catch (e) { setError(e.message); }
    finally { setRefreshing(false); }
  }

  const lastUpdateMs = data?.lastUpdated ? Date.now() - new Date(data.lastUpdated).getTime() : null;
  const intervalSeconds = (data?.settings?.refreshInterval || 5) * 60;
  const elapsed = lastUpdateMs !== null ? Math.max(0, Math.floor(lastUpdateMs / 1000)) : 0;
  const countdown = lastUpdateMs !== null ? Math.max(0, intervalSeconds - (elapsed + seconds)) : null;

  return <div className="space-y-5">
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-slate-900 p-5 text-white shadow-xl shadow-indigo-900/10 sm:p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"><TrendingUp size={15} /> NSE Equity · {data?.dataSource || 'Angel One SmartAPI'}</div><h1 className="text-2xl font-bold tracking-tight sm:text-4xl">NSE Top {data?.topN ?? '—'} Gainers</h1><p className="mt-2 max-w-2xl text-sm text-indigo-100">Live NSE equity gainers filtered to stocks trading below ₹{data?.minPrice ?? '—'}, ranked by percentage change.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={manualRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-60"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing…' : 'Refresh market'}</button><Link to="/settings" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15"><Settings2 size={16} /> Settings</Link></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-indigo-100"><span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${data?.marketOpen ? 'bg-emerald-400' : 'bg-amber-300'}`} /> Market {data?.marketStatus || '—'}</span><span>Last successful: {dateTime(data?.lastUpdated)}</span><span>Next refresh: {countdown === null ? '—' : `${Math.floor(countdown / 60)}m ${countdown % 60}s`}</span><label className="inline-flex items-center gap-2"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} /> Auto sync</label></div>
    </section>

    {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div><div className="font-semibold">Market data unavailable</div><div>{error}</div>{data?.lastUpdated && <div className="mt-1 text-xs">Showing last successful update from {dateTime(data.lastUpdated)}.</div>}</div></div>}
    {data?.stale && !error && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">Market data unavailable. Showing last successful update.</div>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Stocks scanned" value={data?.totalStocksScanned?.toLocaleString('en-IN') || '—'} hint="NSE EQ instruments" icon={<Database size={17} />} />
      <StatCard label="Qualifying stocks" value={data?.totalQualifyingStocks?.toLocaleString('en-IN') || '—'} hint={`LTP < ₹${data?.minPrice ?? '—'} and positive change`} icon={<ShieldCheck size={17} />} />
      <StatCard label="Top gain" value={data?.rows?.[0] ? percent(data.rows[0].changePercent) : '—'} hint={data?.rows?.[0]?.tradingSymbol || 'No data'} icon={<TrendingUp size={17} />} />
      <StatCard label="Latest LTP" value={data?.rows?.[0] ? money(data.rows[0].ltp) : '—'} hint={`Top ${data?.topN ?? '—'} selected`} icon={<TrendingUp size={17} />} />
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><h2 className="font-semibold">Top {data?.topN ?? '—'} Gainers</h2><p className="text-xs text-slate-500">Sorted by percentage change. The saved Top N setting is applied server-side.</p></div><div className="flex items-center gap-2"><div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol…" className="w-52 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" /></div><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium dark:bg-slate-800">{filteredRows.length} rows</span></div></div>
    </section>

    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"><RefreshCw className="mx-auto animate-spin text-indigo-500" /><p className="mt-3 text-sm text-slate-500">Loading market data…</p></div> : <MarketTable rows={filteredRows} sort={sort} setSort={setSort} />}
  </div>;
}
