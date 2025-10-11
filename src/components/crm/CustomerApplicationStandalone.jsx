import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import CustomerApplication from './CustomerApplication';
import { useProspect } from '../../hooks/useProspect';
import { useUser } from '../../hooks/useUser';

function CustomerApplicationContent({ prospectId, isDeal }) {
  const { convertToDeal } = useProspect({ prospectId, isDeal });
  const navigate = useNavigate();

  const handleApplicationSubmit = async () => {
    // Automatically convert to deal when application is submitted
    try {
      await convertToDeal();
      alert('Application submitted successfully! Prospect has been converted to a deal.');
    } catch (error) {
      console.error('Error converting prospect to deal after application submission:', error);
      alert('Application submitted, but there was an error converting to deal. Please check manually.');
    }
  };

  const handleBack = () => {
    const basePath = isDeal ? `/crm/deals/${prospectId}` : `/crm/prospects/${prospectId}`;
    navigate(basePath);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1625', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header with Back Button */}
        <Paper sx={{
          p: 2,
          mb: 3,
          backgroundColor: '#2a2746',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Back to {isDeal ? 'Deal' : 'Prospect'}
            </Button>
            <Typography sx={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
              Customer Application Form
            </Typography>
          </Box>
        </Paper>

        {/* Application Form */}
        <CustomerApplication onSubmit={handleApplicationSubmit} />
      </Container>
    </Box>
  );
}

function CustomerApplicationStandalone() {
  const params = useParams();
  const { userProfile } = useUser();

  const actualProspectId = params.prospectId || params.dealId;
  const isDeal = !!params.dealId;

  if (!userProfile) {
    return null;
  }

  return (
    <CustomerApplicationContent prospectId={actualProspectId} isDeal={isDeal} />
  );
}

export default CustomerApplicationStandalone;
