import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = {
  valid: boolean;
  label: string;
};

export function RuleCheck({ valid, label }: Props) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      {valid ? <Check color="success" fontSize="small" /> : <Clear color="error" fontSize="small" />}
      <Typography fontSize="0.9rem" marginTop="2px">
        {label}
      </Typography>
    </Stack>
  );
}
