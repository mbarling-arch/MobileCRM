import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FundingTab = ({ prospectId }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
        Funding Information
      </Typography>
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
        Funding tab content will be implemented here.
      </Typography>
    </Paper>
  );
};

export default FundingTab;
