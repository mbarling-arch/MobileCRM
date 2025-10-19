const card = skin => {
  return {
    MuiCard: {
      defaultProps: {
        elevation: 0 // Remove default elevation, we'll use custom shadows
      },
      styleOverrides: {
        root: ({ theme }) => ({
          // Subtle border for better definition
          border: theme.palette.mode === 'dark' 
            ? 'none !important'
            : '1px solid #E2E8F0 !important',
          // Stronger shadow for better depth
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px 4px 16px rgba(0, 0, 0, 0.4) !important' 
            : '0px 4px 12px rgba(100, 116, 139, 0.1), 0px 2px 4px rgba(100, 116, 139, 0.06) !important',
          // Keep nice rounded corners (12px is good)
          borderRadius: '12px !important',
          // Smooth transition for hover effects
          transition: 'box-shadow 0.3s ease, transform 0.2s ease, border-color 0.3s ease',
          '&:hover': {
            // More pronounced lift on hover
            borderColor: theme.palette.mode === 'dark' 
              ? 'transparent'
              : '#CBD5E1',
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 6px 20px rgba(0, 0, 0, 0.5) !important'
              : '0px 8px 20px rgba(100, 116, 139, 0.15), 0px 3px 6px rgba(100, 116, 139, 0.08) !important',
            transform: 'translateY(-2px)'
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

