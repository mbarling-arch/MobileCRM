import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Box, Stack, Typography, Button, TextField, MenuItem, Chip, Paper, useTheme } from '@mui/material';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Quick document options for each category
const QUICK_DOCUMENTS = {
  'Customer Documents': [
    'Driver License',
    'Co Buyer Driver License',
    'Buyer Social',
    'Co Buyer Social',
    'Interview Sheet'
  ],
  'Credit Application Documents': [
    'Credit Application',
    'Credit Report',
    'Calculator Worksheet',
    'Signed Bank Disclosures',
    'Arbitration Agreement',
    'Special Deposit Agreement',
    'Credit Authorization'
  ],
  'Income Documents': [
    'Buyer Paystubs',
    'Co Buyer Pay Stubs',
    'W2\'s',
    'Tax Returns',
    'Bank Statements'
  ]
};

function AddDocumentDialog({ open, onClose, companyId, docId, docType }) {
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const updateDocument = (index, field, value) => {
    setDocuments(prev => prev.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  useEffect(() => {
    if (open) {
      setDocuments([]);
      setUploading(false);
    }
  }, [open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file types (allow PDFs, docs, images, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    const validFiles = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported type. Please use PDF, Word, Text, or Image files.`);
        continue;
      }

      // Validate file size (max 25MB for documents)
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 25MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create document entries for each valid file
    const newDocuments = validFiles.map(file => ({
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      category: 'Customer Documents',
      description: '',
      file: file
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleRemoveFile = async () => {
    if (uploadedFile && uploadedFile.path) {
      try {
        const fileRef = ref(storage, uploadedFile.path);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    // Check that all documents have names
    const invalidDocs = documents.filter(doc => !doc.name.trim());
    if (invalidDocs.length > 0) {
      alert('Please provide names for all documents');
      return;
    }

    setUploading(true);
    try {
      const prospectId = docId;

      // Upload each document
      for (const doc of documents) {
        const fileName = `${Date.now()}_${doc.file.name}`;
        const storageRef = ref(storage, `companies/${companyId}/${docType}/${prospectId}/documents/${fileName}`);

        await uploadBytes(storageRef, doc.file);
        const downloadURL = await getDownloadURL(storageRef);

        const docData = {
          name: doc.name,
          category: doc.category,
          description: doc.description,
          url: downloadURL,
          type: doc.file.type,
          size: doc.file.size,
          createdAt: serverTimestamp(),
          createdBy: 'system' // We'll update this when we have user info
        };

        await addDoc(collection(db, 'companies', companyId, docType, prospectId, 'documents'), docData);
      }

      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ 
        sx: { 
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        } 
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
          Upload Documents
        </Typography>

        <Stack spacing={3}>
          {/* File Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
              Select Files *
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                color: theme.palette.text.primary,
                cursor: 'pointer'
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Select multiple files at once. Supported: PDF, Word, Text, Images (max 25MB each)
            </Typography>
          </Box>

          {/* Document List */}
          {documents.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                Documents to Upload ({documents.length})
              </Typography>

              <Stack spacing={2}>
                {documents.map((doc, index) => (
                  <Paper key={index} sx={{ p: 2, backgroundColor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          📄 {doc.file.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                          sx={{ color: 'error.main', minWidth: 'auto', p: 0.5 }}
                        >
                          ✕
                        </Button>
                      </Box>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          required
                          label="Document Name"
                          value={doc.name}
                          onChange={(e) => updateDocument(index, 'name', e.target.value)}
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Category"
                          value={doc.category}
                          onChange={(e) => updateDocument(index, 'category', e.target.value)}
                          select
                          size="small"
                        >
                          <MenuItem value="Customer Documents">Customer Documents</MenuItem>
                          <MenuItem value="Credit Application Documents">Credit Application Documents</MenuItem>
                          <MenuItem value="Income Documents">Income Documents</MenuItem>
                          <MenuItem value="Approval Documents">Approval Documents</MenuItem>
                          <MenuItem value="Condition Documents">Condition Documents</MenuItem>
                          <MenuItem value="Home Documents">Home Documents</MenuItem>
                          <MenuItem value="Closing Documents">Closing Documents</MenuItem>
                          <MenuItem value="Funding Documents">Funding Documents</MenuItem>
                          <MenuItem value="Construction Documents">Construction Documents</MenuItem>
                        </TextField>
                      </Stack>

                      {/* Quick Document Selection for this document */}
                      {QUICK_DOCUMENTS[doc.category] && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                            Quick Select:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {QUICK_DOCUMENTS[doc.category].map((docName) => (
                              <Chip
                                key={docName}
                                label={docName}
                                onClick={() => updateDocument(index, 'name', docName)}
                                color={doc.name === docName ? 'primary' : 'default'}
                                variant={doc.name === docName ? 'filled' : 'outlined'}
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        rows={1}
                        label="Description (Optional)"
                        value={doc.description}
                        onChange={(e) => updateDocument(index, 'description', e.target.value)}
                        size="small"
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || documents.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${documents.length} Document${documents.length !== 1 ? 's' : ''}`}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default AddDocumentDialog;
