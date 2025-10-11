import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Article as ArticleIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Help as HelpIcon,
  Assignment as ApplicationIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  MonetizationOn as FundingIcon,
  Gavel as ClosingIcon,
  MoveToInbox as MoveInIcon
} from '@mui/icons-material';
import { useUser } from '../../hooks/useUser';
import UnifiedLayout from '../UnifiedLayout';
import FormTemplateGuide from './FormTemplateGuide';
import { db, storage } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const FORM_CATEGORIES = [
  {
    id: 'crm',
    name: 'CRM Documents',
    icon: ApplicationIcon,
    color: '#8C57FF',
    description: 'Core CRM documents: Fair Credit Auth, EMC Contract, Deposit Receipts, Deal Builder, Application, Budget Calculator, State Docs, Deposit Pack',
    subcategories: [
      'Fair Credit Auth',
      'EMC Contract',
      'Deposit Receipts',
      'Deal Builder',
      'Application',
      'Budget Calculator',
      'State Docs',
      'Deposit Pack'
    ]
  },
  {
    id: 'application',
    name: 'Application Docs',
    icon: ApplicationIcon,
    color: '#1976d2',
    description: 'Loan applications, credit applications, and application-related forms'
  },
  {
    id: 'home',
    name: 'Home Docs',
    icon: HomeIcon,
    color: '#2e7d32',
    description: 'Property-related documents and home inspection forms'
  },
  {
    id: 'bank',
    name: 'Bank Docs',
    icon: BankIcon,
    color: '#ed6c02',
    description: 'Banking documents, account opening forms, and financial statements'
  },
  {
    id: 'funding',
    name: 'Funding Docs',
    icon: FundingIcon,
    color: '#f57c00',
    description: 'Funding letters, wire instructions, and funding-related documents'
  },
  {
    id: 'closing',
    name: 'Closing Docs',
    icon: ClosingIcon,
    color: '#9c27b0',
    description: 'Settlement statements, closing disclosures, and title documents'
  },
  {
    id: 'movein',
    name: 'Move In Docs',
    icon: MoveInIcon,
    color: '#0288d1',
    description: 'Lease agreements, move-in checklists, and occupancy forms'
  }
];

