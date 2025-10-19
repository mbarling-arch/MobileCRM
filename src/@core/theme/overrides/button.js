import themeConfig from '../../../configs/themeConfig'

const button = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: themeConfig.disableRipple
    }
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Keep rounded corners - not too rectangular
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        // Smooth transitions
        transition: 'all 0.2s ease',
        // Remove any default borders
        border: 'none'
      }),
      contained: ({ theme }) => ({
        // Nice floating shadow
        boxShadow: theme.palette.mode === 'dark'
          ? '0px 2px 8px rgba(0, 0, 0, 0.3)'
          : '0px 2px 8px rgba(37, 99, 235, 0.15)',
        '&:hover': {
          // Elevate more on hover
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 4px 12px rgba(0, 0, 0, 0.4)'
            : '0px 4px 12px rgba(37, 99, 235, 0.25)',
          transform: 'translateY(-1px)'
        },
        '&:active': {
          transform: 'translateY(0px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 2px 6px rgba(0, 0, 0, 0.3)'
            : '0px 2px 6px rgba(37, 99, 235, 0.15)'
        }
      }),
      outlined: ({ theme }) => ({
        borderWidth: '1px',
        borderStyle: 'solid',
        '&:hover': {
          borderWidth: '1px',
          // Subtle shadow on hover
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 2px 8px rgba(0, 0, 0, 0.2)'
            : '0px 2px 8px rgba(100, 116, 139, 0.08)'
        }
      }),
      text: ({ theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(140, 87, 255, 0.08)'
            : 'rgba(37, 99, 235, 0.08)'
        }
      }),
      sizeSmall: {
        borderRadius: 6,
        padding: '6px 16px'
      },
      sizeMedium: {
        borderRadius: 8,
        padding: '8px 20px'
      },
      sizeLarge: {
        borderRadius: 10,
        padding: '10px 24px'
      }
    }
  }
}

export default button


