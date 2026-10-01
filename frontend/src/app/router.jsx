import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import Spinner from '@/components/ui/Spinner.jsx';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage.jsx'));
const HistoryPage = lazy(() => import('@/features/history/HistoryPage.jsx'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage.jsx'));
const StockDetailsPage = lazy(() => import('@/features/stock/StockDetailsPage.jsx'));

function NotFound() { return <div className="empty-state py-24"><div><h1 className="text-3xl font-bold">404</h1><p className="mt-2">Page not found.</p><a className="mt-4 inline-block text-indigo-600 hover:underline" href="/">Return to dashboard</a></div></div>; }
function Lazy({ children }) { return <Suspense fallback={<Spinner label="Loading page…" />}>{children}</Suspense>; }
const router = createBrowserRouter([{ element: <Layout />, errorElement: <ErrorBoundary><NotFound /></ErrorBoundary>, children: [{ path: '/', element: <Lazy><DashboardPage /></Lazy> }, { path: '/history', element: <Lazy><HistoryPage /></Lazy> }, { path: '/settings', element: <Lazy><SettingsPage /></Lazy> }, { path: '/stock/:symbol', element: <Lazy><StockDetailsPage /></Lazy> }, { path: '/404', element: <NotFound /> }, { path: '*', element: <Navigate to="/404" replace /> }] }]);
export default function AppRouter() { return <ErrorBoundary><RouterProvider router={router} /></ErrorBoundary>; }
