import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
export default function Layout() { return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"><Header /><main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7"><Outlet /></main></div>; }
