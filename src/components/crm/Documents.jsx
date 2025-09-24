import React from 'react';
import { Box } from '@mui/material';
import CRMLayout from '../CRMLayout';
import UnderConstruction from '../UnderConstruction';

function Documents() {
  return (
    <CRMLayout>
      <Box sx={{ p: 3 }}>
        <UnderConstruction
          title="Document Management"
          description="The document management system is under development. This will help you store, organize, and share important documents securely."
        />
      </Box>
    </CRMLayout>
  );
}

export default Documents;

