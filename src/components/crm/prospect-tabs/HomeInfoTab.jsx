import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Stack, TextField, Grid, Chip, Tabs, Tab, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Home as HomeIcon, Delete as DeleteIcon, Upload as UploadIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { doc, onSnapshot, collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const HomeInfoTab = ({ prospectId, userProfile, context, isDeal }) => {
  const { prospect } = context;
  const [emcData, setEmcData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const homeDocuments = [
    'Factory Quote',
    'Customer Verification',
    'PO Request',
    'Factory Invoice',
    'Floor Plan',
    'Trade PO',
    'Trade Title'
  ];

  // Listen to real-time updates of the prospect/deal document
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const collectionName = isDeal ? 'deals' : 'prospects';
    const docRef = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.emc) {
          setEmcData(data.emc);
        } else {
          setEmcData(null);
        }
      }
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, prospectId, isDeal]);

  // Load home documents
  useEffect(() => {
    const loadHomeDocuments = async () => {
      if (!userProfile?.companyId || !prospectId) return;
      
      try {
        const collectionName = isDeal ? 'deals' : 'prospects';
        const docsRef = collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents');
        const q = query(docsRef, where('category', '==', 'Home Documents'));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading home documents:', error);
      }
    };

    loadHomeDocuments();
    
    // Set up real-time listener
    const collectionName = isDeal ? 'deals' : 'prospects';
    const docsRef = collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents');
    const q = query(docsRef, where('category', '==', 'Home Documents'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, prospectId, isDeal]);

  const getDocumentByType = (docType) => {
    return documents.find(doc => doc.name === docType);
  };

  const handleDocumentClick = (docType) => {
    const existingDoc = getDocumentByType(docType);
    if (existingDoc && existingDoc.url) {
      window.open(existingDoc.url, '_blank');
    } else {
      setSelectedDocType(docType);
      setUploadDialogOpen(true);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userProfile?.companyId || !prospectId) return;

    setUploading(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${userProfile.companyId}/${collectionName}/${prospectId}/documents/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const docData = {
        name: selectedDocType,
        category: 'Home Documents',
        url: downloadURL,
        type: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system'
      };

      await addDoc(collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents'), docData);
      
      setUploadDialogOpen(false);
      setSelectedDocType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      await deleteDoc(doc(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents', docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const orderType = emcData?.orderType; // 'stock' or 'special'
  const homeDetails = emcData?.homeDetails;

  // If there's EMC data, show home information
  if (emcData && homeDetails) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Top Row - 75% Left (Blank) + 25% Right (Documents) */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Container - 75% - Blank for now */}
          <Paper sx={{ flex: '1 1 75%', p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
            <Typography sx={{ color: 'text.disabled', fontSize: 14, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
              Reserved for future content
            </Typography>
          </Paper>

          {/* Right Container - 25% - Home Documents */}
          <Paper sx={{ flex: '0 0 25%', p: 2, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
            <List sx={{ py: 0 }}>
              {homeDocuments.map((docType) => {
                const existingDoc = getDocumentByType(docType);
                return (
                  <ListItem
                    key={docType}
                    sx={{
                      px: 0,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      onClick={() => handleDocumentClick(docType)}
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': {
                          '& .MuiTypography-root': {
                            color: 'primary.main'
                          }
                        }
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 18, color: existingDoc ? 'success.main' : 'text.disabled' }} />
                      <ListItemText
                        primary={docType}
                        primaryTypographyProps={{
                          fontSize: 13,
                          fontWeight: existingDoc ? 600 : 400,
                          color: existingDoc ? 'text.primary' : 'text.secondary',
                          sx: {
                            textDecoration: existingDoc ? 'underline' : 'none',
                            cursor: 'pointer'
                          }
                        }}
                      />
                    </Box>
                    {existingDoc && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDocument(existingDoc.id)}
                        sx={{ color: 'error.main', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Box>

        {/* Existing Home Information Container */}
        <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <HomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Selected Home
            </Typography>
            <Chip 
              label={orderType === 'stock' ? 'Stock Pending' : 'Special Order'} 
              color={orderType === 'stock' ? 'warning' : 'info'}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Stack>

        {orderType === 'stock' ? (
          <>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                mb: 3,
                '& .MuiTab-root': { color: 'text.secondary' },
                '& .MuiTab-root.Mui-selected': { color: 'text.primary' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
              }}
            >
              <Tab label="Home Information" />
              <Tab label="Build Information" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Factory" value={homeDetails.factory || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Type" value={homeDetails.type || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Model" value={homeDetails.model || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Size" value={homeDetails.size || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Year" value={homeDetails.year || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Bedrooms" value={homeDetails.bedrooms || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Bathrooms" value={homeDetails.bathrooms || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Square Feet" value={homeDetails.squareFeet || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Invoice" value={homeDetails.invoice ? `$${homeDetails.invoice}` : ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mark Up %" value={homeDetails.markupPercent ? `${homeDetails.markupPercent}%` : ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Sales Price" 
                    value={homeDetails.salesPrice ? `$${homeDetails.salesPrice}` : ''} 
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { fontWeight: 600, color: 'success.main' } }}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Full build specifications are stored in inventory. View the selected home in Inventory Management for complete details.
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Factory" value={homeDetails.factory || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Model" value={homeDetails.model || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Size" value={homeDetails.size || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="B/B (Bed/Bath)" value={homeDetails.bedBath || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Square Feet" value={homeDetails.squareFeet || ''} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Upload {selectedDocType}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
              Select a file to upload for this document
            </Typography>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="home-doc-upload"
            />
            <label htmlFor="home-doc-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={uploading}
                sx={{ px: 4, py: 1.5 }}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
          </Box>
          
          <Typography sx={{ color: 'text.disabled', fontSize: 12, textAlign: 'center' }}>
            Accepted formats: PDF, Word, Images (JPG, PNG)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setUploadDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    );
  }

  // No EMC data
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Row - 75% Left (Blank) + 25% Right (Documents) */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Container - 75% - Blank for now */}
        <Paper sx={{ flex: '1 1 75%', p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <Typography sx={{ color: 'text.disabled', fontSize: 14, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
            Reserved for future content
          </Typography>
        </Paper>

        {/* Right Container - 25% - Home Documents */}
        <Paper sx={{ flex: '0 0 25%', p: 2, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
            Home Documents
          </Typography>
          <List sx={{ py: 0 }}>
            {homeDocuments.map((docType) => {
              const existingDoc = getDocumentByType(docType);
              return (
                <ListItem
                  key={docType}
                  sx={{
                    px: 0,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box
                    onClick={() => handleDocumentClick(docType)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        '& .MuiTypography-root': {
                          color: 'primary.main'
                        }
                      }
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 18, color: existingDoc ? 'success.main' : 'text.disabled' }} />
                    <ListItemText
                      primary={docType}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: existingDoc ? 600 : 400,
                        color: existingDoc ? 'text.primary' : 'text.secondary',
                        sx: {
                          textDecoration: existingDoc ? 'underline' : 'none',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  </Box>
                  {existingDoc && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDocument(existingDoc.id)}
                      sx={{ color: 'error.main', p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>

      {/* No Home Selected Message */}
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'customColors.cardBackground' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          No Home Selected
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Please select a home using the "Build Home" button to view home information here.
        </Typography>
      </Paper>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Upload {selectedDocType}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
              Select a file to upload for this document
            </Typography>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="home-doc-upload"
            />
            <label htmlFor="home-doc-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={uploading}
                sx={{ px: 4, py: 1.5 }}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
          </Box>
          
          <Typography sx={{ color: 'text.disabled', fontSize: 12, textAlign: 'center' }}>
            Accepted formats: PDF, Word, Images (JPG, PNG)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setUploadDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeInfoTab;

