import SignInButton from '@/components/buttons/SignInButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { useRouter } from 'next/router';
import { useState } from 'react';

const collapseDuration = 300;

export default function InvalidTokenAlert() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  async function removeSessionExpiredQueryParam() {
    await new Promise((resolve) => setTimeout(resolve, collapseDuration));
    const { pathname, query } = router;
    delete query.sessionExpired;

    router.replace({
      pathname,
      query,
    });
  }

  return (
    <Collapse in={open} timeout={collapseDuration}>
      <Alert
        variant="filled"
        severity="error"
        sx={{ marginBottom: 4 }}
        onClose={() => {
          setOpen(false);
          removeSessionExpiredQueryParam();
        }}
      >
        <AlertTitle>Your session has expired!</AlertTitle>
        <Box>Please sign in again.</Box>
        <Box sx={{ marginBlock: 2 }}>
          <SignInButton color="inherit" />
        </Box>
      </Alert>
    </Collapse>
  );
}
