import deCommon from './src/i18n/messages/de/common.json';

import enCommon from './src/i18n/messages/en/common.json';

type Messages = typeof deCommon & typeof enCommon;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
