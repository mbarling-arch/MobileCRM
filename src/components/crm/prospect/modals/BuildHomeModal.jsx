import React from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import EMC from '../../EMC';

export const BuildHomeModal = ({ open, onClose, companyId, prospectId, isDeal }) => {
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
          minHeight: '85vh',
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Build Home - EMC Tool
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* EMC Tool Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <EMC
            companyId={companyId}
            prospectId={prospectId}
            isDeal={isDeal}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

