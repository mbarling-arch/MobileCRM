import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, IconButton, Chip, CircularProgress, Button } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Download as DownloadIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import AddDocumentDialog from '../AddDocumentDialog';

const DocumentsTab = ({ prospectId, userProfile, isDeal, context }) => {
  const [documents, setDocuments] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const collectionName = isDeal ? 'deals' : 'prospects';
    const q = query(collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
        setLoading(false);
      },
      () => {
        setDocuments([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userProfile?.companyId, prospectId, isDeal]);

  const documentCategories = [
    { id: 'home-documents', name: 'Home Documents' },
    { id: 'customer-documents', name: 'Customer Documents' },
    { id: 'credit-documents', name: 'Credit Application Documents' },
    { id: 'income-documents', name: 'Income Documents' },
    { id: 'property-documents', name: 'Property Documents' },
    { id: 'closing-documents', name: 'Closing Documents' },
    { id: 'other-documents', name: 'Other Documents' }
  ];

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDeleteDocument = async (docId) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const collectionName = isDeal ? 'deals' : 'prospects';
        await deleteDoc(doc(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents', docId));
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadDocument = (document) => {
    if (document.url) {
      // Open PDF in new tab for viewing/downloading
      window.open(document.url, '_blank');
    } else {
      alert('Document URL not available');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, flex: 1, textAlign: 'center' }}>
          Document Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setDocumentDialogOpen(true)}
          startIcon={<UploadIcon />}
        >
          Upload Document
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Total Documents:
          </Typography>
          <Chip label={documents.length} color="primary" size="small" />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : documentCategories.every((category) => documents.filter((doc) => doc.category === category.id).length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'customColors.cardBackground' }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
            No documents available
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Upload new documents using the button above.
          </Typography>
        </Paper>
      ) : (
        documentCategories.map((category) => (
          <Accordion
            key={category.id}
            expanded={expandedCategories[category.id] || false}
            onChange={() => handleCategoryToggle(category.id)}
            sx={{
              backgroundColor: 'customColors.calendarHeaderBackground',
              border: '1px solid',
              borderColor: 'customColors.calendarBorder',
              '&:before': { display: 'none' },
              mb: 1
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
              sx={{
                backgroundColor: 'customColors.tableRowBackground',
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2
                }
              }}
            >
              <Typography sx={{ color: 'text.primary', fontWeight: 600, flex: 1 }}>
                {category.name}
              </Typography>
              <Chip
                label={documents.filter(doc => doc.category === category.id).length}
                size="small"
                color="secondary"
              />
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <List>
                {documents.filter(doc => doc.category === category.id).map((document) => (
                  <ListItem
                    key={document.id}
                    sx={{
                      backgroundColor: 'customColors.tableRowBackground',
                      mb: 1,
                      borderRadius: 1,
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          {document.name}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                          Uploaded: {document.createdAt ? new Date(document.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                        </Typography>
                      }
                    />
                    <IconButton
                      onClick={() => handleDownloadDocument(document)}
                      sx={{ color: 'primary.main' }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDocument(document.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
                {documents.filter(doc => doc.category === category.id).length === 0 && (
                  <ListItem sx={{ backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                          No documents in this category
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {documentCategories.map((category) => (
        <Accordion
          key={category.id}
          expanded={expandedCategories[category.id] || false}
          onChange={() => handleCategoryToggle(category.id)}
          sx={{
            backgroundColor: 'customColors.calendarHeaderBackground',
            border: '1px solid',
            borderColor: 'customColors.calendarBorder',
            '&:before': { display: 'none' },
            mb: 1
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
            sx={{
              backgroundColor: 'customColors.tableRowBackground',
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                gap: 2
              }
            }}
          >
            <Typography sx={{ color: 'text.primary', fontWeight: 600, flex: 1 }}>
              {category.name}
            </Typography>
            <Chip
              label={documents.filter(doc => doc.category === category.id).length}
              size="small"
              color="secondary"
            />
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {documents.filter(doc => doc.category === category.id).map((document) => (
                <ListItem
                  key={document.id}
                  sx={{
                    backgroundColor: 'customColors.tableRowBackground',
                    mb: 1,
                    borderRadius: 1,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        {document.name}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        Uploaded: {document.createdAt ? new Date(document.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </Typography>
                    }
                  />
                  <IconButton
                    onClick={() => handleDownloadDocument(document)}
                    sx={{ color: 'primary.main' }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteDocument(document.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
              {documents.filter(doc => doc.category === category.id).length === 0 && (
                <ListItem sx={{ backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                        No documents in this category
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      <AddDocumentDialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        companyId={userProfile?.companyId}
        docId={prospectId}
        docType={isDeal ? "deals" : "prospects"}
      />
    </Box>
  );
};

export default DocumentsTab;