import { forwardRef, useState, type MouseEvent } from 'react';
import QuizioTextField, { QuizioTextInputProps } from './QuizioTextField';
import { InputAdornment, IconButton } from '@mui/material';
import {
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

type QuizioPasswordFieldProps = QuizioTextInputProps & {};

export default forwardRef<HTMLDivElement, QuizioPasswordFieldProps>(
  function QuizioPasswordField(
    { InputProps, ...other }: QuizioPasswordFieldProps,
    ref
  ) {
    const [showInput, setShowInput] = useState(false);

    function handleClickShowPassword() {
      setShowInput((show) => !show);
    }

    function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    return (
      <QuizioTextField
        type={showInput ? 'text' : 'password'}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showInput ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        ref={ref}
        {...other}
      />
    );
  }
);
