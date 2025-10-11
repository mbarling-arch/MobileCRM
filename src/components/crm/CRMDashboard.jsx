import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import UnderConstruction from '../UnderConstruction';

function CRMDashboard() {
  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <UnderConstruction
          title="Dashboard"
          description="Your comprehensive CRM dashboard is under development. This will provide an overview of your leads, deals, projects, and key metrics for your company."
        />
      </Box>
    </UnifiedLayout>
  );
}

export default CRMDashboard;

