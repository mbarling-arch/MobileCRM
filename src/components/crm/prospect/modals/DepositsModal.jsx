import React from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import DepositTab from '../../prospect-tabs/DepositTab';

export const DepositsModal = ({ open, onClose, prospectId, isDeal, prospectContext }) => {
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
          minHeight: '70vh'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Deposits
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Deposits Content */}
        <DepositTab
          prospectId={prospectId}
          isDeal={isDeal}
          context={prospectContext}
        />
      </Box>
    </Dialog>
  );
};

