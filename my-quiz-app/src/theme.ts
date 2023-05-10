import { createTheme, responsiveFontSizes } from '@mui/material';

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#d0c15c',
      },
      secondary: {
        main: '#84a9c1',
      },
      loading: {
        main: '#009376',
      },
      placeholder: {
        main: '#313131',
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
        marginTop: '1rem',
        marginBottom: '2rem',
      },
      h2: {
        fontSize: '2rem',
        marginTop: '0.8rem',
        marginBottom: '2rem',
      },
      h3: {
        fontSize: '1.75rem',
        marginTop: '0.6rem',
        marginBottom: '1.5rem',
      },
      h4: {
        fontSize: '1.5rem',
        marginTop: '0.4rem',
        marginBottom: '1rem',
      },
      h5: {
        fontSize: '1.25rem',
        marginTop: '0.2rem',
        marginBottom: '0.75rem',
      },
      h6: {
        fontSize: '1rem',
        marginBottom: '0.5rem',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    components: {},
  })
);

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    loading: Palette['primary'];
    placeholder: Palette['primary'];
  }
  interface PaletteOptions {
    loading: PaletteOptions['primary'];
    placeholder: PaletteOptions['primary'];
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
