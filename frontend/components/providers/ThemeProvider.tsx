'use client';

import { createContext, useContext } from 'react';

export type ThemeId = 'chuSa';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  nameEn: string;
  swatches: string[];
  dark: boolean;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'chuSa',
    name: 'Chu Sa',
    nameEn: 'Cinnabar',
    swatches: ['#ffffff', '#f8f8f8', '#8B0000', '#0a0a0a'],
    dark: false,
  },
];

interface ThemeContextValue {
  theme: ThemeId;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'chuSa',
  themes: THEMES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'chuSa', themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
