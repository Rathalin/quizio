import { SyntheticEvent, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarMessage, useToastStore } from '@/persistence/taost.store';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

export default function ToastSnackbar() {
  const { snackPack, removeToast } = useToastStore();
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | null>(null);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Display the next message in the queue
      setMessageInfo({ ...snackPack[0] });
      removeToast();
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close the current message if a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open, removeToast]);

  function handleClose(_event: SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  function handleExited() {
    setMessageInfo(null);
  }

  return (
    <Snackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      action={
        <>
          <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </>
      }
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
    >
      <Alert
        onClose={handleClose}
        severity={messageInfo?.severity}
        variant={messageInfo?.variant}
        sx={{ width: '100%' }}
      >
        {messageInfo?.message}
      </Alert>
    </Snackbar>
  );
}
