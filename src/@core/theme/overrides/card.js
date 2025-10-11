const card = skin => {
  return {
    MuiCard: {
      defaultProps: {
        elevation: 0 // Remove default elevation, we'll use custom shadows
      },
      styleOverrides: {
        root: ({ theme }) => ({
          // FORCE no border - override inline styles
          border: 'none !important',
          borderWidth: '0 !important',
          // Custom shadow for depth
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px 4px 16px rgba(0, 0, 0, 0.4) !important' 
            : '0px 4px 16px rgba(46, 38, 61, 0.12) !important',
          // Keep nice rounded corners (12px is good)
          borderRadius: '12px !important',
          // Smooth transition for hover effects
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            // Subtle lift on hover
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 6px 20px rgba(0, 0, 0, 0.5) !important'
              : '0px 6px 20px rgba(46, 38, 61, 0.16) !important',
          }
        })
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '& + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0
          }
        }),
        subheader: ({ theme }) => ({
          ...theme.typography.subtitle1,
          color: theme.palette.text.secondary
        }),
        action: ({ theme }) => ({
          marginBlock: 0,
          marginInlineEnd: 0
        })
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '&:last-child': {
            paddingBlockEnd: theme.spacing(5)
          }
        })
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '&.card-actions-dense': {
            padding: theme.spacing(2.5)
          }
        })
      }
    }
  }
}

export default card

