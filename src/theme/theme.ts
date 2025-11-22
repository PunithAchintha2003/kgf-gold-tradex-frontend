import { createTheme, type ThemeOptions } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#F5D300' : '#E6C200', // Gold color
        light: isDark ? '#FFE55C' : '#F5D300',
        dark: isDark ? '#E6C200' : '#B8A000',
        contrastText: isDark ? '#000000' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#26d4b4' : '#00BFA5', // Prediction green
        light: isDark ? '#5DF2D9' : '#26d4b4',
        dark: isDark ? '#00A693' : '#00A693',
        contrastText: isDark ? '#000000' : '#FFFFFF',
      },
      background: {
        default: isDark ? '#000000' : '#FFFFFF',
        paper: isDark ? '#111111' : '#F5F5F5',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#000000',
        secondary: isDark ? '#cccccc' : '#666666',
      },
      divider: isDark ? '#1f1f1f' : '#E0E0E0',
    },
    typography: {
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      h1: {
        fontSize: '2.8rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '1.5rem',
      },
      h2: {
        fontSize: '2.2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.8rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.4rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.2rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#111111' : '#FFFFFF',
            border: isDark ? '1px solid #1f1f1f' : '1px solid #E0E0E0',
            borderRadius: '12px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDark ? '#FFFFFF' : '#000000',
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: isDark ? '#FFFFFF' : '#000000',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
