import { Alert, AlertTitle, Box, Collapse } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function InvalidTokenAlert() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function removeSessionExpiredQueryParam() {
    const { pathname, query } = router;
    delete query.sessionExpired;

    router.replace({
      pathname,
      query,
    });
  }

  return (
    <Collapse in={open}>
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
        <Box>Please log in again.</Box>
      </Alert>
    </Collapse>
  );
}
