import { Alert, AlertTitle, Box, Collapse } from '@mui/material';
import { useState } from 'react';

export default function InvalidTokenAlert() {
  const [open, setOpen] = useState(true);

  return (
    <Collapse in={open}>
      <Alert
        variant="filled"
        severity="error"
        sx={{ marginBottom: 4 }}
        onClose={() => setOpen(false)}
      >
        <AlertTitle>Your session has expired!</AlertTitle>
        <Box>Please log in again.</Box>
      </Alert>
    </Collapse>
  );
}
