import { Box, Card, CardContent, Typography } from '@mui/material';

type MyQuizOverviewProps = {
  title: string;
  description: string;
  questionCount: number;
};

export default function MyQuizOverview({
  title,
  description,
  questionCount,
}: MyQuizOverviewProps) {
  const isQuestionCountSingular = questionCount === 1;

  return (
    <Card>
      <CardContent>
        <Typography variant="h3" sx={{ marginTop: 1 }}>
          {title}
        </Typography>
        <Typography>{description}</Typography>
        <Typography>{`${questionCount} question${
          isQuestionCountSingular ? '' : 's'
        }`}</Typography>
      </CardContent>
    </Card>
  );
}
