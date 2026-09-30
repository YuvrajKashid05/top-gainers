import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const saved = localStorage.getItem('nse-theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('nse-theme', theme);
    const root = document.documentElement;
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', dark);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', media.matches);
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
