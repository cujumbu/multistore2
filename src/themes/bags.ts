import { ThemeConfig } from '../types/theme';

export const bagsTheme: ThemeConfig = {
  type: 'bags',
  colors: {
    primary: '#8B4513',   // Leather brown
    secondary: '#D2691E', // Chocolate
    accent: '#F4A460'     // Sandy brown
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Lato'
  },
  hero: {
    defaultImage: 'https://images.unsplash.com/photo-1547949003-9792a18a2601',
    pattern: 'leather'
  },
  components: {
    productCard: {
      style: 'elegant',
      showQuickView: true
    },
    navigation: {
      style: 'detailed',
      position: 'top'
    }
  }
};