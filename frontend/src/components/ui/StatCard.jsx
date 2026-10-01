/** @param {{label: string, value: string, hint?: string, icon?: import('react').ReactNode}} props */
export default function StatCard({ label, value, hint, icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="stat-label">{label}</div>
        {icon}
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
      {hint && (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </div>
      )}
    </div>
  );
}
