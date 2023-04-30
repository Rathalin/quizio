import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

type MyQuizOverviewProps = {
  title: string;
  description: string;
  questionCount: number;
  published: boolean;
};

export default function MyQuizOverview({
  title,
  description,
  questionCount,
  published,
}: MyQuizOverviewProps) {
  const isQuestionCountSingular = questionCount === 1;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h3" sx={{ marginTop: 1 }}>
            {title}
          </Typography>
          {published ? (
            <Chip label="Published" color="success" variant="outlined" />
          ) : (
            <Chip label="Unpublished" color="warning" variant="outlined" />
          )}
        </Box>
        <Typography>{description}</Typography>
        <Typography>{`${questionCount} question${
          isQuestionCountSingular ? '' : 's'
        }`}</Typography>
      </CardContent>
    </Card>
  );
}
