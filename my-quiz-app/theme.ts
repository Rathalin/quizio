import { createTheme, responsiveFontSizes } from '@mui/material';

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#d09c5c',
      },
      loading: {
        main: '#009376',
      },
    },
    typography: {
      fontFamily: [
        'Rubik',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        marginBlock: '2rem',
      },
      h2: {
        fontSize: '2rem',
        marginBlock: '2rem',
      },
      h3: {
        fontSize: '1.75rem',
        marginBlock: '1.5rem',
      },
      h4: {
        fontSize: '1.5rem',
        marginBlock: '1rem',
      },
      h5: {
        fontSize: '1.25rem',
        marginBlock: '75rem',
      },
      h6: {
        fontSize: '1rem',
        marginBlock: '0.5rem',
      },
      button: {
        textTransform: 'none',
      },
    },
  })
);

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    loading: Palette['primary'];
  }
  interface PaletteOptions {
    loading: PaletteOptions['primary'];
  }
}

// declare module '@mui/material/Button' {
//   export interface ButtonPropsColorOverrides {
//     loading: true;
//   }
// }

declare module '@mui/material/CircularProgress' {
  export interface CircularProgressPropsColorOverrides {
    loading: true;
  }
}
