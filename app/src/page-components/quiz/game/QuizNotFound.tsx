import HomeButton from '@/components/buttons/HomeButton';
import { Box, Alert } from '@mui/material';

export default function QuizNotFound() {
  return (
    <Box>
      <Alert severity="warning">This quiz does not exist 😮</Alert>
      <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'end' }}>
        <HomeButton />
      </Box>
    </Box>
  );
}
