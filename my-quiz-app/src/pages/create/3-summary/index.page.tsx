import GradientWord from '@/components/GradientWord';
import LinkButton from '@/components/LinkButton';
import QuestionInput from '@/page-components/create/question/QuestionInput';
import { ArrowBackOutlined } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, Typography } from '@mui/material';

export default function CreateQuizSummaryPage() {
  return (
    <Box>
      <Typography variant="h1">
        <span>The </span>
        <GradientWord>summary</GradientWord>
        <span>.</span>
      </Typography>
      <Card>
        <CardContent>
          <Box>summary</Box>
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            margin: 1,
          }}
          disableSpacing
        >
          <LinkButton
            hrefObserver="/create/2-questions"
            navigateOnClick
            variant="outlined"
            iconSide="right"
            startIcon={<ArrowBackOutlined />}
          >
            Edit questions
          </LinkButton>
          <LinkButton
            hrefObserver="/"
            navigateOnClick
            sx={{ marginLeft: 'auto' }}
            variant="contained"
          >
            Finish quiz
          </LinkButton>
        </CardActions>
      </Card>
    </Box>
  );
}
