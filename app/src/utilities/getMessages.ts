import { raise } from './errorHandling';

export async function getMessages(
  locale: string | null | undefined,
  namespaces: (keyof IntlMessages)[],
): Promise<Partial<IntlMessages>> {
  if (!locale) raise(`Cannot get messages: locale is ${JSON.stringify(locale)}`);

  const defaultNamespaces: (keyof IntlMessages)[] = ['common', 'header', 'footer'];
  const allNamespaces = [...defaultNamespaces, ...namespaces];

  const messages = await Promise.all(
    allNamespaces.map(async (namespace) => ({
      [namespace]: (await import(`../i18n/messages/${locale}/${namespace}.json`)).default,
    })),
  );

  return Object.assign({}, ...messages);
}
