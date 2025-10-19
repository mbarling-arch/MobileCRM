import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete as DeleteIcon, Upload as UploadIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { doc, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PropertyDetailsTab = ({ prospectId, userProfile, context, isDeal }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const propertyDocuments = [
    'Survey',
    'Site Inspection',
    'Written Bids',
    'Contract/Deed',
    'Park Lease/PPOA',
    'Title Commitment',
    'Appraisal'
  ];

  // Load property documents
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const collectionName = isDeal ? 'deals' : 'prospects';
    const docsRef = collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents');
    const q = query(docsRef, where('category', '==', 'Property Documents'));
    
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
        category: 'Property Documents',
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

        {/* Right Container - 25% - Property Documents */}
        <Paper sx={{ flex: '0 0 25%', p: 2, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <List sx={{ py: 0 }}>
            {propertyDocuments.map((docType) => {
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
              id="property-doc-upload"
            />
            <label htmlFor="property-doc-upload">
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

export default PropertyDetailsTab;
