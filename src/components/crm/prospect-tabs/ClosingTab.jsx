import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ClosingTab = ({ prospectId }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
        Closing Information
      </Typography>
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
        Closing tab content will be implemented here.
      </Typography>
    </Paper>
  );
};

export default ClosingTab;
