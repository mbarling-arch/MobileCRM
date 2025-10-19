import React from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ApplicationTab from '../../prospect-tabs/ApplicationTab';

export const ApplicationModal = ({ open, onClose, prospectId, userProfile, prospectContext }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'customColors.layoutBackground',
          borderRadius: 2,
          minHeight: '75vh'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Application
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Application Content */}
        <ApplicationTab
          prospectId={prospectId}
          userProfile={userProfile}
          context={prospectContext}
        />
      </Box>
    </Dialog>
  );
};

