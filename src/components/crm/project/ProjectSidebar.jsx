import React from 'react';
import { Paper, Stack, Button, Box } from '@mui/material';

export const ProjectSidebar = ({
  onDealBuilderClick,
  onCreateTaskClick,
  onUploadDocumentClick
}) => {
  const actionButtons = [
    {
      label: 'Deal Builder',
      color: 'primary',
      onClick: onDealBuilderClick
    },
    {
      label: 'Create Task',
      color: 'warning',
      onClick: onCreateTaskClick
    },
    {
      label: 'Upload Document',
      color: 'success',
      onClick: onUploadDocumentClick
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
                textTransform: 'none'
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

