export function formatPrice(price: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(price);
}

export function formatDate(date: string | Date, locale: string, format: string): string {
  return new Intl.DateTimeFormat(locale).format(
    typeof date === 'string' ? new Date(date) : date
  );
}