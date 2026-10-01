export default function Spinner({ label = 'Loading…' }) { return <div className="empty-state"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>; }
