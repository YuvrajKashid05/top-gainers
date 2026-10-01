/** @param {{children: import('react').ReactNode, className?: string}} props */
export default function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section>; }
