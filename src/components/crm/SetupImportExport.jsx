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
import { parseCSV, exportToCSV, downloadCSV } from '../../utils/csvUtils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function SetupImportExport({ open, onClose, type, companyId, data, locations, onImportComplete }) {
  const [activeTab, setActiveTab] = useState('import');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const config = {
    locations: {
      title: 'Locations',
      templateFile: '/locations-import-template.csv',
      headers: ['locationId', 'name', 'address', 'city', 'state', 'zipCode', 'phone', 'manager', 'status'],
      requiredFields: ['name'],
      collectionPath: (companyId) => collection(db, 'companies', companyId, 'locations')
    },
    users: {
      title: 'Users',
      templateFile: '/users-import-template.csv',
      headers: ['location', 'firstName', 'lastName', 'email', 'role', 'password'],
      requiredFields: ['location', 'firstName', 'lastName', 'email', 'role', 'password'],
      collectionPath: (companyId, locationId) => collection(db, 'companies', companyId, 'locations', locationId, 'users')
    },
    roles: {
      title: 'Roles',
      templateFile: '/roles-import-template.csv',
      headers: ['name', 'displayName', 'description', 'pages'],
      requiredFields: ['name', 'displayName', 'pages'],
      collectionPath: (companyId) => collection(db, 'companies', companyId, 'roles')
    }
  };

  const currentConfig = config[type];

  const validateData = (item, rowNumber) => {
    const errors = [];
    
    currentConfig.requiredFields.forEach(field => {
      if (!item[field] || !item[field].trim()) {
        errors.push(`Row ${rowNumber}: ${field} is required`);
      }
    });

    // Special validation for roles
    if (type === 'roles') {
      if (item.pages) {
        const pages = item.pages.split(',').map(p => p.trim());
        if (pages.length === 0) {
          errors.push(`Row ${rowNumber}: At least one page must be specified`);
        }
      }
    }

    return errors;
  };

  const transformData = (csvItem) => {
    if (type === 'locations') {
      return {
        locationId: csvItem.locationId?.trim() || '',
        name: csvItem.name?.trim() || '',
        address: csvItem.address?.trim() || '',
        city: csvItem.city?.trim() || '',
        state: csvItem.state?.trim() || '',
        zipCode: csvItem.zipCode?.trim() || '',
        phone: csvItem.phone?.trim() || '',
        manager: csvItem.manager?.trim() || '',
        status: csvItem.status?.trim() || 'active'
      };
    } else if (type === 'users') {
      return {
        firstName: csvItem.firstName?.trim() || '',
        lastName: csvItem.lastName?.trim() || '',
        displayName: `${csvItem.firstName?.trim() || ''} ${csvItem.lastName?.trim() || ''}`.trim(),
        email: csvItem.email?.trim() || '',
        role: csvItem.role?.trim() || 'sales',
        location: csvItem.location?.trim() || '',
        password: csvItem.password?.trim() || ''
      };
    } else if (type === 'roles') {
      return {
        name: csvItem.name?.trim().toLowerCase().replace(/\s+/g, '_') || '',
        displayName: csvItem.displayName?.trim() || '',
        description: csvItem.description?.trim() || '',
        pages: csvItem.pages ? csvItem.pages.split(',').map(p => p.trim()) : [],
        isCustomRole: true
      };
    }
    return {};
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setErrors([]);
    setImportResults(null);

    try {
      const text = await file.text();
      const { data: csvData, errors: parseErrors } = parseCSV(text);

      if (parseErrors.length > 0) {
        setErrors(parseErrors.map(e => `Row ${e.row}: ${e.message}`));
        setImporting(false);
        return;
      }

      // Validate all items
      const validationErrors = [];
      csvData.forEach((item, index) => {
        const rowErrors = validateData(item, index + 2);
        validationErrors.push(...rowErrors);
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setImporting(false);
        return;
      }

      // Import to Firestore
      let successCount = 0;
      let failCount = 0;
      const importErrors = [];

      for (let i = 0; i < csvData.length; i++) {
        try {
          const csvItem = csvData[i];
          const itemData = transformData(csvItem);

          if (type === 'users') {
            // Find location by name
            const location = locations.find(l => 
              l.name.toLowerCase() === itemData.location.toLowerCase()
            );

            if (!location) {
              failCount++;
              importErrors.push(`Row ${i + 2}: Location "${itemData.location}" not found`);
              continue;
            }

            // Create Firebase Auth user
            const { getAuth, createUserWithEmailAndPassword, updatePassword } = await import('firebase/auth');
            const auth = getAuth();
            const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
            
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, itemData.email, itemData.password || tempPassword);
              
              await addDoc(currentConfig.collectionPath(companyId, location.id), {
                firebaseUid: userCredential.user.uid,
                displayName: itemData.displayName,
                email: itemData.email,
                role: itemData.role,
                status: 'active',
                createdAt: serverTimestamp(),
                imported: true,
                importedAt: serverTimestamp()
              });

              successCount++;
            } catch (authError) {
              // If user already exists, just create the profile
              if (authError.code === 'auth/email-already-in-use') {
                await addDoc(currentConfig.collectionPath(companyId, location.id), {
                  displayName: itemData.displayName,
                  email: itemData.email,
                  role: itemData.role,
                  status: 'active',
                  createdAt: serverTimestamp(),
                  imported: true,
                  importedAt: serverTimestamp()
                });
                successCount++;
              } else {
                throw authError;
              }
            }
          } else {
            // For locations and roles
            await addDoc(currentConfig.collectionPath(companyId), {
              ...itemData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              imported: true,
              importedAt: serverTimestamp()
            });
            successCount++;
          }
        } catch (error) {
          failCount++;
          importErrors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setImportResults({
        total: csvData.length,
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

    event.target.value = '';
  };

  const handleExport = () => {
    try {
      // Transform data for export
      const exportData = data.map(item => {
        if (type === 'roles' && Array.isArray(item.pages)) {
          return {
            ...item,
            pages: item.pages.join(',')
          };
        } else if (type === 'users') {
          const firstName = item.displayName?.split(' ')[0] || '';
          const lastName = item.displayName?.split(' ').slice(1).join(' ') || '';
          return {
            location: item.locationName || '',
            firstName,
            lastName,
            email: item.email,
            role: item.role,
            password: '********'
          };
        }
        return item;
      });

      const csvContent = exportToCSV(exportData, currentConfig.headers);
      const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      setErrors([`Export failed: ${error.message}`]);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(currentConfig.templateFile, '_blank');
  };

  const handleClose = () => {
    setActiveTab('import');
    setImportResults(null);
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import/Export {currentConfig.title}</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label={`Import ${currentConfig.title}`} value="import" icon={<UploadIcon />} iconPosition="start" />
          <Tab label={`Export ${currentConfig.title}`} value="export" icon={<DownloadIcon />} iconPosition="start" />
        </Tabs>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV file to import {type}. Make sure your CSV matches the template format.
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
                  id={`csv-upload-${type}`}
                  type="file"
                  onChange={handleImport}
                  disabled={importing}
                />
                <label htmlFor={`csv-upload-${type}`}>
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
                    Importing {type}...
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
                  {type === 'locations' && (
                    <>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• 'name' is required"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• Valid statuses: active, inactive"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    </>
                  )}
                  {type === 'users' && (
                    <>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• 'location', 'firstName', 'lastName', 'email', 'role', and 'password' are required"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• 'location' must match an existing location name exactly"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• Passwords must meet security requirements (minimum 6 characters)"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    </>
                  )}
                  {type === 'roles' && (
                    <>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• 'name', 'displayName', and 'pages' are required"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText
                          primary="• 'pages' should be comma-separated page IDs"
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Export all your {type} to a CSV file. You can use this to backup your data or migrate to another system.
            </Alert>

            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DownloadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Ready to Export
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {data.length} {type} will be exported
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={data.length === 0}
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

export default SetupImportExport;

