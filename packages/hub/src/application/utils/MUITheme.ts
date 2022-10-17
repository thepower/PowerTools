import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const MUITheme = createTheme({
  typography: {
    fontFamily: 'Ubuntu, sans-serif',
  },
  palette: {
    background: {
      default: '#121923',
    },
    primary: {
      main: '#2997ff',
    },
    mode: 'dark',
  },
  spacing: 4,
  transitions: {
    duration: {
      standard: 300,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 360,
      md: 768,
      lg: 1280,
      xl: 1600,
    },
  },
});

export default MUITheme;
