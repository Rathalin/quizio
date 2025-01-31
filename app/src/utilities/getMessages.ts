import { raise } from './errorHandling';

export async function getMessages(
  locale: string | null | undefined,
  namespaces: (keyof IntlMessages)[],
): Promise<Partial<IntlMessages>> {
  if (locale == null) {
    raise(`Cannot get messages since locale was ${JSON.stringify(locale)}`);
  }
  const defaultNamespaces: (keyof IntlMessages)[] = ['common', 'header', 'footer'];
  const messagesArray = await Promise.all(
    [...defaultNamespaces, ...namespaces].map(async (namespace) => ({
      [namespace]: (await import(`@messages/${locale}/${namespace}.json`)).default,
    })),
  );

  return Object.assign({}, ...messagesArray);
}
