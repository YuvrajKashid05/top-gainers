import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, History, Settings, Activity } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Activity size={21} />
            </span>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                NSE Market Desk
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Angel One SmartAPI
              </div>
            </div>
          </NavLink>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`
                }
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="hidden rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 sm:block"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7">
        <Outlet />
      </main>
    </div>
  );
}
