'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('ci-theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('ci-theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--bg-primary',    '#f8f9fc');
      root.style.setProperty('--bg-secondary',  '#ffffff');
      root.style.setProperty('--bg-card',       '#ffffff');
      root.style.setProperty('--border',        '#e5e7eb');
      root.style.setProperty('--text-primary',  '#111827');
      root.style.setProperty('--text-muted',    '#6b7280');
      root.style.setProperty('--text-secondary','#374151');
      root.style.setProperty('--accent',        '#6366f1');
      root.style.setProperty('--active-bg',     'rgba(99,102,241,0.1)');
      root.style.setProperty('--active-text',   '#6366f1');
      root.style.setProperty('--hover-bg',      'rgba(0,0,0,0.04)');
    } else {
      root.style.setProperty('--bg-primary',    '#0a0a0f');
      root.style.setProperty('--bg-secondary',  '#111118');
      root.style.setProperty('--bg-card',       '#1a1a26');
      root.style.setProperty('--border',        '#1f2937');
      root.style.setProperty('--text-primary',  '#f9fafb');
      root.style.setProperty('--text-muted',    '#6b7280');
      root.style.setProperty('--text-secondary','#9ca3af');
      root.style.setProperty('--accent',        '#6366f1');
      root.style.setProperty('--active-bg',     'rgba(99,102,241,0.15)');
      root.style.setProperty('--active-text',   '#a5b4fc');
      root.style.setProperty('--hover-bg',      'rgba(255,255,255,0.05)');
    }
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);