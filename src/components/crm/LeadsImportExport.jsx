import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { parseCSV, exportToCSV, downloadCSV, validateLeadData, transformLeadForFirestore } from '../../utils/csvUtils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function LeadsImportExport({ open, onClose, companyId, locationId, leads, onImportComplete }) {
  const [activeTab, setActiveTab] = useState('import');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setErrors([]);
    setImportResults(null);

    try {
      const text = await file.text();
      const { data, errors: parseErrors } = parseCSV(text);

      if (parseErrors.length > 0) {
        setErrors(parseErrors.map(e => `Row ${e.row}: ${e.message}`));
        setImporting(false);
        return;
      }

      // Validate all leads
      const validationErrors = [];
      data.forEach((lead, index) => {
        const rowErrors = validateLeadData(lead, index + 2); // +2 because of header and 0-index
        validationErrors.push(...rowErrors);
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setImporting(false);
        return;
      }

      // Import leads to Firestore
      let successCount = 0;
      let failCount = 0;
      const importErrors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const csvLead = data[i];
          const leadData = transformLeadForFirestore(csvLead);

          await addDoc(collection(db, 'companies', companyId, 'locations', locationId, 'leads'), {
            ...leadData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            imported: true,
            importedAt: serverTimestamp()
          });

          successCount++;
        } catch (error) {
          failCount++;
          importErrors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setImportResults({
        total: data.length,
        success: successCount,
        failed: failCount
      });

      if (importErrors.length > 0) {
        setErrors(importErrors);
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setErrors([`Import failed: ${error.message}`]);
    } finally {
      setImporting(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleExport = () => {
    try {
      const headers = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'status',
        'source',
        'address',
        'city',
        'state',
        'zipCode',
        'notes',
        'estimatedValue',
        'preferredContactMethod',
        'followUpDate'
      ];

      const csvContent = exportToCSV(leads, headers);
      const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      setErrors([`Export failed: ${error.message}`]);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/leads-import-template.csv', '_blank');
  };

  const handleClose = () => {
    setActiveTab('import');
    setImportResults(null);
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import/Export Leads</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Import Leads" value="import" icon={<UploadIcon />} iconPosition="start" />
          <Tab label="Export Leads" value="export" icon={<DownloadIcon />} iconPosition="start" />
        </Tabs>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV file to import leads. Make sure your CSV matches the template format.
            </Alert>

            <Stack spacing={3}>
              {/* Download Template */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Step 1: Download Template
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  onClick={handleDownloadTemplate}
                  fullWidth
                >
                  Download CSV Template
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Use this template to format your data correctly
                </Typography>
              </Box>

              <Divider />

              {/* Upload File */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Step 2: Upload Your CSV
                </Typography>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={handleImport}
                  disabled={importing}
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={importing}
                    fullWidth
                  >
                    {importing ? 'Importing...' : 'Choose CSV File'}
                  </Button>
                </label>
              </Box>

              {importing && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Importing leads...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {/* Import Results */}
              {importResults && (
                <Alert severity="success" icon={<CheckIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Import Complete!
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Chip
                      label={`${importResults.success} Successful`}
                      color="success"
                      size="small"
                    />
                    {importResults.failed > 0 && (
                      <Chip
                        label={`${importResults.failed} Failed`}
                        color="error"
                        size="small"
                      />
                    )}
                  </Stack>
                </Alert>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <Alert severity="error" icon={<ErrorIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    {errors.length} Error{errors.length > 1 ? 's' : ''} Found:
                  </Typography>
                  <List dense>
                    {errors.slice(0, 10).map((error, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText
                          primary={error}
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                    {errors.length > 10 && (
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary={`... and ${errors.length - 10} more errors`}
                          primaryTypographyProps={{ variant: 'caption', fontStyle: 'italic' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Alert>
              )}

              {/* Format Guide */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  CSV Format Requirements:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary="• First row must be headers"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary="• firstName and lastName are required"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary="• Valid statuses: New, Contacted, Qualified, Nurturing, Lost, Converted"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary="• Dates should be in YYYY-MM-DD format"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Export all your leads to a CSV file. You can use this to backup your data or migrate to another system.
            </Alert>

            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DownloadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Ready to Export
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {leads.length} lead{leads.length !== 1 ? 's' : ''} will be exported
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={leads.length === 0}
                  sx={{ mt: 3 }}
                >
                  Download CSV File
                </Button>
              </Box>

              {errors.length > 0 && (
                <Alert severity="error">
                  <Typography variant="subtitle2" gutterBottom>
                    Export Error:
                  </Typography>
                  {errors.map((error, index) => (
                    <Typography key={index} variant="caption" display="block">
                      {error}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LeadsImportExport;

