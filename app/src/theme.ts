import { createTheme, responsiveFontSizes } from '@mui/material/styles';

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
            secondary: '#afafaf',
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
            primary: '#000000',
            secondary: '#434343',
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
