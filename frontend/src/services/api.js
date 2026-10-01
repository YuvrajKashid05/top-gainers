const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const api = {
  top: () => request("/api/market/top"),
  latest: () => request("/api/market/latest"),
  refresh: () => request("/api/market/refresh", { method: "POST" }),
  status: () => request("/api/market/status"),
  settings: () => request("/api/settings"),
  saveSettings: (settings) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify(settings) }),
  history: (params) =>
    request(
      `/api/market/history?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null))}`,
    ),
  symbolHistory: (symbol) =>
    request(`/api/market/history/${encodeURIComponent(symbol)}`),
  exportUrl: (format, params) =>
    `${API_BASE}/api/market/history/export.${format}?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null))}`,
};
