import { GetMyQuizzesResponseQuiz } from '@/api-client';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { MyQuizzesMobileRow } from './MyQuizzesMobileRow';

type Props = {
  quizzes: GetMyQuizzesResponseQuiz[];
};

export function MyQuizzesMobileTable({ quizzes }: Props) {
  return (
    <>
      <Stack gap={4}>
        <Divider />
        {quizzes.map((quiz) => (
          <MyQuizzesMobileRow key={quiz.uuid} {...quiz} />
        ))}
      </Stack>
    </>
  );
}

export function MyQuizzesMobileTableSkeleton() {
  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <Stack sx={{ minWidth: '700px' }}>
        <Stack direction="row" sx={{ paddingInline: 2, marginTop: 1, marginBottom: 2 }}>
          <Box sx={{ width: '50%' }}>
            <Skeleton width="20%" height="2rem" />
          </Box>
          <Box sx={{ width: '12.5%' }}>
            <Skeleton width="40%" height="2rem" />
          </Box>
          <Box sx={{ width: '12.5%' }}>
            <Skeleton width="60%" height="2rem" />
          </Box>
          <Box sx={{ width: '12.5%' }}>
            <Skeleton width="60%" height="2rem" />
          </Box>
          <Box sx={{ width: '12.5%' }}>
            <Skeleton width="50%" height="2rem" />
          </Box>
        </Stack>
        <Divider />
        <Stack sx={{ paddingInline: 2, marginBlock: -1 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i}>
              <Stack direction="row">
                <Box sx={{ width: '50%' }}>
                  <Stack direction="row" gap={2}>
                    <Skeleton width={112.5} height={75 / 0.6} />
                    <Stack marginTop={3} flex={1}>
                      <Skeleton width="30%" height="2rem" />
                      <Skeleton width="50%" height="2rem" />
                    </Stack>
                  </Stack>
                </Box>
                <Box sx={{ width: '12.5%', marginTop: 3 }}>
                  <Skeleton width="60%" height="2rem" />
                </Box>
                <Box sx={{ width: '12.5%', marginTop: 2.6 }}>
                  <Skeleton width="80%" height="3rem" />
                </Box>
                <Box sx={{ width: '12.5%', marginTop: 2.6 }}>
                  <Skeleton width="80%" height="3rem" />
                </Box>
                <Box sx={{ width: '12.5%', marginTop: 3 }}>
                  <Skeleton width="60%" height="2rem" />
                </Box>
              </Stack>
              <Divider />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
