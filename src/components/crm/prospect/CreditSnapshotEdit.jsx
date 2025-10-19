import React from 'react';
import { Box, Typography, Stack, Divider, TextField } from '@mui/material';

export const CreditSnapshotEdit = ({ creditData, setCreditData }) => {
  const credit = creditData || {};

  const handleChange = (field) => (e) => {
    setCreditData({ ...credit, [field]: e.target.value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small" 
                label="Date of Birth" 
                type="date" 
                value={credit.buyerDOB || ''} 
                onChange={handleChange('buyerDOB')} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="DL" 
                value={credit.buyerDL || ''} 
                onChange={handleChange('buyerDL')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="State" 
                value={credit.buyerDLState || ''} 
                onChange={handleChange('buyerDLState')} 
                placeholder="e.g., TX" 
                fullWidth 
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small" 
                label="SSN" 
                value={credit.buyerSSN || ''} 
                onChange={handleChange('buyerSSN')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="Gender" 
                value={credit.buyerGender || ''} 
                onChange={handleChange('buyerGender')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="Race" 
                value={credit.buyerRace || ''} 
                onChange={handleChange('buyerRace')} 
                fullWidth 
              />
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small" 
                label="Date of Birth" 
                type="date" 
                value={credit.coBuyerDOB || ''} 
                onChange={handleChange('coBuyerDOB')} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="DL" 
                value={credit.coBuyerDL || ''} 
                onChange={handleChange('coBuyerDL')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="State" 
                value={credit.coBuyerDLState || ''} 
                onChange={handleChange('coBuyerDLState')} 
                placeholder="e.g., TX" 
                fullWidth 
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small" 
                label="SSN" 
                value={credit.coBuyerSSN || ''} 
                onChange={handleChange('coBuyerSSN')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="Gender" 
                value={credit.coBuyerGender || ''} 
                onChange={handleChange('coBuyerGender')} 
                fullWidth 
              />
              <TextField 
                size="small" 
                label="Race" 
                value={credit.coBuyerRace || ''} 
                onChange={handleChange('coBuyerRace')} 
                fullWidth 
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TextField 
              size="small" 
              label="TransUnion" 
              type="number" 
              value={credit.buyerTransUnion || ''} 
              onChange={handleChange('buyerTransUnion')} 
              fullWidth 
            />
            <TextField 
              size="small" 
              label="Equifax" 
              type="number" 
              value={credit.buyerEquifax || ''} 
              onChange={handleChange('buyerEquifax')} 
              fullWidth 
            />
            <TextField 
              size="small" 
              label="Experian" 
              type="number" 
              value={credit.buyerExperian || ''} 
              onChange={handleChange('buyerExperian')} 
              fullWidth 
            />
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TextField 
              size="small" 
              label="TransUnion" 
              type="number" 
              value={credit.coBuyerTransUnion || ''} 
              onChange={handleChange('coBuyerTransUnion')} 
              fullWidth 
            />
            <TextField 
              size="small" 
              label="Equifax" 
              type="number" 
              value={credit.coBuyerEquifax || ''} 
              onChange={handleChange('coBuyerEquifax')} 
              fullWidth 
            />
            <TextField 
              size="small" 
              label="Experian" 
              type="number" 
              value={credit.coBuyerExperian || ''} 
              onChange={handleChange('coBuyerExperian')} 
              fullWidth 
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

