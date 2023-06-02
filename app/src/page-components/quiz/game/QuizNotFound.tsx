import LinkButton from '@/components/LinkButton';
import { Box, Alert } from '@mui/material';

export default function QuizNotFound() {
  return (
    <Box>
      <Alert severity="warning">This quiz does not exist 😮</Alert>
      <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'end' }}>
        <LinkButton hrefObserver="/" navigateOnClick variant="contained">
          Home
        </LinkButton>
      </Box>
    </Box>
  );
}
