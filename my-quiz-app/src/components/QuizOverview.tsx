import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from '@mui/material';
import PublishStateChip from './PublishStateChip';
import Image from 'next/image';

type QuizOverviewProps = {
  title: string;
  description: string;
  questionCount: number;
  published: boolean;
  imageUrl: string;
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
    <Card>
      <CardContent>
        <CardMedia>
          <Image
            loader={imageLoader}
            src={imageUrl}
            alt="QuizImage"
            width={300}
            height={200}
          ></Image>
        </CardMedia>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h3" sx={{ marginTop: 1 }}>
            {title}
          </Typography>
          {isMyQuiz && <PublishStateChip published={published} />}
        </Box>
        <Typography>{description}</Typography>
        <Typography>{`${questionCount} question${
          isQuestionCountSingular ? '' : 's'
        }`}</Typography>
      </CardContent>
    </Card>
  );
}
