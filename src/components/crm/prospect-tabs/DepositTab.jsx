import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AddDepositDrawer from '../AddDepositDrawer';

const DepositTab = ({ prospectId, isDeal, context }) => {
  const { deposits, buyerInfo, convertToDeal } = context;
  const [depositDrawerOpen, setDepositDrawerOpen] = useState(false);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Deposit Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', mb: 1 }}>
            Total Deposits
          </Typography>
          <Typography sx={{ color: 'text.primary', fontSize: 32, fontWeight: 700, textAlign: 'center' }}>
            {deposits.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', mb: 1 }}>
            Money Received
          </Typography>
          <Typography sx={{ color: 'success.main', fontSize: 32, fontWeight: 700, textAlign: 'center' }}>
            ${deposits.filter(d => d.status === 'received').reduce((sum, deposit) => sum + deposit.amount, 0).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* Deposit List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, textAlign: 'center', flex: 1 }}>
            Deposit History
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDepositDrawerOpen(true)}
            startIcon={<AddIcon />}
            size="small"
          >
            Add Deposit
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receipt #</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ color: 'text.primary', fontSize: 14 }}>
                    {deposit.createdAt ? new Date(deposit.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontSize: 16, fontWeight: 600 }}>
                    ${deposit.amount?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontSize: 14 }}>
                    {deposit.type || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={deposit.status || 'pending'}
                      color={(deposit.status === 'received' || deposit.status === 'completed') ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontSize: 14 }}>
                    {deposit.receiptNumber || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {deposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.disabled', py: 6, fontStyle: 'italic' }}>
                    No deposits recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AddDepositDrawer
        open={depositDrawerOpen}
        onClose={() => setDepositDrawerOpen(false)}
        prospectId={prospectId}
        buyerInfo={buyerInfo}
        onConvertToDeal={convertToDeal}
        isDeal={isDeal}
      />
    </Box>
  );
};

export default DepositTab;
