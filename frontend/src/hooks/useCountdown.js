import { useEffect, useState } from "react";

export function useCountdown(startTime, intervalSeconds) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!startTime) return null;
  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(startTime).getTime()) / 1000),
  );
  return Math.max(0, intervalSeconds - elapsed);
}
