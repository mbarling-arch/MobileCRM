const paper = {
  MuiPaper: {
    defaultProps: {
      elevation: 0 // We'll use custom shadows instead
    },
    styleOverrides: {
      root: ({ theme }) => ({
        // FORCE no border - override inline styles
        border: 'none !important',
        borderWidth: '0 !important',
        // Clean, no border look
        backgroundImage: 'none',
        // Custom shadow for floating effect
        boxShadow: theme.palette.mode === 'dark'
          ? '0px 3px 12px rgba(0, 0, 0, 0.4) !important'
          : '0px 3px 12px rgba(46, 38, 61, 0.1) !important',
        // Nice rounded corners
        borderRadius: '10px !important'
      }),
      rounded: {
        borderRadius: '10px !important'
      },
      outlined: ({ theme }) => ({
        // Even outlined variant gets no border - just shadow
        border: 'none !important',
        boxShadow: theme.palette.mode === 'dark'
          ? '0px 2px 8px rgba(0, 0, 0, 0.3)'
          : '0px 2px 8px rgba(46, 38, 61, 0.08)'
      })
    }
  }
}

export default paper

