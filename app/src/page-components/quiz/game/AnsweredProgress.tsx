import { AnsweredState } from '@/pages/play/[uuid].page';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/RadioButtonUnchecked';
import Stack from '@mui/material/Stack';

type ScoreProgressProps = {
  answeredProgress: AnsweredState[];
};

export default function AnsweredProgress({ answeredProgress }: ScoreProgressProps) {
  function isAnswerCorrect(state: AnsweredState) {
    if (state.selectedAnswerId == null) {
      return null;
    }
    return state.selectedAnswerId === state.correctAnswerId;
  }

  const groups = splitArrayIntoGroups(answeredProgress, 5);

  return (
    <Stack>
      {groups.map((row, index) => (
        <Stack direction="row" flexWrap="wrap" key={index}>
          {row.map((state, index) => (
            <AnsweredStateItem key={index} correct={isAnswerCorrect(state)} />
          ))}
        </Stack>
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

function splitArrayIntoGroups<T>(array: T[], groupSize = 10): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }
  return result;
}
