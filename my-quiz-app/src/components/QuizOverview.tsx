import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import PublishStateChip from './PublishStateChip';
import Image from 'next/image';
import { ImageOutlined, PlayArrowOutlined } from '@mui/icons-material';

type QuizOverviewProps = {
  title: string;
  description: string;
  questionCount: number;
  published: boolean;
  imageUrl?: string;
  isMyQuiz: boolean;
};

export default function QuizOverview({
  title,
  description,
  questionCount,
  published,
  imageUrl,
  isMyQuiz,
}: QuizOverviewProps) {
  const isQuestionCountSingular = questionCount === 1;

  function imageLoader({ src }: { src: string }) {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${src}`;
  }

  return (
    <Card
      sx={{
        display: 'flex',
        gap: 2,
        // cursor: 'pointer',
        // transition: 'transform .2s ease-in-out',
        // '&:hover': {
        //   transform: 'scale(1.02)',
        // },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          padding: 4,
          display: 'grid',
          gridTemplateColumns: '3fr minmax(100px, 1fr)',
          gridTemplateRows: '1fr 1fr',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3">{title}</Typography>
        {isMyQuiz && (
          <Box sx={{ justifySelf: 'center' }}>
            <PublishStateChip published={published} />
          </Box>
        )}
        <Box>
          <Typography>{description}</Typography>
          <Typography>{`${questionCount} question${
            isQuestionCountSingular ? '' : 's'
          }`}</Typography>
        </Box>
        <Box sx={{ justifySelf: 'center' }}>
          <Button variant="contained" endIcon={<PlayArrowOutlined />}>
            Play
          </Button>
        </Box>
      </CardContent>
      {imageUrl != null ? (
        <Image
          loader={imageLoader}
          src={imageUrl}
          alt="QuizImage"
          width={300}
          height={200}
          priority={true}
        ></Image>
      ) : (
        <Box
          sx={{
            width: 300,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3b3b3b',
          }}
        >
          <ImageOutlined fontSize="large" />
        </Box>
      )}
    </Card>
  );
}
