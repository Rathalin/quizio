import deCommon from '@messages/de/common.json';
import enCommon from '@messages/en/common.json';
import deHeader from '@messages/de/header.json';
import enHeader from '@messages/en/header.json';
import deFooter from '@messages/de/footer.json';
import enFooter from '@messages/en/footer.json';
import deDashboard from '@messages/de/dashboard.json';
import enDashboard from '@messages/en/dashboard.json';
import deImprint from '@messages/de/imprint.json';
import enImprint from '@messages/en/imprint.json';
import deMyProfile from '@messages/de/myProfile.json';
import enMyProfile from '@messages/en/myProfile.json';

type Messages = {
  common: typeof deCommon & typeof enCommon;
  header: typeof deHeader & typeof enHeader;
  footer: typeof deFooter & typeof enFooter;

  dashboard: typeof deDashboard & typeof enDashboard;
  imprint: typeof deImprint & typeof enImprint;
  ['myProfile']: typeof deMyProfile & typeof enMyProfile;
};

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
