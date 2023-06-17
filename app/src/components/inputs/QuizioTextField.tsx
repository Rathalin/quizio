import {
  FormHelperText,
  Stack,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { forwardRef, useMemo } from 'react';

type QuizioTextInputProps = TextFieldProps & {};

export default forwardRef<HTMLDivElement, QuizioTextInputProps>(
  function QuizioTextField(
    {
      helperText,
      value,
      inputProps,
      fullWidth,
      sx,
      ...other
    }: QuizioTextInputProps,
    ref
  ) {
    const remainingCharacters = useMemo(() => {
      if (inputProps?.maxLength == null) return null;
      return `${(value as any)?.length ?? 0}/${inputProps?.maxLength}`;
    }, [value, inputProps?.maxLength]);

    return (
      <Stack
        sx={{
          display: 'inline-flex',
          width: fullWidth ? '100%' : 'auto',
          ...sx,
        }}
      >
        <TextField
          value={value}
          inputProps={inputProps}
          fullWidth={fullWidth}
          ref={ref}
          {...other}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ marginInline: 1 }}
        >
          <FormHelperText error>{helperText}</FormHelperText>
          <FormHelperText>{remainingCharacters}</FormHelperText>
        </Stack>
      </Stack>
    );
  }
);
