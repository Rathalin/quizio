import { AnsweredState } from '@/pages/play/[id].page';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { Stack } from '@mui/material';

type ScoreProgressProps = {
  answeredProgress: AnsweredState[];
};

export default function AnsweredProgress({
  answeredProgress,
}: ScoreProgressProps) {
  function isAnswerCorrect(state: AnsweredState) {
    if (state.selectedAnswerId == null) {
      return null;
    }
    return state.selectedAnswerId === state.correctAnswerId;
  }

  return (
    <Stack direction="row" flexWrap="wrap">
      {answeredProgress.map((state, index) => (
        <AnsweredStateItem key={index} correct={isAnswerCorrect(state)} />
      ))}
    </Stack>
  );
}

function AnsweredStateItem({ correct }: { correct: boolean | null }) {
  if (correct == null) {
    return <CircleIcon color="disabled" fontSize="large" />;
  }

  if (correct) {
    return <CheckCircleIcon color="success" fontSize="large" />;
  }
  return <CancelIcon color="error" fontSize="large" />;
}
