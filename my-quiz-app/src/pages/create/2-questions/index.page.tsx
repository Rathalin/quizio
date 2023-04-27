import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import QuestionInput from '@/page-components/create/question/QuestionInput';
import { Box, Card, CardContent, Typography, CardActions } from '@mui/material';

export default function CreateQuizQuestionsPage() {
  return (
    <Box>
      <Typography variant="h1">
        <span>Add </span>
        <GradientWord>questions</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          <QuestionInput />
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            margin: 1,
          }}
        >
          <LinkButton
            hrefObserver="/create/1-general"
            navigateOnClick
            variant="outlined"
            iconSide="right"
          >
            Back
          </LinkButton>
          <LinkButton
            hrefObserver="#"
            sx={{ marginLeft: 'auto' }}
            variant="contained"
          >
            Next
          </LinkButton>
        </CardActions>
      </Card>
    </Box>
  );
}
