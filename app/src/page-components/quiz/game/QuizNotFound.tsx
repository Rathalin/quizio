import HomeButton from '@/components/buttons/HomeButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

export default function QuizNotFound() {
  return (
    <Box>
      <Alert severity="warning">This quiz does not exist 😮</Alert>
      <Box sx={{ marginTop: 4 }}>
        <HomeButton />
      </Box>
    </Box>
  );
}
