import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button as MuiButton,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import CRMLayout from '../CRMLayout';
import { db, storage } from '../../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUser } from '../../UserContext';
import ActivityLog from './ActivityLog';
import TaskList from './TaskList';
import HousingNeeds from './HousingNeeds';
import FinancialCalculator from './FinancialCalculator';
import AddDocumentDialog from './AddDocumentDialog';
import LeadCallLogDrawer from './LeadCallLogDrawer';
import LeadTaskDrawer from './LeadTaskDrawer';
import LeadAppointmentDrawer from './LeadAppointmentDrawer';
import VisitLogDrawer from './VisitLogDrawer';

function ProspectPortal() {
  const { prospectId } = useParams();
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('activity');
  const [activitySubTab, setActivitySubTab] = useState('activity');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingCoBuyer, setIsEditingCoBuyer] = useState(false);
  const [prospect, setProspect] = useState(null);
  const [drawerState, setDrawerState] = useState({ type: null, lead: null });

  // Credit data state for the Credit Snapshot tab
  const [creditData, setCreditData] = useState({
    applicantTransUnion: '',
    applicantEquifax: '',
    applicantExperian: '',
    coApplicantTransUnion: '',
    coApplicantEquifax: '',
    coApplicantExperian: '',
    applicantAddress: '',
    applicantSocial: '',
    applicantBirthday: '',
    coApplicantAddress: '',
    coApplicantSocial: '',
    coApplicantBirthday: '',
    creditReport: null
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = React.useRef();

  // Deposits state
  const [deposits, setDeposits] = useState([]);
  const [addDepositDialogOpen, setAddDepositDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Credit Snapshot specific functions
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PDFs and images for credit reports)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF or image file for the credit report');
      return;
    }

    // Validate file size (max 10MB for credit reports)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_credit_report_${file.name}`;
      const storageRef = ref(storage, `companies/${userProfile?.companyId}/prospects/${prospectId}/creditReports/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const newCreditReport = {
        name: file.name,
        url: downloadURL,
        path: `companies/${userProfile?.companyId}/prospects/${prospectId}/creditReports/${fileName}`,
        size: file.size,
        type: file.type,
        uploadedAt: serverTimestamp()
      };

      setCreditData(prev => ({ ...prev, creditReport: newCreditReport }));
      setSnackbar({ open: true, message: 'Credit report uploaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Error uploading credit report:', error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (creditData.creditReport && creditData.creditReport.path) {
      try {
        const fileRef = ref(storage, creditData.creditReport.path);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    setCreditData(prev => ({ ...prev, creditReport: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreditSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'companies', userProfile?.companyId, 'prospects', prospectId, 'creditSnapshot', 'main'), {
        ...creditData,
        updatedAt: serverTimestamp()
      });

      setSnackbar({ open: true, message: 'Credit snapshot saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving credit data:', error);
      setSnackbar({ open: true, message: 'Error saving credit snapshot', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!userProfile?.companyId || !prospectId) return;
        const ref = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
        const snap = await getDoc(ref);
        if (snap.exists()) setProspect({ id: snap.id, ...snap.data() });
      } catch {
        // ignore
      }
    };
    load();
  }, [userProfile, prospectId]);

  // Load deposits
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const col = collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'deposits');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Deposits loaded:', data);
      setDeposits(data);
    });
    return () => unsub();
  }, [userProfile?.companyId, prospectId]);

  // Activity form handler
  const openActivityForm = (type) => {
    setDrawerState({ type, lead: { id: prospectId } });
  };

  // Function to generate auto-incremented receipt numbers
  const generateReceiptNumber = async (companyId) => {
    return await runTransaction(db, async (transaction) => {
      // Reference to the company's receipt counter document
      const counterRef = doc(db, 'companies', companyId, 'counters', 'receipts');
      const counterDoc = await transaction.get(counterRef);

      let nextReceiptNumber;
      if (!counterDoc.exists()) {
        // Initialize counter starting at 100000
        nextReceiptNumber = 100000;
        transaction.set(counterRef, { lastReceiptNumber: nextReceiptNumber });
      } else {
        // Increment the counter
        const currentNumber = counterDoc.data().lastReceiptNumber || 99999;
        nextReceiptNumber = currentNumber + 1;
        transaction.update(counterRef, { lastReceiptNumber: nextReceiptNumber });
      }

      return nextReceiptNumber.toString();
    });
  };

  const handleSaveDeposit = async (depositData) => {
    try {
      // Generate auto-incremented receipt number
      const receiptNumber = await generateReceiptNumber(userProfile?.companyId);
      
      // Generate PDF receipt with the receipt number
      const receiptPdf = await generateReceiptPDF({
        ...depositData,
        receiptNumber
      });
      
      const docData = {
        ...depositData,
        receiptNumber, // Override with auto-generated number
        receiptPdf,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'companies', userProfile?.companyId, 'prospects', prospectId, 'deposits'), docData);
      setSnackbar({ open: true, message: `Deposit added successfully - Receipt #${receiptNumber}`, severity: 'success' });
    } catch (error) {
      console.error('Error saving deposit:', error);
      setSnackbar({ open: true, message: 'Error adding deposit', severity: 'error' });
    }
  };

  // Function to generate PDF receipt
  const generateReceiptPDF = async (depositData) => {
    // Create a simple HTML receipt and convert to PDF
    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
        <h2 style="text-align: center; color: #333;">Deposit Receipt</h2>
        <div style="margin: 20px 0;">
          <p><strong>Receipt Number:</strong> ${depositData.receiptNumber}</p>
          <p><strong>Type:</strong> ${depositData.type}</p>
          ${depositData.checkNumber ? `<p><strong>Check/Order Number:</strong> ${depositData.checkNumber}</p>` : ''}
          <p><strong>Provided By:</strong> ${depositData.providedBy}</p>
          <p><strong>Amount:</strong> $${parseFloat(depositData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
          <p style="color: #666; font-size: 12px;">Thank you for your deposit</p>
        </div>
      </div>
    `;

    // For now, we'll create a simple text file as PDF placeholder
    // In a real implementation, you'd use a PDF library like jsPDF or pdfmake
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const fileName = `receipt_${depositData.receiptNumber}_${Date.now()}.html`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, `companies/${userProfile?.companyId}/prospects/${prospectId}/receipts/${fileName}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      name: fileName,
      url: downloadURL,
      path: `companies/${userProfile?.companyId}/prospects/${prospectId}/receipts/${fileName}`,
      size: blob.size,
      type: 'text/html'
    };
  };

  const handleDeleteDeposit = async (id) => {
    if (!confirm('Are you sure you want to delete this deposit?')) return;
    try {
      await deleteDoc(doc(db, 'companies', userProfile?.companyId, 'prospects', prospectId, 'deposits', id));
      setSnackbar({ open: true, message: 'Deposit deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting deposit:', error);
      setSnackbar({ open: true, message: 'Error deleting deposit', severity: 'error' });
    }
  };

  return (
    <CRMLayout>
      <Box sx={{ p: 3, width: '100%' }}>
        {/* Buyer Information */}
        <Paper elevation={6} sx={{ backgroundColor: '#2a2746', px: { xs: 1.5, sm: 3 }, py: 2, mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Buyer Information</Typography>
            {isEditingHeader ? (
              <Stack direction="row" spacing={1.5}>
                <MuiButton onClick={() => setIsEditingHeader(false)} size="small" variant="contained" color="success">Save</MuiButton>
                <MuiButton onClick={() => setIsEditingHeader(false)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Cancel</MuiButton>
              </Stack>
            ) : (
              <MuiButton onClick={() => setIsEditingHeader(true)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Edit</MuiButton>
            )}
          </Stack>
          {isEditingHeader ? (
            <Box className="grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField placeholder="First Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Middle Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Last Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Phone Number" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Email Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Street Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="City" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="State" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Zip" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
            </Box>
          ) : (
            <Box sx={{ color: 'rgba(255,255,255,0.85)' }}>Name, Phone, Email, Address</Box>
          )}
        </Paper>

        {/* Co-Buyer Information */}
        <Paper elevation={6} sx={{ backgroundColor: '#2a2746', px: { xs: 1.5, sm: 3 }, py: 2, mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Co-Buyer Information</Typography>
            {isEditingCoBuyer ? (
              <Stack direction="row" spacing={1.5}>
                <MuiButton onClick={() => setIsEditingCoBuyer(false)} size="small" variant="contained" color="success">Save</MuiButton>
                <MuiButton onClick={() => setIsEditingCoBuyer(false)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Cancel</MuiButton>
              </Stack>
            ) : (
              <MuiButton onClick={() => setIsEditingCoBuyer(true)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Edit</MuiButton>
            )}
          </Stack>
          {isEditingCoBuyer ? (
            <Box className="grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField placeholder="Co-Buyer First Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Middle Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Last Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Phone" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Email" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Street Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer City" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer State" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Zip" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
            </Box>
          ) : (
            <Box sx={{ color: 'rgba(255,255,255,0.85)' }}>Not specified</Box>
          )}
        </Paper>

        {/* Primary Tabs */}
        <Paper sx={{ backgroundColor: '#2a2746', mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }} elevation={6}>
          <Box sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Tabs
              value={["activity","preferences","calculator","credit-snapshot","emc","deposit","application","documents"].indexOf(activeTab)}
              onChange={(_, idx) => setActiveTab(["activity","preferences","calculator","credit-snapshot","emc","deposit","application","documents"][idx])}
              textColor="secondary"
              indicatorColor="secondary"
              variant="fullWidth"
              centered
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 500, minHeight: 48 }, '& .Mui-selected': { color: '#90caf9' } }}
            >
              <Tab label="Activity" />
              <Tab label="Housing Needs" />
              <Tab label="Calculator" />
              <Tab label="Credit Snapshot" />
              <Tab label="EMC" />
              <Tab label="Deposit" />
              <Tab label="Application" />
              <Tab label="Documents" />
            </Tabs>
          </Box>
        </Paper>

        {/* Second Row of Independent Tabs */}
        <Paper sx={{ backgroundColor: '#2a2746', mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }} elevation={6}>
          <Box sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Tabs
              value={["home-land-info","financing","deal-builder","closing","project","funding","service","forms"].indexOf(activeTab)}
              onChange={(_, idx) => setActiveTab(["home-land-info","financing","deal-builder","closing","project","funding","service","forms"][idx])}
              textColor="secondary"
              indicatorColor="secondary"
              variant="fullWidth"
              centered
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 500, minHeight: 48 }, '& .Mui-selected': { color: '#90caf9' } }}
            >
              <Tab label="Home/Land Info" />
              <Tab label="Financing" />
              <Tab label="Deal Builder" />
              <Tab label="Closing" />
              <Tab label="Project" />
              <Tab label="Funding" />
              <Tab label="Service" />
              <Tab label="Forms" />
            </Tabs>
          </Box>
        </Paper>

        {/* Content area */}
        <Paper sx={{ backgroundColor: '#2a2746', p: 3, border: '1px solid rgba(255,255,255,0.08)', width: '100%' }} elevation={6}>
          <div className="min-h-[400px] sm:min-h-[600px]">
          {activeTab === 'activity' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    Activity Log
                  </h3>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => openActivityForm("call")}
                      size="sm"
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                    >
                      <i className="fas fa-phone mr-2"></i>
                      Log a Call
                    </Button>
                    <Button
                      onClick={() => openActivityForm("task")}
                      size="sm"
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                    >
                      <i className="fas fa-tasks mr-2"></i>
                      Create Task
                    </Button>
                    <Button
                      onClick={() => openActivityForm("appointment")}
                      size="sm"
                      variant="outline"
                      className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700"
                    >
                      <i className="fas fa-calendar mr-2"></i>
                      Schedule Appointment
                    </Button>
                    <Button
                      onClick={() => openActivityForm("visit")}
                      size="sm"
                      variant="outline"
                      className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                    >
                      <i className="fas fa-home mr-2"></i>
                      Log a Visit
                    </Button>
                  </div>
                </div>
                <ActivityLog
                  companyId={userProfile?.companyId}
                  docType="prospects"
                  docId={prospectId}
                  createdAt={prospect?.createdAt}
                  createdBy={prospect?.createdBy}
                  onAction={(type) => setDrawerState({ type, lead: { id: prospectId } })}
                />
              </div>
          ) : activeTab === 'home-land-info' ? (
              <div className="space-y-6">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                    Home/Land Information
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Information
                  </Button>
                </Box>

                {/* Sales Information Section */}
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 16, mb: 3 }}>
                    Sales Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sales Rep"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sale Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sale Price"
                        type="number"
                        InputProps={{ startAdornment: '$' }}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Commission"
                        type="number"
                        InputProps={{ startAdornment: '$' }}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Home Information Section */}
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 16, mb: 3 }}>
                    Home Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Home Model"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Home Size"
                        placeholder="e.g., 16x80"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Bedrooms"
                        type="number"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Bathrooms"
                        type="number"
                        step="0.5"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Year Built"
                        type="number"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Serial Number"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Delivery Information Section */}
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 16, mb: 3 }}>
                    Delivery Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Delivery Address"
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Scheduled Delivery Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Delivery Status"
                        select
                        value=""
                        sx={textFieldSx}
                      >
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="In Transit">In Transit</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Delayed">Delayed</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Setup Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Delivery Instructions"
                        multiline
                        rows={3}
                        value=""
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </div>
          ) : activeTab === 'financing' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Financing Information
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Financing information content will be implemented here.
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'deal-builder' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Deal Builder
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Deal Builder content will be implemented here.
                    <br />
                    <Typography component="span" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                      This section will include deal configuration, pricing, and contract details.
                    </Typography>
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'closing' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Closing Information
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Closing information content will be implemented here.
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'project' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Project Information
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Project information content will be implemented here.
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'funding' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Funding Information
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Funding information content will be implemented here.
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'service' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Service Information
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Service information content will be implemented here.
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'forms' ? (
              <div className="space-y-6">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                  Forms & Documents
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 8 }}>
                    Forms and documents content will be implemented here.
                    <br />
                    <Typography component="span" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                      This section will include customizable forms and document templates.
                    </Typography>
                  </Typography>
                </Paper>
              </div>
          ) : activeTab === 'preferences' ? (
              <div className="space-y-6">
                <HousingNeeds companyId={userProfile?.companyId} prospectId={prospectId} initial={prospect?.housing || {}} />
              </div>
            ) : activeTab === 'calculator' ? (
              <div className="space-y-6">
                <FinancialCalculator companyId={userProfile?.companyId} prospectId={prospectId} initial={prospect?.calculator || {}} />
              </div>
            ) : activeTab === 'documents' ? (
              <div className="space-y-6">
                <ProspectDocuments companyId={userProfile?.companyId} prospectId={prospectId} />
              </div>
            ) : activeTab === 'deposit' ? (
              <div className="space-y-6">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                    Deposits
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      console.log('Button clicked, current state:', addDepositDialogOpen);
                      setAddDepositDialogOpen(true);
                      console.log('State after set:', true);
                    }}
                    sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Deposit
                  </Button>
                </Box>

                {/* Deposits Table */}
                <Paper sx={{ backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            Receipt Number
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            Provided By
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.12)', textAlign: 'right' }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.12)', textAlign: 'center' }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deposits.map((deposit) => (
                          <TableRow key={deposit.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {deposit.receiptPdf ? (
                                <Button
                                  size="small"
                                  onClick={() => window.open(deposit.receiptPdf.url, '_blank')}
                                  sx={{ color: '#90caf9', textTransform: 'none', fontSize: '0.875rem', p: 0, minWidth: 'auto' }}
                                >
                                  {deposit.receiptNumber}
                                </Button>
                              ) : (
                                deposit.receiptNumber || 'N/A'
                              )}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {deposit.type}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {deposit.providedBy}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right', fontWeight: 600 }}>
                              ${deposit.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDeposit(deposit.id)}
                                sx={{ color: '#f44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                              >
                                <i className="fas fa-trash"></i>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {deposits.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', py: 4, borderBottom: 'none' }}>
                              No deposits found. Click "Add Deposit" to create your first deposit.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            ) : activeTab === 'credit-snapshot' ? (
              <div className="space-y-6">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                    Credit Snapshot
                  </Typography>
                  <Button
                    onClick={() => {
                      // Placeholder for soft pull functionality
                      console.log('Soft pull clicked');
                    }}
                    variant="contained"
                    sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
                  >
                    <i className="fas fa-search mr-2"></i>
                    Soft Pull
                  </Button>
                </Box>

                {/* Credit Scores Section */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  {/* Applicant Scores */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                        Applicant Credit Scores
                      </Typography>
                      <Stack spacing={3}>
                        <TopLabeled label="Trans Union">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.applicantTransUnion || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantTransUnion: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Equifax">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.applicantEquifax || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantEquifax: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Experian">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.applicantExperian || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantExperian: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                      </Stack>
                    </Paper>
                  </Box>

                  {/* Co-Applicant Scores */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                        Co-Applicant Credit Scores
                      </Typography>
                      <Stack spacing={3}>
                        <TopLabeled label="Trans Union">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.coApplicantTransUnion || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantTransUnion: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Equifax">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.coApplicantEquifax || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantEquifax: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Experian">
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={creditData?.coApplicantExperian || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantExperian: e.target.value }))}
                            inputProps={{ min: 300, max: 850 }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                      </Stack>
                    </Paper>
                  </Box>
                </Box>

                {/* Personal Information Section */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  {/* Applicant Information */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                        Applicant Information
                      </Typography>
                      <Stack spacing={3}>
                        <TopLabeled label="Address">
                          <TextField
                            fullWidth
                            size="small"
                            value={creditData?.applicantAddress || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantAddress: e.target.value }))}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Social Security">
                          <TextField
                            fullWidth
                            size="small"
                            type="password"
                            value={creditData?.applicantSocial || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantSocial: e.target.value }))}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Birthday">
                          <TextField
                            fullWidth
                            type="date"
                            size="small"
                            value={creditData?.applicantBirthday || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, applicantBirthday: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                      </Stack>
                    </Paper>
                  </Box>

                  {/* Co-Applicant Information */}
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                        Co-Applicant Information
                      </Typography>
                      <Stack spacing={3}>
                        <TopLabeled label="Address">
                          <TextField
                            fullWidth
                            size="small"
                            value={creditData?.coApplicantAddress || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantAddress: e.target.value }))}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Social Security">
                          <TextField
                            fullWidth
                            size="small"
                            type="password"
                            value={creditData?.coApplicantSocial || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantSocial: e.target.value }))}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                        <TopLabeled label="Birthday">
                          <TextField
                            fullWidth
                            type="date"
                            size="small"
                            value={creditData?.coApplicantBirthday || ''}
                            onChange={(e) => setCreditData(prev => ({ ...prev, coApplicantBirthday: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={textFieldSx}
                          />
                        </TopLabeled>
                      </Stack>
                    </Paper>
                  </Box>
                </Box>

                {/* Credit Report Section */}
                <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
                    Credit Report
                  </Typography>
                  <Box>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    {!creditData.creditReport ? (
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
                        {uploading ? 'Uploading...' : 'Choose Credit Report File'}
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                        <Typography sx={{ color: 'white', flexGrow: 1 }}>
                          📄 {creditData.creditReport.name}
                          <br />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {(creditData.creditReport.size / 1024 / 1024).toFixed(2)} MB • {creditData.creditReport.type}
                          </Typography>
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => window.open(creditData.creditReport.url, '_blank')}
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
                </Paper>

                {/* Save Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreditSave}
                    disabled={saving}
                    sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </div>
            ) : activeTab === 'application' ? (
              <ApplicationTab
                prospectId={prospectId}
                userProfile={userProfile}
              />
          ) : (
            <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>Prospect portal content placeholder</Typography>
          )}
          </div>
        </Paper>

        <LeadCallLogDrawer
          open={drawerState.type === 'callNotes'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={userProfile?.companyId}
          lead={drawerState.lead}
        />
        <LeadTaskDrawer
          open={drawerState.type === 'task'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={userProfile?.companyId}
          lead={drawerState.lead}
        />
        <LeadAppointmentDrawer
          open={drawerState.type === 'calendar'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={userProfile?.companyId}
          lead={drawerState.lead}
        />
        <VisitLogDrawer
          open={drawerState.type === 'visit'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={userProfile?.companyId}
          docType="prospects"
          docId={prospectId}
        />
      </Box>

      <AddDepositDrawer
        open={addDepositDialogOpen}
        onClose={() => setAddDepositDialogOpen(false)}
        onSave={handleSaveDeposit}
        userProfile={userProfile}
        prospectId={prospectId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </CRMLayout>
  );
}

// Field styling for forms
const textFieldSx = {
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

// Document categories
const DOCUMENT_CATEGORIES = [
  'Customer Documents',
  'Credit Application Documents', 
  'Income Documents',
  'Approval Documents',
  'Condition Documents',
  'Home Documents',
  'Closing Documents',
  'Funding Documents',
  'Construction Documents'
];

function ProspectDocuments({ companyId, prospectId }) {
  const [documents, setDocuments] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (!companyId || !prospectId) return;
    const q = query(collection(db, 'companies', companyId, 'prospects', prospectId, 'documents'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [companyId, prospectId]);

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupDocumentsByCategory = () => {
    const grouped = {};
    DOCUMENT_CATEGORIES.forEach(category => {
      grouped[category] = documents.filter(doc => doc.category === category);
    });
    return grouped;
  };

  const handleSave = async (data, collectionName) => {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'companies', companyId, 'prospects', prospectId, 'documents'), docData);
      setAddDialogOpen(false);
      setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving document:', error);
      setSnackbar({ open: true, message: 'Error uploading document', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      // Delete the document record
      await deleteDoc(doc(db, 'companies', companyId, 'prospects', prospectId, 'documents', id));

      // Also delete the file from storage if it exists
      const document = documents.find(d => d.id === id);
      if (document?.file?.path) {
        try {
          const fileRef = ref(storage, document.file.path);
          await deleteObject(fileRef);
        } catch (fileError) {
          console.error('Error deleting associated file:', fileError);
        }
      }

      setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbar({ open: true, message: 'Error deleting document', severity: 'error' });
    }
  };

  const documentsByCategory = groupDocumentsByCategory();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Prospect Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          Upload Document
        </Button>
      </Stack>

      <Stack spacing={2}>
        {DOCUMENT_CATEGORIES.map((category) => {
          const categoryDocs = documentsByCategory[category] || [];
          return (
            <Accordion
              key={category}
              expanded={expandedCategories[category] || false}
              onChange={() => handleCategoryToggle(category)}
              sx={{
                backgroundColor: '#2a2746',
                border: '1px solid rgba(255,255,255,0.08)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderBottom: categoryDocs.length > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  '& .MuiAccordionSummary-content': { alignItems: 'center' }
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 16 }}>
                  {category}
                  <Typography component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, ml: 1 }}>
                    ({categoryDocs.length})
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {categoryDocs.length > 0 ? (
                  <List dense>
                    {categoryDocs.map((document) => (
                      <ListItem
                        key={document.id}
                        sx={{
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
                        }}
                      >
                        <ListItemText
                          primary={
                            document.file ? (
                              <Button
                                size="small"
                                onClick={() => window.open(document.file.url, '_blank')}
                                sx={{ 
                                  color: '#90caf9', 
                                  textTransform: 'none', 
                                  fontSize: '0.875rem', 
                                  p: 0, 
                                  minWidth: 'auto',
                                  fontWeight: 600
                                }}
                              >
                                📄 {document.name}
                              </Button>
                            ) : (
                              <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                                📄 {document.name || 'Unnamed Document'}
                              </Typography>
                            )
                          }
                          secondary={
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                              {document.file ? `${(document.file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'} • 
                              {document.createdAt ? ` ${new Date(document.createdAt.toDate()).toLocaleDateString()}` : ' Unknown date'}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(document.id)}
                            sx={{ color: '#f44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                      No documents in this category
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      <AddDocumentDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={(data) => handleSave(data, 'documents')}
        initial={null}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


function AddDepositDrawer({ open, onClose, onSave, userProfile, prospectId }) {
  console.log('AddDepositDrawer render, props:', { open, userProfile, prospectId });
  console.log('AddDepositDrawer rendering with open:', open);

  const [form, setForm] = useState({
    receiptNumber: '',
    type: 'Cash',
    providedBy: '',
    amount: '',
    checkNumber: ''
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.amount) return;

    // Generate PDF receipt (receipt number will be added after generation)
    onSave({
      ...form,
      amount: parseFloat(form.amount)
    });

    // Reset form and close dialog
    setForm({
      receiptNumber: '',
      type: 'Cash',
      providedBy: '',
      amount: '',
      checkNumber: ''
    });
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: 9999 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          backgroundColor: '#2a2746',
          border: '1px solid rgba(255,255,255,0.08)'
        }
      }}
      keepMounted
      variant="temporary"
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
          Add Deposit
        </Typography>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={3}>
            <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, mb: 1 }}>
                Receipt Number
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                Auto-generated upon save
              </Typography>
            </Box>

            <TopLabeled label="Type">
              <TextField
                fullWidth
                select
                value={form.type}
                onChange={handleChange('type')}
                sx={textFieldSx}
                SelectProps={{
                  MenuProps: {
                    sx: { zIndex: 10000 }
                  }
                }}
              >
                <MenuItem value="Credit">Credit</MenuItem>
                <MenuItem value="Debit">Debit</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Personal Check">Personal Check</MenuItem>
                <MenuItem value="Cashiers Check">Cashiers Check</MenuItem>
                <MenuItem value="Money Order">Money Order</MenuItem>
                <MenuItem value="Wire">Wire</MenuItem>
              </TextField>
            </TopLabeled>

            {(form.type === 'Personal Check' || form.type === 'Cashiers Check' || form.type === 'Money Order') && (
              <TopLabeled label="Check/Order Number">
                <TextField
                  fullWidth
                  placeholder="Enter check or money order number"
                  value={form.checkNumber}
                  onChange={handleChange('checkNumber')}
                  sx={textFieldSx}
                />
              </TopLabeled>
            )}

            <TopLabeled label="Provided By">
              <TextField
                fullWidth
                placeholder="Enter provider name"
                value={form.providedBy}
                onChange={handleChange('providedBy')}
                sx={textFieldSx}
              />
            </TopLabeled>

            <TopLabeled label="Amount">
              <TextField
                fullWidth
                required
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange('amount')}
                InputProps={{ startAdornment: '$' }}
                sx={textFieldSx}
              />
            </TopLabeled>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.amount}
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
          >
            Add Deposit
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

function ApplicationTab({ prospectId, userProfile }) {

  return (
    <div className="space-y-6">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
          Customer Application
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            const applicationUrl = `/application/${prospectId}?companyId=${userProfile?.companyId}`;
            window.open(applicationUrl, '_blank');
          }}
          sx={{ 
            backgroundColor: '#1976d2', 
            '&:hover': { backgroundColor: '#1565c0' },
            fontSize: 16,
            py: 1.5,
            px: 3
          }}
        >
          <i className="fas fa-external-link-alt mr-2"></i>
          Start Application
        </Button>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, fontSize: 16 }}>
            Customer application will open in a new tab for easy access.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            This allows customers to fill out the application independently,
            <br />
            and enables easy sharing via direct link.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}


function TopLabeled({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 16 }, '& .MuiSelect-select': { fontSize: 16 }, '& .MuiFormControlLabel-label': { fontSize: 16 } }}>
        {children}
      </Box>
    </Stack>
  );
}

export default ProspectPortal;


