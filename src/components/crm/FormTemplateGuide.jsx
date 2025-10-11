import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';

const FormTemplateGuide = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ backgroundColor: 'customColors.cardBackground' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon />
          Form Template Guide: Excel Data Population
        </Box>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: 'customColors.cardBackground' }}>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Future Feature:</strong> Excel templates will automatically populate with customer data when you click "Print" in the Forms tab.
            </Typography>
          </Alert>

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            How to Create Excel Form Templates
          </Typography>

          <Typography sx={{ mb: 3, color: 'text.secondary' }}>
            Place these placeholder codes in Excel cells where you want customer data to appear. When you print a form, these will be replaced with actual customer information.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            Available Data Fields
          </Typography>

          {/* Buyer Information */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              👤 Buyer Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Placeholder</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Example Output</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><Chip label="{buyer.firstName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's first name</TableCell>
                    <TableCell>John</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.lastName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's last name</TableCell>
                    <TableCell>Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.fullName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's full name</TableCell>
                    <TableCell>John Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.phone}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's phone number</TableCell>
                    <TableCell>(555) 123-4567</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.email}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's email address</TableCell>
                    <TableCell>john.doe@email.com</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.address}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's full address</TableCell>
                    <TableCell>123 Main St, City, ST 12345</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{buyer.ssn}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Buyer's SSN (masked)</TableCell>
                    <TableCell>XXX-XX-1234</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Co-Buyer Information */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.04)' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
              👫 Co-Buyer Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Placeholder</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Example Output</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><Chip label="{coBuyer.firstName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Co-buyer's first name</TableCell>
                    <TableCell>Jane</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{coBuyer.lastName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Co-buyer's last name</TableCell>
                    <TableCell>Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{coBuyer.fullName}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Co-buyer's full name</TableCell>
                    <TableCell>Jane Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{coBuyer.phone}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Co-buyer's phone number</TableCell>
                    <TableCell>(555) 987-6543</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{coBuyer.email}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Co-buyer's email address</TableCell>
                    <TableCell>jane.doe@email.com</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Property Information */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.04)' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
              🏠 Property Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Placeholder</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Example Output</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><Chip label="{property.address}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property address</TableCell>
                    <TableCell>456 Oak Street</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{property.city}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property city</TableCell>
                    <TableCell>Springfield</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{property.state}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property state</TableCell>
                    <TableCell>IL</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{property.zipCode}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property ZIP code</TableCell>
                    <TableCell>62701</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{property.fullAddress}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property full address</TableCell>
                    <TableCell>456 Oak Street, Springfield, IL 62701</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{property.price}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Property price</TableCell>
                    <TableCell>$350,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Deal Information */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(156, 39, 176, 0.04)' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
              💼 Deal Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Placeholder</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Example Output</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><Chip label="{deal.totalPrice}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Total deal price</TableCell>
                    <TableCell>$375,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{deal.earnestMoney}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Earnest money amount</TableCell>
                    <TableCell>$5,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{deal.closingDate}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Expected closing date</TableCell>
                    <TableCell>12/15/2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Chip label="{deal.createdDate}" size="small" variant="outlined" /></TableCell>
                    <TableCell>Deal created date</TableCell>
                    <TableCell>10/03/2024</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Download Sample Template
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open('/sample-form-template.xlsx', '_blank')}
            >
              Download Excel Template
            </Button>
          </Box>

          <Typography sx={{ mb: 3, color: 'text.secondary' }}>
            Download our sample Excel template to see how placeholders work in practice.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            Excel Template Best Practices
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Use exact placeholder syntax:</strong> Include the curly braces {'{ }'} exactly as shown
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Case sensitive:</strong> Placeholders are case-sensitive (buyer.firstName vs buyer.FirstName)
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Single cell per placeholder:</strong> Put only one placeholder per Excel cell
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Formatting preserved:</strong> Cell formatting (currency, dates) will be maintained
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Test with sample data:</strong> Upload and test your template with real prospect data
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              • <strong>Backup templates:</strong> Keep original copies before uploading
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            Example Excel Template
          </Typography>

          <Paper sx={{ p: 2, backgroundColor: 'grey.50', fontFamily: 'monospace' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A1: PURCHASE AGREEMENT
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A3: Buyer Name: {'{buyer.fullName}'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A4: Buyer Phone: {'{buyer.phone}'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A5: Property Address: {'{property.fullAddress}'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A6: Purchase Price: {'{deal.totalPrice}'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cell A8: Date: {'{deal.createdDate}'}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: 'customColors.cardBackground' }}>
        <Button onClick={onClose} variant="contained">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormTemplateGuide;
