import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
];
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[1600px] items-stretch gap-6 px-4 sm:px-6"
      >
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `inline-flex items-center border-b-2 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-indigo-600 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
