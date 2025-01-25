import LoadingCircle from '@/components/LoadingCircle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { Dispatch, SetStateAction } from 'react';

type DeleteQuizDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  quizTitle: string;
  loading: boolean;
};

export default function DeleteQuizDialog({ open, setOpen, onConfirm, quizTitle, loading }: DeleteQuizDialogProps) {
  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Do you really want to delete '${quizTitle}'?`}</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm()}
          startIcon={loading ? <LoadingCircle color="error" /> : null}
          disabled={loading}
          color="error"
          autoFocus
        >
          Delete my quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
}
