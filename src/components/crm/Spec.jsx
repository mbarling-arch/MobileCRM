import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import UnifiedLayout from '../UnifiedLayout';

function Spec() {
  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Spec
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'customColors.cardBackground' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Spec Content Coming Soon
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            This page is under construction.
          </Typography>
        </Paper>
      </Box>
    </UnifiedLayout>
  );
}

export default Spec;

