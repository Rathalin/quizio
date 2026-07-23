// theme.ts
import { createTheme, responsiveFontSizes, PaletteColor, PaletteColorOptions } from '@mui/material/styles';

export const theme = responsiveFontSizes(
  createTheme({
    cssVariables: {
      colorSchemeSelector: 'class',
    },
    colorSchemes: {
      dark: {
        palette: {
          text: {
            primary: 'rgba(255, 255, 255, 0.9)',
            secondary: 'rgba(255, 255, 255, 0.6)',
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
              light: '#ffc800',
              main: '#ffaf37',
              dark: '#d68624',
            },
            secondary: {
              light: '#1fcbff',
              main: '#2ca4ff',
              dark: '#1c92d7',
            },
          },
        },
      },
      light: {
        palette: {
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
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
              light: '#ffbf00',
              main: '#c97900',
              dark: '#8b4f00',
            },
            secondary: {
              light: '#00c3ff',
              main: '#0097d7',
              dark: '#005f9a',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: ['Figtree', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      h1: {
        fontSize: '2.5rem',
      },
      h2: {
        fontSize: '2rem',
      },
      h3: {
        fontSize: '1.75rem',
      },
      h4: {
        fontSize: '1.5rem',
      },
      h5: {
        fontSize: '1.25rem',
      },
      h6: {
        fontSize: '1rem',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
  }),
);

declare module '@mui/material/styles' {
  interface Palette {
    loading: PaletteColor;
    placeholder: PaletteColor;
    accent: {
      primary: PaletteColor;
      secondary: PaletteColor;
    };
  }

  interface PaletteOptions {
    loading?: PaletteColorOptions;
    placeholder?: PaletteColorOptions;
    accent?: {
      primary?: PaletteColorOptions;
      secondary?: PaletteColorOptions;
    };
  }
}

declare module '@mui/material/CircularProgress' {
  export interface CircularProgressPropsColorOverrides {
    loading: true;
  }
}
