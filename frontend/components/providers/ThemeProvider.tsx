'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'bachLien' | 'sonMai' | 'giayCo' | 'lamNgoc';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  nameEn: string;
  swatches: string[];
  dark: boolean;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'bachLien',
    name: 'Bạch Liên',
    nameEn: 'White Lotus',
    swatches: ['#faf7f0', '#991b1b', '#ca8a04', '#1c1208'],
    dark: false,
  },
  {
    id: 'sonMai',
    name: 'Sơn Mài',
    nameEn: 'Lacquerware',
    swatches: ['#0c0804', '#1a0f08', '#c9963e', '#d4af37'],
    dark: true,
  },
  {
    id: 'giayCo',
    name: 'Giấy Cổ',
    nameEn: 'Ancient Paper',
    swatches: ['#f2e8d0', '#fdf5e4', '#8b3a0f', '#b07820'],
    dark: false,
  },
  {
    id: 'lamNgoc',
    name: 'Lam Ngọc',
    nameEn: 'Jade Night',
    swatches: ['#080c18', '#0f1626', '#0d9488', '#d4af37'],
    dark: true,
  },
];

const STORAGE_KEY = 'giaphaho-theme';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'bachLien',
  setTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('bachLien');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.find((t) => t.id === stored)) {
      applyTheme(stored);
      setThemeState(stored);
    }
  }, []);

  function applyTheme(id: ThemeId) {
    document.documentElement.setAttribute('data-theme', id);
    const def = THEMES.find((t) => t.id === id);
    if (def?.dark) {
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  }

  function setTheme(id: ThemeId) {
    setThemeState(id);
    applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
