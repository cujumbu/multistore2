import { ThemeConfig, ThemeType } from '../types/theme';
import { bagsTheme } from './bags';
import { pyramidsTheme } from './pyramids';

const defaultTheme: ThemeConfig = {
  type: 'default',
  colors: {
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#F59E0B'
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter'
  },
  components: {
    productCard: {
      style: 'minimal',
      showQuickView: false
    },
    navigation: {
      style: 'simple',
      position: 'top'
    }
  }
};

export const themes: Record<ThemeType, ThemeConfig> = {
  default: defaultTheme,
  bags: bagsTheme,
  pyramids: pyramidsTheme
};

export function getThemeByDomain(domain: string): ThemeConfig {
  if (domain.includes('tasker')) return themes.bags;
  if (domain.includes('pyramider')) return themes.pyramids;
  return themes.default;
}