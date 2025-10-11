import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ServiceTab = ({ prospectId }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
        Service Information
      </Typography>
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
        Service tab content will be implemented here.
      </Typography>
    </Paper>
  );
};

export default ServiceTab;
