import React from 'react';
import { Box } from '@mui/material';
import UnifiedLayout from '../UnifiedLayout';
import UnderConstruction from '../UnderConstruction';

function Forms() {
  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <UnderConstruction
          title="Form Management"
          description="The form management system is under development. This will help you upload, organize, and manage form templates that can be populated with customer data."
        />
      </Box>
    </UnifiedLayout>
  );
}

export default Forms;

