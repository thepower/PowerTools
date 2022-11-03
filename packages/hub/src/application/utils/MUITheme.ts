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
  components: {
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6B798F !important',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          borderRadius: 5,
          background: '#252B35',
          '&.Mui-focused': {
            background: '#121923',
            '.MuiOutlinedInput-notchedOutline': {
              border: '1px solid #F5F5F7',
            },
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #F5F5F7',
          },
        },
        notchedOutline: {
          border: '1px solid #252B35',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&::before': {
            borderColor: '#2E3642',
          },
          '&::after': {
            borderBottom: 'none !important',
          },
          '&:hover:not(.Mui-disabled)': {
            '&::before': {
              borderBottom: '1px solid #2E3642',
            },
          },
        },
      },
    },
  },
});

export default MUITheme;
