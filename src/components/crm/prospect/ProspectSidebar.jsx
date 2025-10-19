import React from 'react';
import { Paper, Stack, Button, Box } from '@mui/material';

export const ProspectSidebar = ({
  onBudgetClick,
  onCreditSnapshotClick,
  onGamePlanClick,
  onBuildHomeClick,
  onDepositsClick,
  onApplicationClick,
  onDealBuilderClick
}) => {
  const actionButtons = [
    {
      label: 'Budget',
      color: 'info',
      onClick: onBudgetClick
    },
    {
      label: 'Credit Snapshot',
      color: 'secondary',
      onClick: onCreditSnapshotClick
    },
    {
      label: 'Game Plan',
      color: 'warning',
      onClick: onGamePlanClick
    },
    {
      label: 'Build Home',
      onClick: onBuildHomeClick,
      sx: {
        backgroundColor: '#0EA5E9',
        color: 'white',
        '&:hover': {
          backgroundColor: '#0284C7'
        }
      }
    },
    {
      label: 'Deposits',
      color: 'success',
      onClick: onDepositsClick
    },
    {
      label: 'Application',
      color: 'primary',
      onClick: onApplicationClick
    },
    {
      label: 'Deal Builder',
      onClick: onDealBuilderClick,
      sx: {
        backgroundColor: '#059669',
        color: 'white',
        '&:hover': {
          backgroundColor: '#047857'
        }
      }
    }
  ];

  return (
    <Box sx={{ flex: '0 0 auto', width: { xs: '100%', lg: 'calc(25% - 16px)' } }}>
      <Paper
        elevation={6}
        sx={{
          backgroundColor: 'customColors.calendarHeaderBackground',
          border: '1px solid',
          borderColor: 'customColors.calendarBorder',
          borderRadius: 4,
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack spacing={2}>
          {actionButtons.map((button) => (
            <Button
              key={button.label}
              variant="contained"
              color={button.color}
              fullWidth
              onClick={button.onClick}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                textTransform: 'none',
                ...button.sx
              }}
            >
              {button.label}
            </Button>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

