/** @param {{children: import('react').ReactNode, tone?: 'error'|'warning'|'success'}} props */
export default function Alert({ children, tone = 'error' }) { return <div role={tone === 'error' ? 'alert' : undefined} className={`alert alert-${tone}`}>{children}</div>; }
