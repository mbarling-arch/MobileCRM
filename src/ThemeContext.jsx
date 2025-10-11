import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Import new theme system
import coreTheme from './@core/theme/index.js';
import themeConfig from './configs/themeConfig.js';

const ThemeContext = createContext();

// Create theme builder function
const buildTheme = (mode) => {
  // Get base theme from core
  const settings = {
    skin: themeConfig.skin,
    primaryColor: themeConfig.primaryColor
  };

  const baseTheme = coreTheme(settings, mode);

  // Merge with MUI theme creation
  const theme = createTheme({
    palette: {
      mode,
      ...baseTheme.colorSchemes[mode].palette
    },
    typography: baseTheme.typography,
    shape: baseTheme.shape,
    shadows: baseTheme.shadows,
    customShadows: baseTheme.customShadows,
    spacing: baseTheme.spacing,
    components: {
      // Merge base component overrides from theme
      ...baseTheme.components,
      // Add/override specific components for layout
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#312D4B' : '#FFFFFF',
            // Clean look - subtle shadow instead of border
            boxShadow: mode === 'dark' 
              ? '4px 0 12px rgba(0, 0, 0, 0.3)' 
              : '4px 0 12px rgba(46, 38, 61, 0.08)',
            border: 'none',
            borderRadius: '0 12px 12px 0'
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#312D4B' : '#FFFFFF',
            // Clean look - subtle shadow instead of border
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(46, 38, 61, 0.08)',
            border: 'none'
          },
        },
      },
    },
  });

  // Add custom colors for backward compatibility
  theme.customColors = {
    layoutBackground: mode === 'dark' ? '#28243D' : '#F4F5FA',
    sidebarBackground: mode === 'dark' ? '#312D4B' : '#FFFFFF',
    sidebarBorder: mode === 'dark' ? 'rgba(231, 227, 252, 0.12)' : 'rgba(46, 38, 61, 0.2)',
    drawerBackground: mode === 'dark' ? '#312D4B' : '#FFFFFF',
    drawerBorder: mode === 'dark' ? 'rgba(231, 227, 252, 0.12)' : 'rgba(46, 38, 61, 0.2)',
    tableBackground: mode === 'dark' ? '#312D4B' : '#FFFFFF',
    tableBorder: mode === 'dark' ? 'rgba(231, 227, 252, 0.12)' : 'rgba(46, 38, 61, 0.2)',
    tableRowBackground: mode === 'dark' ? '#3D3759' : '#F9FAFB',
    tableHeaderBorder: mode === 'dark' ? 'rgba(231, 227, 252, 0.12)' : 'rgba(46, 38, 61, 0.2)',
    calendarBackground: mode === 'dark' ? '#312D4B' : '#FFFFFF',
    calendarHeaderBackground: mode === 'dark' ? '#3D3759' : '#FFFFFF',
    calendarBorder: mode === 'dark' ? 'rgba(231, 227, 252, 0.12)' : 'rgba(46, 38, 61, 0.2)',
    calendarTodayBackground: mode === 'dark' ? 'rgba(140, 87, 255, 0.12)' : 'rgba(140, 87, 255, 0.08)',
    calendarEventBackground: '#8C57FF',
    calendarOffMonthBackground: mode === 'dark' ? '#28243D' : '#F4F5FA',
    cardBackground: mode === 'dark' ? '#312D4B' : '#FFFFFF',
  };

  return theme;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProviderWrapper({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Default to dark mode with purple theme
      setIsDarkMode(true);
    }
  }, []);

  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Build theme with useMemo for performance
  const theme = useMemo(() => {
    return buildTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
