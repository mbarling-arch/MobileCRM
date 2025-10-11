import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Article as ArticleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { db } from '../../../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { populateTemplate } from '../../../utils/documentParser';

const FORM_CATEGORIES = [
  'Application Docs',
  'Home Docs',
  'Bank Docs',
  'Funding Docs',
  'Closing Docs',
  'Move In Docs'
];

const FormsTab = ({ prospectId, userProfile, isDeal, context }) => {
  const { prospect, buyerInfo, coBuyerInfo, creditData } = context;
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [crmDocuments, setCrmDocuments] = useState([]);
  const [fairCreditDialogOpen, setFairCreditDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    includeBuyer: true,
    includeCoBuyer: false,
    includeProperty: true,
    includeFinancing: true
  });

  useEffect(() => {
    if (userProfile?.companyId && prospectId) {
      loadForms();
      loadCrmDocuments();
    } else {
      // If no userProfile, still stop loading after a short delay
      setTimeout(() => setLoading(false), 1000);
    }
  }, [userProfile, prospectId]);

  const loadCrmDocuments = async () => {
    try {
      // Load the CRM document templates from the company's forms collection
      const formsRef = collection(db, 'companies', userProfile.companyId, 'forms');
      const q = query(formsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      // Filter for CRM Documents category
      const crmDocs = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(doc => doc.category === 'CRM Documents');
      
      setCrmDocuments(crmDocs);
    } catch (error) {
      console.error('Error loading CRM documents:', error);
      setCrmDocuments([]);
    }
  };

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

  const handlePrintForm = (form) => {
    setSelectedForm(form);
    setPrintDialogOpen(true);
  };

  const handleExecutePrint = () => {
    // For now, just download the form - in the future this would populate with data
    if (selectedForm) {
      window.open(selectedForm.downloadURL, '_blank');
    }
    setPrintDialogOpen(false);
    setSelectedForm(null);
  };

  const handleViewForm = (form) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleGenerateDocument = async (doc) => {
    try {
      // Check if we have enough buyer info to populate
      if (!buyerInfo?.firstName && !buyerInfo?.lastName) {
        alert('Please add buyer information before generating documents.');
        return;
      }

      setGenerating(true);

      // For Fair Credit Auth, show preview option too
      if (doc.subcategory === 'Fair Credit Auth') {
        // Ask user if they want to preview or download populated
        const shouldDownload = confirm(
          'Click OK to download the populated document with buyer data,\nor Cancel to see a data preview first.'
        );

        if (shouldDownload) {
          // Populate and download the template - always convert to PDF for security
          const success = await populateTemplate(doc, buyerInfo, coBuyerInfo, creditData, prospect, true);
          if (success) {
            alert('✅ Document generated as PDF!\n\nThe populated document has been downloaded to your Downloads folder.\n\nNote: The output is a secure PDF that cannot be edited.');
          }
        } else {
          // Show preview dialog
          setSelectedForm(doc);
          setFairCreditDialogOpen(true);
        }
      } else {
        // For other documents, populate directly and convert to PDF
        const success = await populateTemplate(doc, buyerInfo, coBuyerInfo, creditData, prospect, true);
        if (success) {
          alert(`✅ ${doc.subcategory || doc.name} generated as PDF!\n\nCheck your downloads folder.`);
        }
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Error generating document: ${error.message}\n\nPlease check that your template uses the correct placeholder format: {{Buyer.field}}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintFairCredit = () => {
    // Print the populated form
    const printContent = document.getElementById('fair-credit-form');
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write('<html><head><title>Fair Credit Authorization</title>');
      printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:40px;} h2{text-align:center;} .section{margin:20px 0;padding:15px;background:#f5f5f5;border-radius:8px;} .grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;} .field{margin:10px 0;} .label{font-size:11px;color:#666;text-transform:uppercase;font-weight:600;} .value{font-size:14px;font-weight:500;margin-top:4px;} .signature{margin-top:40px;border-top:1px solid #000;padding-top:10px;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
    setFairCreditDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* CRM Documents Section */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          CRM Documents
        </Typography>

        {crmDocuments.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>No CRM Documents Uploaded</Typography>
            <Typography variant="body2">
              Upload CRM document templates in the Forms management page (sidebar → Forms) to make them available here.
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
            {crmDocuments.map((doc) => (
              <Button
                key={doc.id}
                variant="outlined"
                color="primary"
                startIcon={generating ? <CircularProgress size={16} /> : <PrintIcon />}
                onClick={() => handleGenerateDocument(doc)}
                disabled={generating}
                sx={{ minWidth: 180 }}
              >
                {doc.subcategory || doc.name}
              </Button>
            ))}
          </Box>
        )}

        {/* Show available CRM documents as list */}
        {crmDocuments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2, fontWeight: 600 }}>
              Available Templates
            </Typography>
            <List dense>
              {crmDocuments.map((doc) => (
                <ListItem
                  key={doc.id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getFileIcon(doc.fileType)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {doc.subcategory || doc.name}
                        </Typography>
                        <Chip
                          label={doc.fileType?.includes('pdf') ? 'PDF' : doc.fileType?.includes('word') ? 'Word' : 'Document'}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {doc.description || 'Template ready to use'} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={generating ? <CircularProgress size={14} /> : <PrintIcon />}
                      onClick={() => handleGenerateDocument(doc)}
                      disabled={generating}
                      sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1.5 }}
                    >
                      {generating ? 'Generating...' : 'Generate'}
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          Form Library
        </Typography>

        {!prospect || !buyerInfo ? (
          <Alert severity="info">
            Please complete the basic prospect information before using forms.
          </Alert>
        ) : (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', fontSize: 14, lineHeight: 1.6 }}>
            Select and print forms with customer data populated. Forms are organized by document type: Application, Home, Bank, Funding, Closing, and Move In docs.
          </Typography>
        )}
      </Paper>

      {Object.keys(groupedForms).length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <DocumentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography sx={{ mb: 1, color: 'text.primary', fontWeight: 600, fontSize: 18 }}>
            No forms available
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Forms can be uploaded and managed from the Forms section in the main navigation.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {FORM_CATEGORIES.map(category => {
            const categoryForms = groupedForms[category] || [];
            if (categoryForms.length === 0) return null;

            return (
              <Paper key={category} sx={{ p: 3 }}>
                <Typography sx={{ mb: 2, color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {category}
                </Typography>
                <List dense>
                  {categoryForms.map((form) => (
                    <ListItem
                      key={form.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1.5,
                        backgroundColor: 'action.hover',
                        '&:hover': { backgroundColor: 'action.selected' },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        {getFileIcon(form.fileType)}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {form.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {form.description || 'No description'}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${(form.fileSize / 1024 / 1024).toFixed(1)} MB`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleViewForm(form)}
                          color="primary"
                          title="View Form"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrintForm(form)}
                          disabled={!prospect || !buyerInfo}
                          sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1.5 }}
                        >
                          Print
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Print Options Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'customColors.cardBackground' }}>
          Print Form: {selectedForm?.name}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'customColors.cardBackground' }}>
          <Box sx={{ pt: 2 }}>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>
              Configure what customer data to include in the printed form:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Data to Include"
                value={printOptions.includeBuyer ? 'buyer' : 'none'}
                onChange={(e) => setPrintOptions(prev => ({
                  ...prev,
                  includeBuyer: e.target.value === 'buyer'
                }))}
                fullWidth
              >
                <MenuItem value="buyer">Buyer Information</MenuItem>
                <MenuItem value="both">Buyer + Co-Buyer Information</MenuItem>
                <MenuItem value="none">No Customer Data</MenuItem>
              </TextField>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Note: Form data population will be available in future updates. Currently, forms will open as templates.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'customColors.cardBackground' }}>
          <Button onClick={() => setPrintDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExecutePrint}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Open Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fair Credit Authorization Dialog - Shows populated data for printing */}
      <Dialog
        open={fairCreditDialogOpen}
        onClose={() => setFairCreditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'customColors.cardBackground' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
            Fair Credit Reporting Act Authorization
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Template: {selectedForm?.name || 'Default'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'customColors.cardBackground' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            This preview shows the data that will be used. For Excel templates, placeholders will be automatically replaced. For PDF/Word templates, use this as reference.
          </Alert>
          <Box sx={{ pt: 2 }} id="fair-credit-form">
            <Typography sx={{ mb: 3, fontSize: 14, lineHeight: 1.8 }}>
              I hereby authorize you to obtain a credit report and related credit information on me from one or more consumer reporting agencies for the purpose of evaluating my credit application.
            </Typography>

            {/* Primary Buyer Information */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Primary Buyer Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Full Name</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {buyerInfo?.firstName} {buyerInfo?.middleName} {buyerInfo?.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>SSN (Last 4)</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    XXX-XX-{creditData?.buyer_ssn?.slice(-4) || 'XXXX'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Date of Birth</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {creditData?.buyer_dob || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Address</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {creditData?.buyer_address || buyerInfo?.streetAddress || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>City, State, Zip</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {creditData?.buyer_city || buyerInfo?.city}, {creditData?.buyer_state || buyerInfo?.state} {creditData?.buyer_zip || buyerInfo?.zip}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Phone</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {creditData?.buyer_homePhone || buyerInfo?.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Co-Buyer Information (if exists) */}
            {(coBuyerInfo?.firstName || coBuyerInfo?.lastName) && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  Co-Buyer Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Full Name</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {coBuyerInfo?.firstName} {coBuyerInfo?.middleName} {coBuyerInfo?.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>SSN (Last 4)</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      XXX-XX-{creditData?.coBuyer_ssn?.slice(-4) || 'XXXX'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Date of Birth</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {creditData?.coBuyer_dob || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Address</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {creditData?.coBuyer_address || coBuyerInfo?.streetAddress || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>City, State, Zip</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {creditData?.coBuyer_city || coBuyerInfo?.city}, {creditData?.coBuyer_state || coBuyerInfo?.state} {creditData?.coBuyer_zip || coBuyerInfo?.zip}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Phone</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {creditData?.coBuyer_homePhone || coBuyerInfo?.phone || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Authorization Statement */}
            <Box sx={{ mt: 4, p: 2, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 1 }}>
              <Typography sx={{ fontSize: 12, lineHeight: 1.8, mb: 2 }}>
                I understand that this authorization applies to my current credit application and any subsequent update, renewal, or extension of this application. A photocopy of this authorization shall be as valid as the original.
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                Date: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'customColors.cardBackground' }}>
          <Button onClick={() => setFairCreditDialogOpen(false)}>
            Close
          </Button>
          {selectedForm?.downloadURL && (
            <Button
              onClick={() => window.open(selectedForm.downloadURL, '_blank')}
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Download Template
            </Button>
          )}
          <Button
            onClick={handlePrintFairCredit}
            variant="contained"
            startIcon={<PrintIcon />}
            color="primary"
          >
            Print Data Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormsTab;