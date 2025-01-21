import { createTheme, responsiveFontSizes } from '@mui/material';

export const theme = responsiveFontSizes(
  createTheme({
    cssVariables: {
      colorSchemeSelector: 'class',
    },
    colorSchemes: {
      dark: {
        palette: {
          text: {
            primary: '#ffffff',
            secondary: '#f8f8f8',
          },
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
          background: {
            default: '#0f0f0f',
            paper: '#121212',
          },
          accent: {
            primary: {
              main: '#ffaf37',
            },
            secondary: {
              main: '#2cc0ff',
            },
          },
        },
      },
      light: {
        palette: {
          text: {
            primary: '#000000',
            secondary: '#181818',
          },
          primary: {
            main: '#cc9200',
          },
          secondary: {
            main: '#68baec',
          },
          loading: {
            main: '#009376',
          },
          placeholder: {
            main: '#d5d5d5',
          },
          background: {
            default: '#e2e2e2',
            paper: '#f9f9f9',
          },
          accent: {
            primary: {
              main: '#c97900',
            },
            secondary: {
              main: '#0097d7',
            },
          },
        },
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
  })
);

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    loading: Palette['primary'];
    placeholder: Palette['primary'];
    accent: {
      primary: Palette['primary'];
      secondary: Palette['primary'];
    };
  }
  interface PaletteOptions {
    loading: PaletteOptions['primary'];
    placeholder: PaletteOptions['primary'];
    accent: {
      primary: PaletteOptions['primary'];
      secondary: PaletteOptions['primary'];
    };
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
