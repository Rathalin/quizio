import { Score } from '@/pages/play/[id].page';
// import {
//   Cancel as CancelIcon,
//   CheckCircle as CheckCircleIcon,
//   Circle as CircleIcon,
// } from '@mui/icons-material';
import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';

type ScoreProgressProps = {
  progress: Score[];
};

export default function ScoreProgress({ progress }: ScoreProgressProps) {
  return (
    <Box>
      {progress.map((score, index) => (
        <ScoreItem key={index} score={score} />
      ))}
    </Box>
  );
}

function ScoreItem({ score }: { score: Score }) {
  return null;
  // if (score === 'correct')
  //   return <CheckCircleIcon color="success" fontSize="large" />;

  // if (score === 'incorrect')
  //   return <CancelIcon color="error" fontSize="large" />;

  // return <CircleIcon sx={{ color: grey[600] }} fontSize="large" />;
}
