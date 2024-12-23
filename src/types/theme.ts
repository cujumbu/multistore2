export type ThemeType = 'bags' | 'pyramids' | 'default';

export interface ThemeConfig {
  type: ThemeType;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  hero: {
    defaultImage?: string;
    pattern?: string;
  };
  components?: {
    productCard?: {
      style: 'minimal' | 'detailed' | 'elegant';
      showQuickView?: boolean;
    };
    navigation?: {
      style: 'simple' | 'detailed';
      position: 'top' | 'left';
    };
  };
}