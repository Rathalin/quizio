import { useSessionExpiredDialogStore } from '@/persistence/session-expired-dialog.store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Box from '@mui/material/Box';

export function SessionExpiredDialog() {
  const t = useTranslations('common.error.sessionExpired.dialog');
  const { isSessionExpiredDialogShown, hideSessionExpiredDialog } = useSessionExpiredDialogStore();
  const router = useRouter();

  function handleReload() {
    router.reload();
  }

  return (
    <Dialog
      open={isSessionExpiredDialogShown}
      onClose={hideSessionExpiredDialog}
      aria-labelledby="session-expired-alert-title"
      aria-describedby="session-expired-alert-description"
    >
      <DialogTitle id="session-expired-alert-title" variant="h4">
        {t('title')}
      </DialogTitle>
      <DialogContent id="session-expired-alert-description">
        <Typography>{t('content')}</Typography>
        <Box sx={{ textAlign: 'center', marginTop: 2, borderRadius: 1 }}>
          <Image
            src={'/images/surprised-pikachu.jpg'}
            alt={t('picture.alt')}
            width={156}
            height={150}
            style={{ borderRadius: 'inherit' }}
            unoptimized
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ paddingBottom: 3, paddingInline: 3 }}>
        <Button onClick={handleReload} color="primary" variant="contained" startIcon={<RefreshOutlined />}>
          {t('button.label')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
