import { translations as daDK } from '../translations/da-DK';

const translations = {
  'da-DK': daDK
};

export type LocaleKey = keyof typeof translations;

export function getTranslations(locale: LocaleKey = 'da-DK') {
  return translations[locale];
}

export function formatPrice(price: number, locale: string = 'da-DK', currency: string = 'DKK'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(price);
}

export function formatDate(date: string | Date, locale: string = 'da-DK'): string {
  return new Intl.DateTimeFormat(locale).format(
    typeof date === 'string' ? new Date(date) : date
  );
}