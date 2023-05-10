import { Alert, AlertColor, Snackbar } from '@mui/material';

type AnswerFeedbackProps = {
  alert: {
    text: string;
    severity: AlertColor;
  } | null;
  onClose: () => void;
};

export default function AnswerFeedback({
  alert,
  onClose,
}: AnswerFeedbackProps) {
  return (
    <Snackbar
      open={alert != null}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={alert?.severity ?? 'info'}>{alert?.text ?? ''}</Alert>
    </Snackbar>
  );
}
