import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { darken, lighten, useColorScheme, useTheme } from '@mui/material/styles';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import { useMemo } from 'react';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import { useToastStore } from '@/persistence/taost.store';
import { dateFormatter } from '@/utilities/intlFormats';
import { useTranslations } from 'next-intl';
import LinkIconButton from '@/components/LinkIconButton';
import LinkButton from '@/components/LinkButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';

type Props = {
  uuid: string;
  title: string;
  description: string;
  createdAt: Date;
  questionCount: number;
  playCount: number;
  published: boolean;
  imageUrl: string | null;
};

export default function MyQuizCard({
  uuid,
  title,
  description,
  createdAt,
  questionCount,
  playCount,
  imageUrl,
  published,
}: Props) {
  const t = useTranslations('myQuizzes.quizCard');

  return <></>;
}
