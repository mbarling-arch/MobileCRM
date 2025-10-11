import React from 'react';
import { Box } from '@mui/material';
import EMC from '../EMC';

const EmcTab = ({ prospectId, userProfile, isDeal }) => {
  return (
    <Box>
      <EMC
        companyId={userProfile?.companyId}
        prospectId={prospectId}
        isDeal={isDeal}
      />
    </Box>
  );
};

export default EmcTab;
