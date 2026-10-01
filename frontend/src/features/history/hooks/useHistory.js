import { useCallback, useState } from "react";
import { api } from "@/services/api.js";
import { HISTORY_PAGE_SIZE } from "@/config/constants.js";
import { useAsync } from "@/hooks/useAsync.js";

export function useHistory() {
  const [filters, setFilters] = useState({
    date: "",
    symbol: "",
    rank: "",
    topN: "",
    page: 1,
    pageSize: HISTORY_PAGE_SIZE,
  });
  const loader = useCallback(() => api.history(filters), [filters]);
  const state = useAsync(loader);
  const update = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  return { ...state, filters, update };
}
