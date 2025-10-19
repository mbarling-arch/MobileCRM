import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

export const DueDiligenceUploadModal = ({
  open,
  onClose,
  documentType,
  uploading,
  fileInputRef,
  onFileSelect
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
          Upload {documentType}
        </Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
            Select a file to upload for this document
          </Typography>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            id="dd-doc-upload"
          />
          <label htmlFor="dd-doc-upload">
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
      </Box>
      
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
};

