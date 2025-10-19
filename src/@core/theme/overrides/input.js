const input = {
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Keep rounded corners
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          // Subtle shadow when focused
          transition: 'box-shadow 0.2s ease',
          '&.Mui-focused': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 2px 8px rgba(140, 87, 255, 0.2)'
              : '0px 2px 8px rgba(37, 99, 235, 0.12)'
          }
        }
      })
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main
        },
        '&.Mui-focused': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 2px 8px rgba(140, 87, 255, 0.2)'
            : '0px 2px 8px rgba(37, 99, 235, 0.12)'
        }
      }),
      notchedOutline: {
        transition: 'border-color 0.2s ease'
      }
    }
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&:before': {
          display: 'none'
        },
        '&:after': {
          display: 'none'
        }
      }
    }
  }
}

export default input


