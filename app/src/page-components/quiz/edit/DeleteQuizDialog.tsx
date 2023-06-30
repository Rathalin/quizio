import LoadingCircle from '@/components/LoadingCircle';
import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

type DeleteQuizDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  quizTitle: string;
  loading: boolean;
};

export default function DeleteQuizDialog({
  open,
  setOpen,
  onConfirm,
  quizTitle,
  loading,
}: DeleteQuizDialogProps) {
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
      <DialogTitle id="alert-dialog-title">
        {`Do you really want to delete '${quizTitle}'?`}
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm()}
          startIcon={loading ? <LoadingCircle color="error" /> : null}
          color="error"
          autoFocus
        >
          Delete my quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
}
