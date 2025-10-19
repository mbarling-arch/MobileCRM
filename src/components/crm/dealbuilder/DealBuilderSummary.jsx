import React from 'react';
import { Paper, Typography, Stack, Box } from '@mui/material';

export const DealBuilderSummary = ({ totals }) => {
  return (
    <Paper sx={{
      mt: 2,
      p: 2,
      backgroundColor: 'customColors.tableRowBackground',
      border: '2px solid',
      borderColor: 'customColors.calendarBorder'
    }}>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
        Deal Summary
      </Typography>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: 'text.secondary' }}>Subtotal:</Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>${totals.subtotal.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: 'text.secondary' }}>Tax (8%):</Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>${totals.tax.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder', pt: 1 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>Total:</Typography>
          <Typography sx={{ color: 'success.main', fontWeight: 700, fontSize: '1.1em' }}>${totals.total.toFixed(2)}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};



