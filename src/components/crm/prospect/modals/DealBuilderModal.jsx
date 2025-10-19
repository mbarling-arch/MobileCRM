import React from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import DealBuilder from '../../DealBuilder';

export const DealBuilderModal = ({ open, onClose, companyId, prospectId, isDeal }) => {
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
            Deal Builder
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Deal Builder Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <DealBuilder
            companyId={companyId}
            prospectId={prospectId}
            isDeal={isDeal}
            initial={null}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

