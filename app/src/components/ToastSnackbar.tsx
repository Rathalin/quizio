import { SyntheticEvent, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarMessage, useToastStore } from '@/persistence/taost.store';
import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
      autoHideDuration={4000}
      onClose={handleClose}
      slots={{
        transition: SlideTransition,
      }}
      slotProps={{
        transition: {
          onExited: handleExited,
        },
      }}
      action={
        <>
          <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </>
      }
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <Alert
        onClose={handleClose}
        severity={messageInfo?.severity ?? 'info'}
        variant={messageInfo?.variant ?? 'filled'}
        sx={{
          width: '100%',
        }}
      >
        {messageInfo?.content}
      </Alert>
    </Snackbar>
  );
}

function SlideTransition(props: SlideProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return <Slide {...props} direction={isMobile ? 'up' : 'right'} />;
}
