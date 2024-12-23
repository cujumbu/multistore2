export const translations = {
  common: {
    loading: 'Indlæser...',
    error: 'Der opstod en fejl',
    retry: 'Prøv igen',
    cancel: 'Annuller',
    save: 'Gem',
    delete: 'Slet',
    edit: 'Rediger',
    back: 'Tilbage',
    close: 'Luk'
  },
  auth: {
    signIn: 'Log ind',
    signInTitle: 'Log ind på din konto',
    signInSubtitle: 'Brug din admin email og adgangskode',
    email: 'Email',
    password: 'Adgangskode',
    invalidCredentials: 'Ugyldig email eller adgangskode. Prøv igen.',
    connectionError: 'Kunne ikke oprette forbindelse til login-tjenesten. Prøv igen.'
  },
  navigation: {
    home: 'Forside',
    products: 'Produkter',
    about: 'Om os',
    contact: 'Kontakt'
  },
  products: {
    addToCart: 'Læg i kurv',
    outOfStock: 'Udsolgt',
    specifications: 'Specifikationer',
    noProducts: 'Ingen produkter tilgængelige.',
    price: 'Pris',
    description: 'Beskrivelse'
  },
  cart: {
    title: 'Indkøbskurv',
    empty: 'Din indkøbskurv er tom',
    total: 'Total',
    checkout: 'Gå til kassen',
    shippingNote: 'Forsendelse og moms beregnes ved kassen',
    remove: 'Fjern',
    quantity: 'Antal'
  },
  admin: {
    dashboard: 'Administrator',
    stores: 'Butikker',
    products: 'Produkter',
    analytics: 'Statistik',
    settings: 'Indstillinger',
    currentStore: 'Nuværende butik',
    newProduct: 'Nyt produkt',
    editProduct: 'Rediger produkt',
    productName: 'Produktnavn',
    productDescription: 'Produktbeskrivelse',
    basePrice: 'Grundpris',
    costPrice: 'Kostpris',
    category: 'Kategori',
    selectCategory: 'Vælg kategori',
    sku: 'Varenummer',
    images: 'Billeder',
    addImage: 'Tilføj billede',
    altText: 'Alternativ tekst (for tilgængelighed)',
    saving: 'Gemmer...'
  },
  settings: {
    storeSettings: 'Butiksindstillinger',
    themeSettings: 'Temaindstillinger',
    localeSettings: 'Sprogindstillinger',
    storeLanguage: 'Butikssprog',
    storeCurrency: 'Butiksvaluta',
    languageHelp: 'Dette vil påvirke sproget i din butik',
    currencyHelp: 'Dette vil påvirke hvordan priser vises i din butik'
  }
} as const;