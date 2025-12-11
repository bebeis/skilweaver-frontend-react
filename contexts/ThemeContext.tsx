import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'ocean' | 'cyberpunk' | 'forest' | 'magma';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or default to 'ocean'
    const savedTheme = localStorage.getItem('skillweaver_theme') as Theme;
    return savedTheme || 'ocean';
  });

  useEffect(() => {
    // Update data-theme attribute on document root
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skillweaver_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const themes: { id: Theme; name: string; colors: string[] }[] = [
  { 
    id: 'ocean', 
    name: 'Deep Ocean', 
    colors: ['bg-[#0a0e16]', 'bg-[#38bdf8]', 'bg-[#d8b4fe]'] // Navy, Aqua, Purple
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk City', 
    colors: ['bg-[#0f0518]', 'bg-[#f472b6]', 'bg-[#2dd4bf]'] // Dark Violet, Pink, Cyan
  },
  { 
    id: 'forest', 
    name: 'Midnight Forest', 
    colors: ['bg-[#05110a]', 'bg-[#34d399]', 'bg-[#a3e635]'] // Dark Green, Emerald, Lime
  },
  { 
    id: 'magma', 
    name: 'Obsidian Magma', 
    colors: ['bg-[#0d0d0d]', 'bg-[#fb923c]', 'bg-[#ef4444]'] // Black, Orange, Red
  },
];

