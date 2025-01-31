import deCommon from '@messages/de/common.json';
import enCommon from '@messages/en/common.json';
import deHeader from '@messages/de/header.json';
import enHeader from '@messages/en/header.json';
import deFooter from '@messages/de/footer.json';
import enFooter from '@messages/en/footer.json';
import deImprint from '@messages/de/imprint.json';
import enImprint from '@messages/en/imprint.json';

type Messages = {
  common: typeof deCommon & typeof enCommon;
  header: typeof deHeader & typeof enHeader;
  footer: typeof deFooter & typeof enFooter;

  imprint: typeof deImprint & typeof enImprint;
};

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
