import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';

export default function ChangePassword() {
  const {} = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  return (
    <Box>
      <Typography variant="h2">Change password</Typography>
      <form></form>
    </Box>
  );
}