function Forms() {
  const { userProfile, user } = useUser();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // Track which category is uploading
  const [guideOpen, setGuideOpen] = useState(false);
  const [uploadDialog, setUploadDialog] = useState({
    open: false,
    category: null,
    subcategory: '',
    form: { name: '', description: '', file: null }
  });

  useEffect(() => {
    if (userProfile?.companyId) {
      loadForms();
    } else if (user && !userProfile) {
      // User is authenticated but profile not loaded yet
      // Keep loading state until profile loads
    } else {
      // If no userProfile after authentication, still stop loading after a short delay
      setTimeout(() => setLoading(false), 1000);
    }
  }, [userProfile, user]);

  const loadForms = async () => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const formsRef = collection(db, 'companies', userProfile.companyId, 'forms');
      const q = query(formsRef, orderBy('createdAt', 'desc'));

      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      const formsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
      // Set empty forms array on error to show "no forms" state
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event, categoryId, subcategory = '') => {
    const file = event.target.files[0];
    if (file) {
      setUploadDialog({
        open: true,
        category: FORM_CATEGORIES.find(cat => cat.id === categoryId),
        subcategory: subcategory,
        form: {
          name: subcategory || file.name.replace(/\.[^/.]+$/, ""), // Use subcategory name if provided
          description: '',
          file: file
        }
      });
    }
  };

  const handleUpload = async () => {
    const { form, category } = uploadDialog;
    if (!form.file || !form.name) {
      alert('Please fill in the form name and select a file.');
      return;
    }

    if (!userProfile?.companyId) {
      // Check if user needs to set up a company
      if (userProfile && !userProfile.companyId) {
        alert('You need to set up a company first before uploading forms. Please contact your administrator or set up a company in the company management section.');
      } else {
        alert('User profile not loaded properly. Please refresh the page and try again.');
      }
      return;
    }

    setUploading(category.id);
    try {
      // Add timeout to prevent hanging on network issues
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout - check your internet connection')), 30000)
      );

      // Upload file to storage with timeout
      const fileName = `${Date.now()}_${form.file.name}`;
      const storageRef = ref(storage, `companies/${userProfile.companyId}/forms/${fileName}`);

      const uploadPromise = uploadBytes(storageRef, form.file);
      await Promise.race([uploadPromise, timeoutPromise]);

      const downloadPromise = getDownloadURL(storageRef);
      const downloadURL = await Promise.race([downloadPromise, timeoutPromise]);

      // Save form metadata to Firestore with timeout
      const saveData = {
        name: form.name,
        category: category.name,
        subcategory: uploadDialog.subcategory || '',
        description: form.description,
        fileName: form.file.name,
        storagePath: storageRef.fullPath,
        downloadURL,
        fileSize: form.file.size,
        fileType: form.file.type,
        uploadedBy: userProfile.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const savePromise = addDoc(collection(db, 'companies', userProfile.companyId, 'forms'), saveData);
      await Promise.race([savePromise, timeoutPromise]);

      // Reset dialog and reload
      setUploadDialog({
        open: false,
        category: null,
        subcategory: '',
        form: { name: '', description: '', file: null }
      });
      loadForms();

      alert('Form uploaded successfully!');
    } catch (error) {
      console.error('Error uploading form:', error);
      alert('Error uploading form. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (form) => {
    if (!confirm(`Are you sure you want to delete "${form.name}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const storageRef = ref(storage, form.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'companies', userProfile.companyId, 'forms', form.id));

      loadForms();
      alert('Form deleted successfully!');
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    }
  };

  const handleDownload = (form) => {
    window.open(form.downloadURL, '_blank');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <PdfIcon />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <ArticleIcon />;
    return <DocumentIcon />;
  };

  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) acc[form.category] = [];
    acc[form.category].push(form);
    return acc;
  }, {});

  if (loading) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Form Management
          </Typography>
          <IconButton
            onClick={() => setGuideOpen(true)}
            size="small"
            sx={{ color: 'text.secondary' }}
            title="Template Guide"
          >
            <HelpIcon />
          </IconButton>
        </Box>

        <Typography sx={{ mb: 4, color: 'text.secondary' }}>
          Upload and manage form templates organized by document type. Click upload in any category to add forms directly.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FORM_CATEGORIES.map(category => {
            const categoryForms = groupedForms[category.name] || [];
            const IconComponent = category.icon;
            const isUploading = uploading === category.id;

            return (
              <Paper
                key={category.id}
                sx={{
                  p: 3,
                  backgroundColor: 'customColors.cardBackground',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconComponent sx={{ color: category.color, mr: 1.5, fontSize: 28 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {categoryForms.length} form{categoryForms.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Upload Button (for non-CRM categories) */}
                  {!category.subcategories && (
                    <Box>
                      <input
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        style={{ display: 'none' }}
                        id={`upload-${category.id}`}
                        type="file"
                        onChange={(e) => handleFileSelect(e, category.id)}
                      />
                      <label htmlFor={`upload-${category.id}`}>
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                          disabled={isUploading}
                          size="small"
                          sx={{
                            borderColor: category.color,
                            color: category.color,
                            '&:hover': {
                              borderColor: category.color,
                              backgroundColor: `${category.color}10`
                            }
                          }}
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {category.description}
                </Typography>

                {/* Subcategory Upload Buttons (for CRM Documents) */}
                {category.subcategories && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {category.subcategories.map((subcat) => {
                      const subcatForms = categoryForms.filter(f => f.subcategory === subcat);
                      const hasDocument = subcatForms.length > 0;
                      
                      return (
                        <Box key={subcat}>
                          <input
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            style={{ display: 'none' }}
                            id={`upload-${category.id}-${subcat.replace(/\s+/g, '-')}`}
                            type="file"
                            onChange={(e) => handleFileSelect(e, category.id, subcat)}
                          />
                          <label htmlFor={`upload-${category.id}-${subcat.replace(/\s+/g, '-')}`}>
                            <Button
                              variant={hasDocument ? 'contained' : 'outlined'}
                              component="span"
                              startIcon={<UploadIcon />}
                              size="small"
                              sx={{
                                borderColor: category.color,
                                color: hasDocument ? 'white' : category.color,
                                backgroundColor: hasDocument ? category.color : 'transparent',
                                '&:hover': {
                                  borderColor: category.color,
                                  backgroundColor: hasDocument ? category.color : `${category.color}10`
                                }
                              }}
                            >
                              {subcat} {hasDocument && '✓'}
                            </Button>
                          </label>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Forms List */}
                {categoryForms.length > 0 ? (
                  <List dense>
                    {categoryForms.map((form) => (
                      <ListItem
                        key={form.id}
                        sx={{
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 1,
                          mb: 1,
                          backgroundColor: 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          {getFileIcon(form.fileType)}
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                {form.name}
                              </Typography>
                              {form.subcategory && (
                                <Chip
                                  label={form.subcategory}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    backgroundColor: `${category.color}20`,
                                    color: category.color
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {form.description || 'No description'} • {(form.fileSize / 1024 / 1024).toFixed(1)} MB
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(form)}
                            color="primary"
                            title="Download"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(form)}
                            color="error"
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    No forms uploaded yet
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialog.open}
          onClose={() => !uploading && setUploadDialog({ open: false, category: null, subcategory: '', form: { name: '', description: '', file: null } })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: 'customColors.cardBackground' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {uploadDialog.category && (
                <Box
                  sx={{
                    backgroundColor: uploadDialog.category.color,
                    borderRadius: '4px',
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <uploadDialog.category.icon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              )}
              Upload {uploadDialog.subcategory || uploadDialog.category?.name || 'Form'} Template
            </Box>
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: 'customColors.cardBackground' }}>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Form Name"
                value={uploadDialog.form.name}
                onChange={(e) => setUploadDialog(prev => ({
                  ...prev,
                  form: { ...prev.form, name: e.target.value }
                }))}
                required
                fullWidth
              />
              <TextField
                label="Description (optional)"
                value={uploadDialog.form.description}
                onChange={(e) => setUploadDialog(prev => ({
                  ...prev,
                  form: { ...prev.form, description: e.target.value }
                }))}
                multiline
                rows={2}
                fullWidth
              />
              {uploadDialog.form.file && (
                <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                    Selected File:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {uploadDialog.form.file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Size: {(uploadDialog.form.file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                💡 For Excel templates, use placeholders like <code>{'{buyer.firstName}'}</code> in cells for automatic data population.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: 'customColors.cardBackground' }}>
            <Button
              onClick={() => setUploadDialog({ open: false, category: null, subcategory: '', form: { name: '', description: '', file: null } })}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={uploading || !uploadDialog.form.file || !uploadDialog.form.name}
              sx={{ backgroundColor: uploadDialog.category?.color }}
            >
              {uploading ? <CircularProgress size={20} /> : 'Upload Form'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Template Guide Dialog */}
        <FormTemplateGuide
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      </Box>
    </UnifiedLayout>
  );
}

export default Forms;

