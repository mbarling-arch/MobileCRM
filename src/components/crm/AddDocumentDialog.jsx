import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Box, Stack, Typography, Button, TextField, MenuItem } from '@mui/material';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function AddDocumentDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: '',
    type: 'document',
    category: 'Customer Documents',
    description: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        type: initial.type || 'document',
        category: initial.category || 'Customer Documents',
        description: initial.description || ''
      });
      setUploadedFile(initial.file || null);
    } else {
      setForm({
        name: '',
        type: 'document',
        category: 'Customer Documents',
        description: ''
      });
      setUploadedFile(null);
    }
    setUploading(false);
  }, [initial, open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (allow PDFs, docs, images, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file (PDF, DOC, DOCX, TXT, RTF, Images)');
      return;
    }

    // Validate file size (max 25MB for documents)
    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return;
    }

    setUploading(true);
    try {
      const companyId = 'demo-company'; // We'll get this from userProfile in production
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${companyId}/documents/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setUploadedFile({
        name: file.name,
        url: downloadURL,
        path: `companies/${companyId}/documents/${fileName}`,
        size: file.size,
        type: file.type
      });

      // Auto-set document name if not provided
      if (!form.name.trim()) {
        setForm(f => ({ ...f, name: file.name.replace(/\.[^/.]+$/, '') }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
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
    if (!form.name.trim() || !uploadedFile) {
      alert('Please provide a document name and upload a file');
      return;
    }

    const formData = {
      ...form,
      file: uploadedFile
    };

    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
          {initial ? 'Edit Document' : 'Upload Document'}
        </Typography>

        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Document Name"
              value={form.name}
              onChange={handleChange('name')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Document Type"
              value={form.type}
              onChange={handleChange('type')}
              select
              sx={dialogFieldSx}
            >
              <MenuItem value="document">Document</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="policy">Policy</MenuItem>
              <MenuItem value="form">Form</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Category"
              value={form.category}
              onChange={handleChange('category')}
              select
              sx={dialogFieldSx}
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

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description (Optional)"
            value={form.description}
            onChange={handleChange('description')}
            sx={dialogFieldSx}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
              Upload File *
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {!uploadedFile ? (
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  color: '#90caf9',
                  borderColor: 'rgba(144, 202, 249, 0.5)',
                  '&:hover': { borderColor: '#90caf9' }
                }}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography sx={{ color: 'white', flexGrow: 1 }}>
                  📄 {uploadedFile.name}
                  <br />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                  </Typography>
                </Typography>
                <Button
                  size="small"
                  onClick={() => window.open(uploadedFile.url, '_blank')}
                  sx={{ color: '#90caf9' }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  onClick={handleRemoveFile}
                  sx={{ color: '#f44336' }}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!form.name.trim() || !uploadedFile || uploading}
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
          >
            {initial ? 'Save Changes' : 'Upload Document'}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

const dialogFieldSx = {
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiInputBase-input': { color: 'white' },
  '& .MuiSelect-select': { color: 'white' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' }
};

export default AddDocumentDialog;
