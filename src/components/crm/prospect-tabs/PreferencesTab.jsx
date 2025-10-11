import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PreferencesTab = ({ prospectId }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
        Preferences
      </Typography>
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
        Preferences tab content will be implemented here.
      </Typography>
    </Paper>
  );
};

export default PreferencesTab;
