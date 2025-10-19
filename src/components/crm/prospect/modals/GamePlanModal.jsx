import React from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import GamePlan from '../../GamePlan';

export const GamePlanModal = ({ open, onClose, prospectId, userProfile, isDeal }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'customColors.layoutBackground',
          borderRadius: 2,
          minHeight: '80vh'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Game Plan - Select Homes
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Game Plan Content */}
        <GamePlan
          prospectId={prospectId}
          userProfile={userProfile}
          isDeal={isDeal}
        />
      </Box>
    </Dialog>
  );
};

