import { useMyQuizsQuery } from '@/graphql/myQuiz/useMyQuizsQuery';
import { Box } from '@mui/material';

export default function DebugPage() {
  const quizesQuery = useMyQuizsQuery();

  if (quizesQuery.isSuccess) {
    return (
      <ul>
        {quizesQuery.data.myQuizs?.data.map((quiz) => (
          <li>{quiz.attributes?.title}</li>
        ))}
      </ul>
    );
  }

  return <Box>Hello WOrld</Box>;
}
