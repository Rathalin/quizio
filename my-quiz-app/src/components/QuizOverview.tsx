import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import PublishStateChip from './PublishStateChip';
import Image from 'next/image';
import {
  Image as ImageIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

type QuizOverviewProps = {
  title: string;
  description: string;
  username: string;
  questionCount: number;
  published: boolean;
  imageUrl?: string;
  isMyQuiz: boolean;
};

export default function QuizOverview({
  title,
  description,
  username,
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
        flexDirection: 'column',
      }}
    >
      {imageUrl != null ? (
        <Image
          loader={imageLoader}
          src={imageUrl}
          alt="QuizImage"
          width={300}
          height={200}
          priority={true}
          style={{ objectFit: 'cover', width: '100%', minHeight: '180px' }}
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
          <ImageIcon fontSize="large" />
        </Box>
      )}
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box>
            <Typography
              variant="h3"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              {title}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ marginBottom: '.8rem' }}>
              {description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {isMyQuiz && (
                <Box sx={{ justifySelf: 'center' }}>
                  <PublishStateChip published={published} />
                </Box>
              )}
              {!isMyQuiz && <Chip label={username} />}
              <Chip
                label={`${questionCount} question${
                  isQuestionCountSingular ? '' : 's'
                }`}
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button variant="contained" size="large" endIcon={<PlayArrowIcon />}>
            Play
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
