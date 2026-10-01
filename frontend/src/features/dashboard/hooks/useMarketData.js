import { useCallback, useEffect } from 'react';
import { api } from '@/services/api.js';
import { UI_POLL_INTERVAL_MS } from '@/config/constants.js';
import { useAsync } from '@/hooks/useAsync.js';

export function useMarketData(auto = true) {
  const loader = useCallback(() => api.top(), []);
  const state = useAsync(loader);

  useEffect(() => {
    if (!auto || state.data?.marketOpen === false) return undefined;

    const id = setInterval(state.execute, UI_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [auto, state.data?.marketOpen, state.execute]);

  return state;
}
