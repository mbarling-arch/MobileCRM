import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import CRMLayout from '../CRMLayout';
import UnderConstruction from '../UnderConstruction';

function CRMDashboard() {
  return (
    <CRMLayout>
      <Box sx={{ p: 3 }}>
        <UnderConstruction
          title="CRM Dashboard"
          description="Your comprehensive CRM dashboard is under development. This will provide an overview of your leads, deals, projects, and key metrics for your company."
        />
      </Box>
    </CRMLayout>
  );
}

export default CRMDashboard;

