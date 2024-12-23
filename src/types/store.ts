export interface Store {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  logo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface StoreSettings {
  id: string;
  store_id: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
    };
  };
  seo_settings: {
    title: string;
    description: string;
    keywords: string[];
  };
  payment_settings: {
    providers: string[];
    currencies: string[];
  };
  shipping_settings: {
    zones: {
      id: string;
      name: string;
      countries: string[];
      rates: {
        type: string;
        price: number;
      }[];
    }[];
  };
  locale_settings: {
    locale: string;
    currency: string;
    numberFormat: {
      decimal: string;
      thousand: string;
      precision: number;
    };
    dateFormat: string;
  };
}