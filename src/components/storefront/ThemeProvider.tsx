import { createContext, useContext, ReactNode, useEffect } from 'react';
import { ThemeConfig } from '../../types/theme';

interface ThemeContextType {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

interface ThemeProviderProps {
  theme: ThemeConfig;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  // Load theme fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${theme.typography.headingFont.replace(' ', '+')}&family=${theme.typography.bodyFont.replace(' ', '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div style={{ 
        '--font-heading': theme.typography.headingFont,
        '--font-body': theme.typography.bodyFont,
        '--color-primary': theme.colors.primary,
        '--color-secondary': theme.colors.secondary,
        '--color-accent': theme.colors.accent,
      } as any}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}