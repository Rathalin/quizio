import { forwardRef, useState, type MouseEvent } from 'react';
import QuizioTextField, { QuizioTextInputProps } from './QuizioTextField';
import { InputAdornment, IconButton } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
