import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useState, MouseEvent, ChangeEvent } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useUpdateQuizVisibilityMutation } from '@/data/useUpdateQuizVisibilityMutation';
import { useToastStore } from '@/persistence/taost.store';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  uuid: string;
  isPublished: boolean;
};

export function VisibilityColumn({ uuid, isPublished }: Props) {
  const t = useTranslations('myQuizzes.table.column.isPublished');
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isPublishedSelected, setIsPublishSelected] = useState(isPublished);

  const { mutateAsync: updateVisibility } = useUpdateQuizVisibilityMutation(uuid);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setIsPublishSelected(event.target.value === 'public');
  }

  async function handleSave() {
    try {
      await updateVisibility({ visibility: isPublishedSelected ? 'public' : 'private' });
      if (isPublishedSelected) {
        showSuccessToast(t('publish.success'));
      } else {
        showSuccessToast(t('unpublish.success'));
      }
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['getMyQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['getQuizzesInfinite'] });
    } catch (error) {
      if (isPublishedSelected) {
        showErrorToast(t('publish.error'));
      } else {
        showErrorToast(t('unpublish.error'));
      }
    }
  }

  const open = anchorEl != null;
  const id = open ? 'quiz-visibility-popover' : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        size="small"
        color="inherit"
        startIcon={isPublished ? <PublicIcon /> : <PublicOffIcon />}
        onClick={handleClick}
      >
        {isPublished ? t('option.isPublished') : t('option.notPublished')}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Card>
          <CardContent>
            <FormControl>
              <FormLabel>{t('popover.heading')}</FormLabel>
              <RadioGroup
                name="quiz-visibility"
                value={isPublishedSelected ? 'public' : 'private'}
                onChange={handleChange}
              >
                <FormControlLabel value="public" control={<Radio size="small" />} label={t('option.isPublished')} />
                <FormControlLabel value="private" control={<Radio size="small" />} label={t('option.notPublished')} />
              </RadioGroup>
            </FormControl>
            <Stack direction="row" alignItems="center" gap={1} sx={{ marginTop: 2 }}>
              <InfoOutlinedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="textSecondary">
                {t('popover.footer')}
              </Typography>
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: 'end' }}>
            <Button startIcon={<SaveIcon />} onClick={handleSave} disabled={isPublished === isPublishedSelected}>
              {t('popover.save.label')}
            </Button>
          </CardActions>
        </Card>
      </Popover>
    </>
  );
}
