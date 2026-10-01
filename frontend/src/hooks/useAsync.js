import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(asyncFunction, { immediate = true } = {}) {
  const mounted = useRef(true);
  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: "",
  });
  const execute = useCallback(
    async (...args) => {
      setState((current) => ({ ...current, loading: true, error: "" }));
      try {
        const data = await asyncFunction(...args);
        if (mounted.current) setState({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        if (mounted.current)
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : "Request failed",
          }));
        return null;
      }
    },
    [asyncFunction],
  );
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);
  return { ...state, execute };
}
