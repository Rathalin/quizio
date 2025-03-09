import { useRouter } from 'next/router';

function useLocale() {
  const { locale } = useRouter();
  return locale === 'de' ? 'de-AT' : 'en-GB';
}

export function useDateFormatter() {
  const locale = useLocale();
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
}

export function useDateTimeFormatter() {
  const locale = useLocale();
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
