import { useSessionExpiredDialogStore } from '@/persistence/session-expired-dialog.store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';

export function SessionExpiredDialog() {
  const { isSessionExpiredDialogShown: isSessionExpiredAlertShown, hideSessionExpiredDialog: hideSessionExpiredAlert } =
    useSessionExpiredDialogStore();
  const router = useRouter();

  function handleReload() {
    router.reload();
  }

  return (
    <Dialog
      open={isSessionExpiredAlertShown}
      onClose={hideSessionExpiredAlert}
      aria-labelledby="session-expired-alert-title"
      aria-describedby="session-expired-alert-description"
    >
      <DialogTitle id="session-expired-alert-title">Session Expired</DialogTitle>
      <DialogContent id="session-expired-alert-description">
        <Typography>{'Your session has expired! Please reload the page.'}</Typography>
        <Typography sx={{ marginTop: 3, fontSize: '3rem', textAlign: 'center' }}>{'😕'}</Typography>
      </DialogContent>
      <DialogActions sx={{ paddingBottom: 3, paddingInline: 3 }}>
        <Button onClick={handleReload} color="primary" variant="contained" startIcon={<RefreshOutlined />}>
          {'Reload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
