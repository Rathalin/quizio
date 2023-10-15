import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Stack,
  Grid,
} from '@mui/material';
import AnsweredProgress from './AnsweredProgress';
import { AnsweredState } from '@/pages/play/[id].page';
import IndexAvatar from './IndexAvatar';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Image from 'next/image';
import { useImageDimensions } from './useImageDimensions';
import { getBackendImageUrl } from '@/utilities/getImageUrl';

type PickAnAnswerProps = {
  index: number;
  title: string;
  answers: { id: string; title: string; correct: boolean }[];
  answeredProgress: AnsweredState[];
  onAnswer: (selectedAnswerId: string) => void;
  selectedAnswerId: string | null;
  imageUrl: string | null;
};

export default function PickAnAnswer({
  index,
  title,
  answers,
  answeredProgress,
  onAnswer,
  selectedAnswerId,
  imageUrl,
}: PickAnAnswerProps) {
  const { width, height } = useImageDimensions();
  const answered = selectedAnswerId != null;

  return (
    <>
      <Grid
        container
        spacing={4}
        wrap="wrap-reverse"
        sx={{ paddingTop: 6, paddingInline: 6, paddingBottom: 2 }}
      >
        <Grid item xs={12} md={8}>
          {imageUrl != null && (
            <Stack>
              <Image
                src={getBackendImageUrl(imageUrl)}
                alt={`Question image`}
                width={width}
                height={height}
                style={{
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 0 4px rgba(0, 0, 0, 0.25)',
                }}
                unoptimized
              />
            </Stack>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack direction="row" justifyContent="end">
            <AnsweredProgress answeredProgress={answeredProgress} />
          </Stack>
        </Grid>
      </Grid>
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{ paddingBlock: 2, paddingInline: 6 }}
      >
        <IndexAvatar index={index} />
        <Typography variant="h4" component="h1" sx={{ margin: 0 }}>
          {title}
        </Typography>
      </Stack>
      <List disablePadding>
        {answers.map((answer) => (
          <ListItem key={answer.id} disableGutters>
            <ListItemButton
              sx={{
                fontSize: '1.2rem',
                paddingInline: 6,
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
              color="secondary.main"
              onClick={() => {
                if (answered) return;
                onAnswer(answer.id);
              }}
              selected={selectedAnswerId === answer.id}
              disabled={answered}
            >
              <ListItemIcon>
                {answered &&
                  (answer.correct ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ClearIcon color="error" />
                  ))}
              </ListItemIcon>
              <ListItemText>{answer.title}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}
