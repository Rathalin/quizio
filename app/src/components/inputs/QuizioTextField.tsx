import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { forwardRef, useMemo } from 'react';

export type QuizioTextInputProps = TextFieldProps & {};

export default forwardRef<HTMLDivElement, QuizioTextInputProps>(function QuizioTextField(
  { helperText, value, slotProps, fullWidth, sx, ...other }: QuizioTextInputProps,
  ref,
) {
  const remainingCharacters = useMemo(() => {
    // Use custom types since MUI types seem to be incomplete
    const htmlInput: { maxLength?: number } | undefined = slotProps?.htmlInput as any;
    const val: { length?: number } = value as any;
    if (htmlInput?.maxLength == null) return null;
    return `${val?.length ?? 0}/${htmlInput.maxLength}`;
  }, [slotProps?.htmlInput, value]);

  return (
    <Stack
      sx={{
        display: 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        ...sx,
      }}
    >
      <TextField value={value} slotProps={slotProps} fullWidth={fullWidth} ref={ref} {...other} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1, marginInline: 1 }}>
        <FormHelperText error>{helperText}</FormHelperText>
        <FormHelperText>{remainingCharacters}</FormHelperText>
      </Stack>
    </Stack>
  );
});
