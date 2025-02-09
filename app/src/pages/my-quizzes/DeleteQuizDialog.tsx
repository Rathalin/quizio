import LoadingCircle from '@/components/LoadingCircle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslations } from 'next-intl';

type DeleteQuizDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  quizTitle: string;
  loading: boolean;
};

export default function DeleteQuizDialog({ open, onCancel, onConfirm, quizTitle, loading }: DeleteQuizDialogProps) {
  const t = useTranslations('myQuizzes.table.column.action.delete');

  function handleClose() {
    onCancel();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{t('dialog.title', { title: quizTitle })}</DialogTitle>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          {t('dialog.action.cancel.label')}
        </Button>
        <Button
          onClick={() => onConfirm()}
          startIcon={loading ? <LoadingCircle color="error" /> : null}
          disabled={loading}
          color="error"
          autoFocus
        >
          {t('dialog.action.confirm.label')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
