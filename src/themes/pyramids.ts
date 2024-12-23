import { ThemeConfig } from '../types/theme';

export const pyramidsTheme: ThemeConfig = {
  type: 'pyramids',
  colors: {
    primary: '#C19A6B',   // Desert sand
    secondary: '#CD853F', // Peru
    accent: '#DAA520'     // Goldenrod
  },
  typography: {
    headingFont: 'Cinzel',
    bodyFont: 'Roboto'
  },
  hero: {
    defaultImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
    pattern: 'egyptian'
  },
  components: {
    productCard: {
      style: 'minimal',
      showQuickView: true
    },
    navigation: {
      style: 'simple',
      position: 'top'
    }
  }
};