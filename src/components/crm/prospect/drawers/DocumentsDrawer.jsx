import React from 'react';
import { Drawer, Box, Typography, Stack, IconButton, TextField, Button, Paper, Chip, MenuItem } from '@mui/material';
import { Close as CloseIcon, Upload as UploadIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';

export const DocumentsDrawer = ({
  open,
  onClose,
  documents,
  uploadingDocs,
  uploading,
  fileInputRef,
  documentCategories,
  handleFileSelect,
  updateUploadDoc,
  removeUploadDoc,
  handleUploadDocuments,
  handleDeleteDocument,
  handleDownloadDocument,
  buyerName
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Documents</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                {buyerName}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Upload Section */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files to Upload
            </Button>
          </Box>
        </Box>

        {/* Documents to Upload */}
        {uploadingDocs.length > 0 && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover' }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>
              Ready to Upload ({uploadingDocs.length})
            </Typography>
            <Stack spacing={1.5}>
              {uploadingDocs.map((doc, index) => (
                <Paper key={index} sx={{ p: 1.5, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        📄 {doc.file.name}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => removeUploadDoc(index)}
                        sx={{ color: 'error.main' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      required
                      label="Document Name"
                      value={doc.name}
                      onChange={(e) => updateUploadDoc(index, 'name', e.target.value)}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Category"
                      value={doc.category}
                      onChange={(e) => updateUploadDoc(index, 'category', e.target.value)}
                      select
                      size="small"
                    >
                      {documentCategories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Paper>
              ))}
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleUploadDocuments}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${uploadingDocs.length} Document${uploadingDocs.length !== 1 ? 's' : ''}`}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Uploaded Documents List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 2, color: 'text.secondary' }}>
            All Documents ({documents.length})
          </Typography>
          <Stack spacing={1.5}>
            {documents.map((document) => (
              <Paper
                key={document.id}
                sx={{ 
                  p: 2,
                  backgroundColor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 14 }}>
                        {document.name}
                      </Typography>
                      <Chip
                        label={document.category}
                        size="small"
                        sx={{ mt: 0.5, fontSize: 11, height: 20 }}
                      />
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadDocument(document)}
                        sx={{ color: 'primary.main' }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDocument(document.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  {document.description && (
                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                      {document.description}
                    </Typography>
                  )}
                  <Typography sx={{ color: 'text.disabled', fontSize: 11 }}>
                    Uploaded: {document.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
            {documents.length === 0 && (
              <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                No documents yet. Upload some above!
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

