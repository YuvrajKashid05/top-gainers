import { Save, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({ topN: 20, minPrice: 20, historyDays: 5, refreshInterval: 5, theme: 'system' });
  const [status, setStatus] = useState({ loading: true, saving: false, error: '', success: '' });
  useEffect(() => { api.settings().then(r => { setForm(r.settings); if (r.settings.theme) setTheme(r.settings.theme); setStatus(s => ({ ...s, loading: false })); }).catch(e => setStatus({ loading: false, saving: false, error: e.message, success: '' })); }, []);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  async function save(e) {
    e.preventDefault(); setStatus(s => ({ ...s, saving: true, error: '', success: '' }));
    try { const result = await api.saveSettings({ ...form, topN: Number(form.topN), minPrice: Number(form.minPrice), historyDays: Number(form.historyDays), refreshInterval: Number(form.refreshInterval), theme: form.theme }); setForm(result.settings); setTheme(result.settings.theme); let refreshNote = 'The next scheduled market refresh will use the new configuration.'; try { const refresh = await api.refresh(); if (refresh.ok) refreshNote = 'Settings saved and the dashboard was refreshed with the new configuration.'; } catch { refreshNote = 'Settings saved. The next scheduled market refresh will use the new configuration.'; } setStatus({ loading: false, saving: false, error: '', success: refreshNote }); }
    catch (e2) { setStatus(s => ({ ...s, saving: false, error: e2.message, success: '' })); }
  }
  if (status.loading) return <div className="p-12 text-center text-sm text-slate-500">Loading settings…</div>;
  return <div className="mx-auto max-w-3xl space-y-5"><div><div className="mb-2 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><Settings2 size={20} /></div><h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-sm text-slate-500">These values are persisted in SQLite and used dynamically by the backend.</p></div>
    <form onSubmit={save} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <Field label="Top Gainers Count" help="Minimum 5, maximum 100. This is the number saved and displayed by the backend."><input type="number" min="5" max="100" required value={form.topN} onChange={e => set('topN', e.target.value)} className="input" /></Field>
      <div className="flex flex-wrap gap-2">{[10, 20, 30, 50, 100].map(n => <button type="button" key={n} onClick={() => set('topN', n)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${Number(form.topN) === n ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40' : 'dark:border-slate-700'}`}>Top {n}</button>)}</div>
      <Field label="Under-price threshold (₹)" help="Stocks qualify when current LTP is below this value. Default 20 reproduces the Securities < ₹20 concept."><input type="number" min="0" step="0.01" required value={form.minPrice} onChange={e => set('minPrice', e.target.value)} className="input" /></Field>
      <Field label="History retention (days)" help="1 to 30 days."><input type="number" min="1" max="30" required value={form.historyDays} onChange={e => set('historyDays', e.target.value)} className="input" /></Field>
      <Field label="Refresh interval" help="Scheduler interval during NSE market hours."><select value={form.refreshInterval} onChange={e => set('refreshInterval', e.target.value)} className="input">{[1, 5, 10, 15].map(v => <option key={v} value={v}>{v} minutes</option>)}</select></Field>
      <Field label="Market session" help="Fixed to NSE equity cash market; instrument selection uses Angel's NSE -EQ master records."><div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">NSE</div><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">EQ only</div></div></Field>
      <Field label="Theme"><select value={form.theme || theme} onChange={e => set('theme', e.target.value)} className="input">{['system','light','dark'].map(v => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}</select></Field>
      {status.error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{status.error}</div>}
      {status.success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{status.success}</div>}
      <button disabled={status.saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} /> {status.saving ? 'Saving…' : 'Save settings'}</button>
    </form>
  </div>;
}
function Field({ label, help, children }) { return <label className="block"><div className="text-sm font-semibold">{label}</div>{help && <div className="mt-1 text-xs text-slate-500">{help}</div>}<div className="mt-2">{children}</div></label>; }
