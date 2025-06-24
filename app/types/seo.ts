export type SeoMeta = {
  canonicalUrl: string;
};

export function canonicalUrl(url: string, locale: string = 'de') {
  return `${process.env.DOMAIN_URL}${locale === 'de' ? '' : '/' + locale}${url}`;
}
