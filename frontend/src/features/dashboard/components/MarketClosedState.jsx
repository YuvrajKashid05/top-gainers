import { Clock3 } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';
import { MARKET_WINDOW } from '@/config/constants.js';

export default function MarketClosedState() {
  return (
    <Card className="py-12 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-3 text-indigo-200">
          <Clock3 size={24} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold">Market is not opened</h2>
        <p className="mt-2 text-sm text-slate-400">
          NSE market snapshots are collected only from {MARKET_WINDOW.open} to{' '}
          {MARKET_WINDOW.close} IST on trading days.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          No live market data is fetched while the market is closed. Previous snapshots remain available in History.
        </p>
      </div>
    </Card>
  );
}
