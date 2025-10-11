import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { useUser } from '../../../hooks/useUser';

const ApplicationTab = ({ prospectId, isDeal, context }) => {
  const { convertToDeal } = context;
  const params = useParams();
  const { userProfile } = useUser();

  const handleApplicationSubmit = async () => {
    // Automatically convert to deal when application is submitted
    try {
      await convertToDeal();
    } catch (error) {
      console.error('Error converting prospect to deal after application submission:', error);
    }
  };

  const handleStartApplication = () => {
    // Check if this is a prospect or deal and navigate to the dedicated application route
    const isDeal = !!params.dealId;
    const applicationPath = isDeal
      ? `/crm/deals/${prospectId}/application?companyId=${userProfile?.companyId}`
      : `/crm/prospects/${prospectId}/application?companyId=${userProfile?.companyId}`;

    // Open application in new tab
    window.open(applicationPath, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <Paper sx={{
        p: 5,
        textAlign: 'center',
        maxWidth: 480
      }}>
        <DescriptionIcon sx={{ fontSize: 72, color: 'primary.main', mb: 3, opacity: 0.9 }} />
        <Typography sx={{ mb: 2, color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
          Customer Application
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7 }}>
          Start the formal application process for this customer. This will guide them through all required information and documentation.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartApplication}
          startIcon={<DescriptionIcon />}
          sx={{ px: 4, py: 1.5, fontSize: 16 }}
        >
          Start Application
        </Button>
      </Paper>
    </Box>
  );
};

export default ApplicationTab;
