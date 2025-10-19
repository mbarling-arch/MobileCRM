const paper = {
  MuiPaper: {
    defaultProps: {
      elevation: 0 // We'll use custom shadows instead
    },
    styleOverrides: {
      root: ({ theme }) => ({
        // Subtle border for better definition in light mode
        border: theme.palette.mode === 'dark'
          ? 'none !important'
          : '1px solid #E2E8F0 !important',
        // Clean look
        backgroundImage: 'none',
        // Stronger shadow for better depth
        boxShadow: theme.palette.mode === 'dark'
          ? '0px 3px 12px rgba(0, 0, 0, 0.4) !important'
          : '0px 3px 10px rgba(100, 116, 139, 0.1), 0px 1px 3px rgba(100, 116, 139, 0.06) !important',
        // Nice rounded corners
        borderRadius: '10px !important'
      }),
      rounded: {
        borderRadius: '10px !important'
      },
      outlined: ({ theme }) => ({
        border: theme.palette.mode === 'dark'
          ? 'none !important'
          : '1px solid #CBD5E1 !important',
        boxShadow: theme.palette.mode === 'dark'
          ? '0px 2px 8px rgba(0, 0, 0, 0.3)'
          : '0px 2px 6px rgba(100, 116, 139, 0.08), 0px 1px 2px rgba(100, 116, 139, 0.04)'
      })
    }
  }
}

export default paper

