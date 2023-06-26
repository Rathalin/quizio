import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

export default function ChangePassword() {
  const {} = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  return (
    <Box>
      <Typography variant="h2">Change password</Typography>
      <form></form>
    </Box>
  );
}
