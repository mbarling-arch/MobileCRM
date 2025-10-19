import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, CircularProgress, Typography, Dialog, Button, IconButton, Stack, FormControlLabel, Checkbox, Chip, TextField, Avatar, List, ListItem, ListItemButton, ListItemText, Divider, Fab, Drawer, Tooltip, MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { Close as CloseIcon, Send as SendIcon, Task as TaskIcon, Chat as ChatIcon, Timeline as TimelineIcon, Phone as PhoneIcon, Email as EmailIcon, Event as EventIcon, Home as HomeIcon, Upload as UploadIcon, Description as DescriptionIcon, Download as DownloadIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { doc, updateDoc, collection, onSnapshot, orderBy, query, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UnifiedLayout from '../UnifiedLayout';
import { useUser } from '../../hooks/useUser';
import { ProspectTopSection } from './prospect/ProspectTopSection';
import { ProspectTabs } from './prospect/ProspectTabs';
import { TabRouter } from './prospect-tabs/TabRouter';
import { useProspect } from '../../hooks/useProspect';
import { FormTextField, FormSelect } from '../FormField';
import LeadCallLogDrawer from './LeadCallLogDrawer';
import LeadAppointmentDrawer from './LeadAppointmentDrawer';
import VisitLogDrawer from './VisitLogDrawer';
import EmailDrawer from './EmailDrawer';
import LeadTaskDrawer from './LeadTaskDrawer';
import DealBuilder from './DealBuilder';
import EMC from './EMC';
import GamePlan from './GamePlan';
import DepositTab from './prospect-tabs/DepositTab';
import ApplicationTab from './prospect-tabs/ApplicationTab';

// Helper functions
const labelize = (key) => {
  const map = {
    singlewide: 'Singlewide',
    doublewide: 'Doublewide',
    triplewide: 'Triple Wide',
    'tiny home': 'Tiny Home',
    cash: 'Cash',
    chattel: 'Chattel',
    'land/home': 'Land/Home',
    lnl: 'LNL',
    own: 'Own',
    rent: 'Rent',
    apartment: 'Apartment',
    house: 'House',
    condo: 'Condo',
    'mobile home': 'Mobile Home',
    community: 'Community',
    'private property': 'Private Property',
    'family land': 'Family Land',
    electric: 'Electric',
    water: 'Water',
    septic: 'Septic',
    drive: 'Drive',
    pad: 'Pad',
    checking: 'Checking',
    savings: 'Savings',
    gift: 'Gift',
    '401k': '401k',
    land: 'Land',
    sale: 'Sale'
  };
  return map[key] || key;
};

const currency = (val) => {
  if (!val && val !== 0) return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const defaultHousing = () => ({
  homeType: '',
  prefBed: '',
  prefBath: '',
  prefSqft: '',
  desiredFeatures: '',
  currentOwnRent: '',
  currentHomeType: '',
  currentHowLong: '',
  currentMonthlyPayment: '',
  currentBed: '',
  currentBath: '',
  likes: '',
  dislikes: '',
  hasIdentifiedLocation: null,
  moveInTimeframe: '',
  preventMovingSooner: '',
  locationType: '',
  landImprovements: {},
  landSize: '',
  landPayoff: '',
  landMonthlyPayment: '',
  desiredArea: '',
  desiredLandSize: '',
  dealType: '',
  idealPrice: '',
  maxPrice: '',
  cashAvailable: '',
  cashSource: '',
  idealMonthlyPayment: '',
  maxMonthlyPayment: '',
  downPayment: '',
  availableToday: '',
  fundsSource: '',
  buyerEmployer: '',
  buyerStartDate: '',
  coBuyerEmployer: '',
  coBuyerStartDate: ''
});

// Main content component that uses the context
function ProspectPortalContent({ userProfile, prospectId, isDeal }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [homeNeedsModalOpen, setHomeNeedsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [housingForm, setHousingForm] = useState(defaultHousing());
  const [savingHousing, setSavingHousing] = useState(false);
  
  // Tasks and Notes state
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [users, setUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [activitiesDrawerOpen, setActivitiesDrawerOpen] = useState(false);
  const [documentsDrawerOpen, setDocumentsDrawerOpen] = useState(false);
  const noteInputRef = useRef(null);
  
  // Activities state
  const [calls, setCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [emails, setEmails] = useState([]);
  
  // Documents state
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  
  // Activity action drawers
  const [callDrawerOpen, setCallDrawerOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);
  const [tasksDrawerOpen, setTasksDrawerOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [dealBuilderModalOpen, setDealBuilderModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetStep, setBudgetStep] = useState(0);
  const [creditSnapshotModalOpen, setCreditSnapshotModalOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState(false);
  const [gamePlanModalOpen, setGamePlanModalOpen] = useState(false);
  const [buildHomeModalOpen, setBuildHomeModalOpen] = useState(false);
  const [depositsModalOpen, setDepositsModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  
  // Budget/Calculator data
  const [calculatorData, setCalculatorData] = useState({
    applicant: { hourlyRate: '', weeklyOvertimeHours: '', fixedMonthly: '', annualSalary: '', ssi: '', childSupport: '', retirement: '', other: '' },
    coapplicant: { hourlyRate: '', weeklyOvertimeHours: '', fixedMonthly: '', annualSalary: '', ssi: '', childSupport: '', retirement: '', other: '' },
    buyerDebts: { payment1: '', payment2: '', payment3: '', payment4: '', payment5: '', payment6: '', deferredStudentLoans: '', collection1: '', collection2: '', collection3: '', collection4: '', collection5: '' },
    coBuyerDebts: { payment1: '', payment2: '', payment3: '', payment4: '', payment5: '', payment6: '', deferredStudentLoans: '', collection1: '', collection2: '', collection3: '', collection4: '', collection5: '' }
  });
  const [savingCalculator, setSavingCalculator] = useState(false);

  const prospectContext = useProspect({ prospectId, isDeal });

  const {
    prospect,
    buyerInfo,
    setBuyerInfo,
    coBuyerInfo,
    setCoBuyerInfo,
    saveBuyerInfo,
    saveCoBuyerInfo,
    convertToDeal,
    status,
    error
  } = prospectContext;

  // Load users for @mentions
  useEffect(() => {
    if (!userProfile?.companyId) return;

    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName || doc.data().name || doc.data().email,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || ''
      }));
      setUsers(usersData);
    });

    return () => unsub();
  }, [userProfile?.companyId]);

  // Load tasks
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const tasksRef = collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'tasks');
    const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const tasksData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(tasksData);
    });

    return () => unsubTasks();
  }, [userProfile?.companyId, prospectId]);

  // Load prospect-specific notes
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    const notesRef = collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'notes');
    const notesQuery = query(notesRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(notesQuery, (snap) => {
      const notesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotes(notesData);
    });

    return () => unsub();
  }, [userProfile?.companyId, prospectId]);

  // Load documents
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;
    
    const collectionName = isDeal ? 'deals' : 'prospects';
    const q = query(
      collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    });

    return () => unsub();
  }, [userProfile?.companyId, prospectId, isDeal]);

  // Load activities
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;
    const base = ['companies', userProfile.companyId, 'prospects', prospectId];
    const unsubs = [];
    
    const safeAttach = (pathArr, setter) => {
      try {
        const col = collection(db, ...pathArr);
        const q = query(col, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => setter(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        unsubs.push(unsub);
      } catch {
        // ignore if collection missing
      }
    };
    
    safeAttach([...base, 'callLogs'], setCalls);
    safeAttach([...base, 'appointments'], setAppointments);
    safeAttach([...base, 'visits'], setVisits);
    safeAttach([...base, 'emails'], setEmails);
    
    return () => unsubs.forEach(u => u());
  }, [userProfile?.companyId, prospectId]);

  // Combine activities into timeline
  const activities = React.useMemo(() => {
    return [
      ...calls.map(d => ({ id: `call-${d.id}`, type: 'call', title: 'Call Logged', subtitle: d.notes || 'No notes', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...emails.map(d => ({ id: `email-${d.id}`, type: 'email', title: 'Email Sent', subtitle: d.subject || 'No subject', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...appointments.map(d => ({ id: `appt-${d.id}`, type: 'appointment', title: d.title || 'Appointment', subtitle: d.notes || '', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...visits.map(d => ({ id: `visit-${d.id}`, type: 'visit', title: 'Visit Logged', subtitle: d.notes || 'No notes', createdAt: d.createdAt, createdBy: d.createdBy })),
    ].sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [calls, emails, appointments, visits]);

  // Get user display name
  const getUserDisplayName = (email) => {
    if (!email) return '-';
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.displayName || email;
    }
    return email;
  };

  // Detect @mentions
  useEffect(() => {
    const lastAtIndex = noteText.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1 && lastAtIndex < cursorPosition) {
      const searchText = noteText.substring(lastAtIndex + 1, cursorPosition);
      if (!searchText.includes(' ')) {
        setMentionSearch(searchText.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  }, [noteText, cursorPosition]);

  // Initialize housing form when prospect loads
  useEffect(() => {
    if (prospect?.housing) {
      setHousingForm({ ...defaultHousing(), ...prospect.housing });
    }
  }, [prospect?.housing]);

  // Initialize calculator data when prospect loads
  useEffect(() => {
    if (prospect?.calculator) {
      setCalculatorData(prev => ({ ...prev, ...prospect.calculator }));
    }
  }, [prospect?.calculator]);

  const handleHousingChange = (key) => (e) => {
    setHousingForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleNestedChange = (group) => (value) => {
    setHousingForm((f) => ({ ...f, [group]: value }));
  };

  const saveHousingData = async () => {
    if (!userProfile?.companyId || !prospectId) return;
    setSavingHousing(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
      await updateDoc(ref, { housing: housingForm });
    } catch (err) {
      console.error('Error saving housing data:', err);
    } finally {
      setSavingHousing(false);
    }
  };

  // Extract @mentions from text
  const extractMentions = (text) => {
    const mentionRegex = /@([A-Za-z]+)\s+([A-Za-z]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const firstName = match[1];
      const lastName = match[2];
      const user = users.find(u => 
        u.firstName.toLowerCase() === firstName.toLowerCase() && 
        u.lastName.toLowerCase() === lastName.toLowerCase()
      );
      if (user) {
        mentions.push({ email: user.email, name: `${user.firstName} ${user.lastName}` });
      }
    }
    return mentions;
  };

  // Insert mention at cursor position
  const insertMention = (user) => {
    const lastAtIndex = noteText.lastIndexOf('@', cursorPosition);
    const before = noteText.substring(0, lastAtIndex);
    const after = noteText.substring(cursorPosition);
    const mentionText = `@${user.firstName} ${user.lastName}`;
    setNoteText(before + mentionText + ' ' + after);
    setShowMentions(false);
    noteInputRef.current?.focus();
  };

  // Filter users based on mention search
  const filteredUsers = users.filter(user => {
    const name = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    return name.includes(mentionSearch) || email.includes(mentionSearch);
  });

  // Send note
  const handleSendNote = async () => {
    if (!noteText.trim() || !userProfile?.companyId || !prospectId) return;

    const mentions = extractMentions(noteText);
    
    try {
      // Save note
      const notesRef = collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'notes');
      await addDoc(notesRef, {
        text: noteText,
        author: userProfile.email || userProfile.firebaseUser?.email,
        authorName: userProfile.displayName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email,
        mentions: mentions.map(m => m.email),
        createdAt: serverTimestamp(),
        prospectId
      });

      // Create notifications for mentioned users
      if (mentions.length > 0) {
        const notificationsRef = collection(db, 'notifications');
        const prospectName = `${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim() || 'prospect';
        for (const mention of mentions) {
          await addDoc(notificationsRef, {
            recipientEmail: mention.email,
            message: `${userProfile.displayName || userProfile.email} mentioned you in a note on ${prospectName}`,
            type: 'mention',
            read: false,
            prospectId,
            createdAt: serverTimestamp(),
            noteText: noteText
          });
        }
      }

      setNoteText('');
    } catch (error) {
      console.error('Error sending note:', error);
    }
  };

  const handleNoteKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  };

  // Document handlers
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

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
        alert(`File "${file.name}" is not a supported type.`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 25MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newDocuments = validFiles.map(file => ({
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Customer Documents',
      description: '',
      file: file
    }));

    setUploadingDocs(prev => [...prev, ...newDocuments]);
  };

  const updateUploadDoc = (index, field, value) => {
    setUploadingDocs(prev => prev.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  const handleUploadDocuments = async () => {
    if (uploadingDocs.length === 0) return;

    const invalidDocs = uploadingDocs.filter(doc => !doc.name.trim());
    if (invalidDocs.length > 0) {
      alert('Please provide names for all documents');
      return;
    }

    setUploading(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      
      for (const doc of uploadingDocs) {
        const fileName = `${Date.now()}_${doc.file.name}`;
        const storageRef = ref(storage, `companies/${userProfile.companyId}/${collectionName}/${prospectId}/documents/${fileName}`);

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
          createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
        };

        await addDoc(collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents'), docData);
      }

      setUploadingDocs([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents. Please try again.');
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

  const handleDownloadDocument = (document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      alert('Document URL not available');
    }
  };

  // Calculator helper functions
  const setCalculatorField = (path) => (e) => {
    const value = e?.target?.value ?? e;
    setCalculatorData((d) => {
      const keys = path.split('.');
      let curr = { ...d };
      let ref = curr;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        ref[k] = { ...(ref[k] || {}) };
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      return curr;
    });
  };

  const computeApplicantMonthly = (key, d) => {
    const e = d[key] || {};
    const hourly = (parseFloat(e.hourlyRate || 0) * 40 * 52) / 12;
    const overtime = (parseFloat(e.hourlyRate || 0) * 1.5 * parseFloat(e.weeklyOvertimeHours || 0) * 52) / 12;
    const salary = parseFloat(e.annualSalary || 0) / 12;
    const fixed = parseFloat(e.fixedMonthly || 0);
    const ssi = parseFloat(e.ssi || 0);
    const childSupport = parseFloat(e.childSupport || 0);
    const retirement = parseFloat(e.retirement || 0);
    const other = parseFloat(e.other || 0);
    return hourly + overtime + salary + fixed + ssi + childSupport + retirement + other;
  };

  const computeDebtTotal = (key, d) => {
    const debts = d[key] || {};
    return ['payment1', 'payment2', 'payment3', 'payment4', 'payment5', 'payment6', 'deferredStudentLoans', 'collection1', 'collection2', 'collection3', 'collection4', 'collection5']
      .map((f) => parseFloat(debts[f] || 0) || 0)
      .reduce((a,b)=>a+b,0);
  };

  const applicantMonthly = React.useMemo(() => computeApplicantMonthly('applicant', calculatorData), [calculatorData]);
  const coappMonthly = React.useMemo(() => computeApplicantMonthly('coapplicant', calculatorData), [calculatorData]);
  const grossMonthlyIncome = applicantMonthly + coappMonthly;
  const buyerDebtTotal = React.useMemo(() => computeDebtTotal('buyerDebts', calculatorData), [calculatorData]);
  const coBuyerDebtTotal = React.useMemo(() => computeDebtTotal('coBuyerDebts', calculatorData), [calculatorData]);

  const saveCalculatorData = async () => {
    if (!userProfile?.companyId || !prospectId) return;
    setSavingCalculator(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
      await updateDoc(ref, { calculator: calculatorData });
    } catch (err) {
      console.error('Error saving calculator data:', err);
    } finally {
      setSavingCalculator(false);
    }
  };

  const currencyFormat = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const hasCoBuyer = coBuyerInfo && (coBuyerInfo.firstName || coBuyerInfo.lastName || coBuyerInfo.phone || coBuyerInfo.email);

  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (!numScore || isNaN(numScore)) return 'text.disabled';
    if (numScore >= 720) return 'success.main';
    if (numScore >= 650) return 'warning.main';
    return 'error.main';
  };

  if (status === 'loading' || status === 'idle' || !prospect) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography color="error">Failed to load prospect: {error}</Typography>
        </Box>
      </UnifiedLayout>
    );
  }

  const stages = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'pre-approval', label: 'Pre-Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'closing', label: 'Closing' },
    { id: 'construction', label: 'Construction' },
    { id: 'booked', label: 'BOOKED' }
  ];

  const currentStage = prospect?.stage || 'discovery';

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ pl: 3, pr: 3, pt: 3, pb: 3, width: '100%' }}>
        {/* Stage Progress Bar */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 1, overflow: 'visible', py: 1 }}>
          {stages.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isPast = stages.findIndex(s => s.id === currentStage) > index;
            const clipPathValue = index < stages.length - 1 
              ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)' 
              : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)';
            
            return (
              <Box
                key={stage.id}
                sx={(theme) => ({
                  flex: 1,
                  py: 2,
                  px: 3,
                  position: 'relative',
                  ml: index > 0 ? '-20px' : 0,
                  zIndex: stages.length - index,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9
                  },
                  // Border layer (blue outline)
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.palette.primary.main,
                    clipPath: clipPathValue,
                    zIndex: -2
                  },
                  // Fill layer (creates the outline effect for inactive)
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    right: '3px',
                    bottom: '3px',
                    backgroundColor: (isActive || isPast) ? theme.palette.primary.main : '#F1F5F9',
                    clipPath: clipPathValue,
                    zIndex: -1
                  }
                })}
              >
                <Typography sx={{ 
                  fontWeight: (isActive || isPast) ? 700 : 600, 
                  fontSize: 14, 
                  textAlign: 'center', 
                  whiteSpace: 'nowrap',
                  color: (isActive || isPast) ? 'primary.contrastText' : 'primary.main',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stage.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Main Layout: Left (75%) and Right (25%) */}
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left Column - 75% width */}
          <Box sx={{ flex: '1 1 75%', width: { xs: '100%', lg: '75%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Overview Container */}
              <ProspectTopSection 
                buyerInfo={buyerInfo}
                coBuyerInfo={coBuyerInfo}
              setBuyerInfo={setBuyerInfo}
              setCoBuyerInfo={setCoBuyerInfo}
              saveBuyerInfo={saveBuyerInfo}
              saveCoBuyerInfo={saveCoBuyerInfo}
            />

            {/* Navigation Tabs */}
            <ProspectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <Box sx={{ minHeight: 400 }}>
              <TabRouter
                activeTab={activeTab}
                prospectId={prospectId}
                userProfile={userProfile}
                isDeal={isDeal}
                prospectContext={prospectContext}
              />
            </Box>
          </Box>

          {/* Right Column - 25% width, same height as overview */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', lg: 'calc(25% - 16px)' } }}>
            <Paper
              elevation={6}
              sx={{
                backgroundColor: 'customColors.calendarHeaderBackground',
                border: '1px solid',
                borderColor: 'customColors.calendarBorder',
                borderRadius: 4,
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Stack spacing={2}>
                {/* Budget Button */}
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  onClick={() => {
                    setBudgetModalOpen(true);
                    setBudgetStep(0);
                  }}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Budget
                </Button>

                {/* Credit Snapshot Button */}
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setCreditSnapshotModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Credit Snapshot
                </Button>

                {/* Game Plan Button */}
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  onClick={() => setGamePlanModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Game Plan
                </Button>

                {/* Build Home Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setBuildHomeModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none',
                    backgroundColor: '#0EA5E9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0284C7'
                    }
                  }}
                >
                  Build Home
                </Button>

                {/* Deposits Button */}
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => setDepositsModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Deposits
                </Button>

                {/* Application Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setApplicationModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Application
                </Button>

                {/* Deal Builder Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setDealBuilderModalOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none',
                    backgroundColor: '#059669',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#047857'
                    }
                  }}
                >
                  Deal Builder
                </Button>
              </Stack>
                </Paper>
            </Box>
          </Box>

        {/* Budget Modal */}
        <Dialog
          open={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '80vh'
            }
          }}
        >
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '80vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Budget - {budgetStep === 0 ? 'Income Calculator' : 'Debts'}
                  </Typography>
              <IconButton onClick={() => setBudgetModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Page Content */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
              {budgetStep === 0 && (
                <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                    Income Calculator
                  </Typography>
                  
                  {/* Income Form */}
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Buyer Income Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Buyer Income
                        </Typography>
                      </Box>
                      <Stack spacing={2.5}>
                        <FormTextField label="Hourly Rate" type="number" value={calculatorData.applicant.hourlyRate || ''} onChange={setCalculatorField('applicant.hourlyRate')} />
                        <FormTextField label="Overtime Hours (Weekly)" type="number" value={calculatorData.applicant.weeklyOvertimeHours || ''} onChange={setCalculatorField('applicant.weeklyOvertimeHours')} />
                        <FormTextField label="Annual Salary" type="number" value={calculatorData.applicant.annualSalary || ''} onChange={setCalculatorField('applicant.annualSalary')} />
                        <FormTextField label="Fixed Monthly" type="number" value={calculatorData.applicant.fixedMonthly || ''} onChange={setCalculatorField('applicant.fixedMonthly')} />
                        <FormTextField label="SSI/Disability" type="number" value={calculatorData.applicant.ssi || ''} onChange={setCalculatorField('applicant.ssi')} />
                        <FormTextField label="Child Support" type="number" value={calculatorData.applicant.childSupport || ''} onChange={setCalculatorField('applicant.childSupport')} />
                        <FormTextField label="Retirement" type="number" value={calculatorData.applicant.retirement || ''} onChange={setCalculatorField('applicant.retirement')} />
                        <FormTextField label="Other Income" type="number" value={calculatorData.applicant.other || ''} onChange={setCalculatorField('applicant.other')} />
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                          <Stack spacing={0.5}>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                            <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currencyFormat(applicantMonthly)}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Co-Buyer Income Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Co-Buyer Income
                        </Typography>
                      </Box>
                      <Stack spacing={2.5}>
                        <FormTextField label="Hourly Rate" type="number" value={calculatorData.coapplicant.hourlyRate || ''} onChange={setCalculatorField('coapplicant.hourlyRate')} />
                        <FormTextField label="Overtime Hours (Weekly)" type="number" value={calculatorData.coapplicant.weeklyOvertimeHours || ''} onChange={setCalculatorField('coapplicant.weeklyOvertimeHours')} />
                        <FormTextField label="Annual Salary" type="number" value={calculatorData.coapplicant.annualSalary || ''} onChange={setCalculatorField('coapplicant.annualSalary')} />
                        <FormTextField label="Fixed Monthly" type="number" value={calculatorData.coapplicant.fixedMonthly || ''} onChange={setCalculatorField('coapplicant.fixedMonthly')} />
                        <FormTextField label="SSI/Disability" type="number" value={calculatorData.coapplicant.ssi || ''} onChange={setCalculatorField('coapplicant.ssi')} />
                        <FormTextField label="Child Support" type="number" value={calculatorData.coapplicant.childSupport || ''} onChange={setCalculatorField('coapplicant.childSupport')} />
                        <FormTextField label="Retirement" type="number" value={calculatorData.coapplicant.retirement || ''} onChange={setCalculatorField('coapplicant.retirement')} />
                        <FormTextField label="Other Income" type="number" value={calculatorData.coapplicant.other || ''} onChange={setCalculatorField('coapplicant.other')} />
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                          <Stack spacing={0.5}>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                            <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currencyFormat(coappMonthly)}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Combined Total */}
                  <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid', borderTopColor: 'primary.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
                      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>Combined Monthly Income</Typography>
                      <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 22 }}>{currencyFormat(grossMonthlyIncome)}</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {budgetStep === 1 && (
                <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                    Monthly Debts & Obligations
                  </Typography>
                  
                  {/* Debt Form */}
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Buyer Debts Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Buyer
                        </Typography>
            </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                        {/* Payments */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                            Payments
                          </Typography>
                          <Stack spacing={2}>
                            <FormTextField label="Payment 1" type="number" value={calculatorData.buyerDebts?.payment1 || ''} onChange={setCalculatorField('buyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 2" type="number" value={calculatorData.buyerDebts?.payment2 || ''} onChange={setCalculatorField('buyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 3" type="number" value={calculatorData.buyerDebts?.payment3 || ''} onChange={setCalculatorField('buyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 4" type="number" value={calculatorData.buyerDebts?.payment4 || ''} onChange={setCalculatorField('buyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 5" type="number" value={calculatorData.buyerDebts?.payment5 || ''} onChange={setCalculatorField('buyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 6" type="number" value={calculatorData.buyerDebts?.payment6 || ''} onChange={setCalculatorField('buyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
                          </Stack>
                        </Box>

                        {/* Collections */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                            Other Obligations
                          </Typography>
                          <Stack spacing={2}>
                            <FormTextField label="Deferred Student Loans" type="number" value={calculatorData.buyerDebts?.deferredStudentLoans || ''} onChange={setCalculatorField('buyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 1 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection1 || ''} onChange={setCalculatorField('buyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 2 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection2 || ''} onChange={setCalculatorField('buyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 3 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection3 || ''} onChange={setCalculatorField('buyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 4 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection4 || ''} onChange={setCalculatorField('buyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 5 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection5 || ''} onChange={setCalculatorField('buyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
                          </Stack>
          </Box>
        </Box>

                      {/* Monthly Total */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                        <Stack spacing={0.5}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                          <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currencyFormat(buyerDebtTotal)}</Typography>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Co-Buyer Debts Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Co-Buyer
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                        {/* Payments */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                            Payments
                          </Typography>
                          <Stack spacing={2}>
                            <FormTextField label="Payment 1" type="number" value={calculatorData.coBuyerDebts?.payment1 || ''} onChange={setCalculatorField('coBuyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 2" type="number" value={calculatorData.coBuyerDebts?.payment2 || ''} onChange={setCalculatorField('coBuyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 3" type="number" value={calculatorData.coBuyerDebts?.payment3 || ''} onChange={setCalculatorField('coBuyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 4" type="number" value={calculatorData.coBuyerDebts?.payment4 || ''} onChange={setCalculatorField('coBuyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 5" type="number" value={calculatorData.coBuyerDebts?.payment5 || ''} onChange={setCalculatorField('coBuyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Payment 6" type="number" value={calculatorData.coBuyerDebts?.payment6 || ''} onChange={setCalculatorField('coBuyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
                          </Stack>
                        </Box>

                        {/* Collections */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                            Other Obligations
                          </Typography>
                          <Stack spacing={2}>
                            <FormTextField label="Deferred Student Loans" type="number" value={calculatorData.coBuyerDebts?.deferredStudentLoans || ''} onChange={setCalculatorField('coBuyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 1 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection1 || ''} onChange={setCalculatorField('coBuyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 2 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection2 || ''} onChange={setCalculatorField('coBuyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 3 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection3 || ''} onChange={setCalculatorField('coBuyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 4 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection4 || ''} onChange={setCalculatorField('coBuyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
                            <FormTextField label="Collection 5 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection5 || ''} onChange={setCalculatorField('coBuyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
                          </Stack>
                        </Box>
                      </Box>

                      {/* Monthly Total */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                        <Stack spacing={0.5}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                          <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currencyFormat(coBuyerDebtTotal)}</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <Button
                variant="outlined"
                onClick={async () => {
                  await saveCalculatorData();
                  setBudgetStep(0);
                }}
                disabled={budgetStep === 0 || savingCalculator}
                sx={{ 
                  minWidth: 120,
                  color: 'text.primary', 
                  borderColor: 'customColors.calendarBorder',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                }}
              >
                {savingCalculator ? 'Saving...' : 'Previous'}
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {[0, 1].map((step) => (
                  <Box
                    key={step}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: budgetStep === step ? 'primary.main' : 'customColors.calendarBorder',
                      transition: 'all 0.3s'
                    }}
                  />
              ))}
            </Box>

              <Button
                variant="contained"
                onClick={async () => {
                  await saveCalculatorData();
                  if (budgetStep < 1) {
                    setBudgetStep(budgetStep + 1);
                  } else {
                    setBudgetModalOpen(false);
                  }
                }}
                disabled={savingCalculator}
                sx={{ 
                  minWidth: 120,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.7
                  }
                }}
              >
                {savingCalculator ? 'Saving...' : (budgetStep === 1 ? 'Save & Close' : 'Next')}
              </Button>
          </Box>
        </Box>
        </Dialog>

        {/* Game Plan Modal */}
        <Dialog
          open={gamePlanModalOpen}
          onClose={() => setGamePlanModalOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '80vh'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Game Plan - Select Homes
              </Typography>
              <IconButton onClick={() => setGamePlanModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Game Plan Content */}
            <GamePlan
                prospectId={prospectId}
                userProfile={userProfile}
                isDeal={isDeal}
              />
            </Box>
        </Dialog>

        {/* Build Home (EMC) Modal */}
        <Dialog
          open={buildHomeModalOpen}
          onClose={() => setBuildHomeModalOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '85vh',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Build Home - EMC Tool
              </Typography>
              <IconButton onClick={() => setBuildHomeModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
          </Box>

            {/* EMC Tool Content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <EMC
                companyId={userProfile?.companyId}
                prospectId={prospectId}
                isDeal={isDeal}
              />
            </Box>
          </Box>
        </Dialog>

        {/* Deposits Modal */}
        <Dialog
          open={depositsModalOpen}
          onClose={() => setDepositsModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '70vh'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Deposits
              </Typography>
              <IconButton onClick={() => setDepositsModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
        </Box>

            {/* Deposits Content */}
            <DepositTab
              prospectId={prospectId}
              isDeal={isDeal}
              context={prospectContext}
            />
          </Box>
        </Dialog>

        {/* Application Modal */}
        <Dialog
          open={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '75vh'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Application
              </Typography>
              <IconButton onClick={() => setApplicationModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Application Content */}
            <ApplicationTab
              prospectId={prospectId}
              userProfile={userProfile}
              context={prospectContext}
            />
          </Box>
        </Dialog>

        {/* Credit Snapshot Modal */}
        <Dialog
          open={creditSnapshotModalOpen}
          onClose={() => setCreditSnapshotModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '70vh'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Credit Snapshot
              </Typography>
              <Stack direction="row" spacing={1}>
                {!editingCredit ? (
                  <IconButton onClick={() => setEditingCredit(true)} sx={{ color: 'text.primary' }}>
                    <EditIcon />
                  </IconButton>
                ) : (
                  <>
                    <Button onClick={async () => {
                      await prospectContext.saveCreditData();
                      setEditingCredit(false);
                    }} variant="contained" color="success" size="small">
                      Save
                    </Button>
                    <Button onClick={() => setEditingCredit(false)} variant="outlined" size="small">
                      Cancel
                    </Button>
                  </>
                )}
                <IconButton onClick={() => setCreditSnapshotModalOpen(false)} sx={{ color: 'text.primary' }}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Content */}
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              {!editingCredit ? (
                <CreditSnapshotDisplayContent creditData={prospectContext?.creditData} getScoreColor={getScoreColor} />
              ) : (
                <CreditSnapshotEditContent creditData={prospectContext?.creditData} setCreditData={prospectContext?.setCreditData} getScoreColor={getScoreColor} />
              )}
            </Paper>
          </Box>
        </Dialog>

        {/* Deal Builder Modal */}
        <Dialog
          open={dealBuilderModalOpen}
          onClose={() => setDealBuilderModalOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '85vh',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Deal Builder
              </Typography>
              <IconButton onClick={() => setDealBuilderModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
        </Box>

            {/* Deal Builder Content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <DealBuilder
                companyId={userProfile?.companyId}
                prospectId={prospectId}
                isDeal={isDeal}
                initial={null}
              />
          </Box>
        </Box>
        </Dialog>

        {/* Home Needs Modal */}
        <Dialog
          open={homeNeedsModalOpen}
          onClose={() => setHomeNeedsModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '80vh'
            }
          }}
        >
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '80vh' }}>
            {/* Header with Close */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Home Needs - {currentStep === 0 ? 'Housing Information' : currentStep === 1 ? 'Home Placement' : 'Lender Information'}
              </Typography>
              <IconButton onClick={() => setHomeNeedsModalOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Page Content */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
              {/* Page 1: Housing Information */}
              {currentStep === 0 && (
                <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                    Housing Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Home Preferences Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Home Preferences
                    </Typography>
                  </Box>
                      <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 2 }}>
                            <FormSelect
                              label="Home Type"
                              value={housingForm.homeType || ''}
                              onChange={handleHousingChange('homeType')}
                              options={[
                                { value: 'singlewide', label: 'Single Wide' },
                                { value: 'doublewide', label: 'Double Wide' },
                                { value: 'triplewide', label: 'Triple Wide' },
                                { value: 'tiny home', label: 'Tiny Home' }
                              ]}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                        <FormTextField
                              label="Bed"
                              type="number"
                              value={housingForm.prefBed || ''}
                              onChange={handleHousingChange('prefBed')}
                        />
                      </Box>
                          <Box sx={{ flex: 1 }}>
                        <FormTextField
                              label="Bath"
                              type="number"
                              value={housingForm.prefBath || ''}
                              onChange={handleHousingChange('prefBath')}
                        />
                      </Box>
                        </Box>
                        <FormTextField
                          label="Sq Footage"
                          type="number"
                          value={housingForm.prefSqft || ''}
                          onChange={handleHousingChange('prefSqft')}
                        />
                        <FormTextField
                          label="Desired Features"
                          value={housingForm.desiredFeatures || ''}
                          onChange={handleHousingChange('desiredFeatures')}
                          multiline
                          minRows={2}
                        />
                      </Stack>
                      </Box>

                    {/* Current Living Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Current Living
                        </Typography>
                    </Box>
                      <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <FormSelect
                              label="Own/Rent"
                              value={housingForm.currentOwnRent || ''}
                              onChange={handleHousingChange('currentOwnRent')}
                              options={[
                                { value: 'own', label: 'Own' },
                                { value: 'rent', label: 'Rent' }
                              ]}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <FormSelect
                              label="Apt/Home"
                              value={housingForm.currentHomeType || ''}
                              onChange={handleHousingChange('currentHomeType')}
                              options={[
                                { value: 'apartment', label: 'Apartment' },
                                { value: 'house', label: 'House' },
                                { value: 'condo', label: 'Condo' },
                                { value: 'mobile home', label: 'Mobile Home' }
                              ]}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                      <FormTextField
                              label="How Long?"
                              value={housingForm.currentHowLong || ''}
                              onChange={handleHousingChange('currentHowLong')}
                              placeholder="e.g., 2 years"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 2 }}>
                        <FormTextField
                              label="Current Payment"
                              type="number"
                              value={housingForm.currentMonthlyPayment || ''}
                              onChange={handleHousingChange('currentMonthlyPayment')}
                              InputProps={{ startAdornment: '$' }}
                        />
                      </Box>
                          <Box sx={{ flex: 1 }}>
                    <FormTextField
                              label="Bed"
                              type="number"
                              value={housingForm.currentBed || ''}
                              onChange={handleHousingChange('currentBed')}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <FormTextField
                              label="Bath"
                              type="number"
                              value={housingForm.currentBath || ''}
                              onChange={handleHousingChange('currentBath')}
                            />
                          </Box>
                        </Box>
                        <FormTextField
                          label="Likes"
                          value={housingForm.likes || ''}
                          onChange={handleHousingChange('likes')}
                          multiline
                          minRows={2}
                        />
                        <FormTextField
                          label="Dislikes"
                          value={housingForm.dislikes || ''}
                          onChange={handleHousingChange('dislikes')}
                          multiline
                          minRows={2}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Page 2: Home Placement */}
              {currentStep === 1 && (
                <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                    Home Placement
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Situation Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Situation
                        </Typography>
                      </Box>
                      <Stack spacing={2.5}>
                        <FormSelect
                          label="Have you identified a location for your home?"
                          value={housingForm.hasIdentifiedLocation === true ? 'yes' : (housingForm.hasIdentifiedLocation === false ? 'no' : '')}
                          onChange={(e) => handleNestedChange('hasIdentifiedLocation')(e.target.value === 'yes')}
                          options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' }
                          ]}
                        />
                        <FormTextField
                          label="Timeframe for Move in?"
                          value={housingForm.moveInTimeframe || ''}
                          onChange={handleHousingChange('moveInTimeframe')}
                          placeholder="e.g., 3-6 months"
                        />
                        <FormTextField
                          label="What would prevent you from moving sooner?"
                          value={housingForm.preventMovingSooner || ''}
                          onChange={handleHousingChange('preventMovingSooner')}
                          multiline
                          minRows={2}
                        />
                      </Stack>
                    </Box>

                    {/* Land Info Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Land Info
                        </Typography>
                      </Box>
                      <Stack spacing={2.5}>
                        {housingForm.hasIdentifiedLocation === true && (
                          <>
                            <FormSelect
                              label="Location Type"
                              value={housingForm.locationType || ''}
                              onChange={handleHousingChange('locationType')}
                              options={[
                                { value: 'community', label: 'Community' },
                                { value: 'private property', label: 'Private Property' },
                                { value: 'family land', label: 'Family Land' }
                              ]}
                            />
                            <Box>
                              <Typography sx={{ color: 'text.primary', fontWeight: 500, mb: 1, fontSize: 14 }}>
                                Does your land have improvements?
                              </Typography>
                              <Stack direction="row" spacing={2} flexWrap="wrap">
                                {['electric', 'water', 'septic', 'drive', 'pad'].map(key => (
                                  <FormControlLabel
                                    key={key}
                                    control={
                                      <Checkbox
                                        checked={!!housingForm.landImprovements?.[key]}
                                        onChange={(e) => handleNestedChange('landImprovements')({ ...(housingForm.landImprovements || {}), [key]: e.target.checked })}
                                      />
                                    }
                                    label={labelize(key)}
                                  />
                                ))}
                              </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                      <FormTextField
                                  label="Size"
                                  value={housingForm.landSize || ''}
                                  onChange={handleHousingChange('landSize')}
                                  placeholder="e.g., 5 acres"
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                      <FormTextField
                                  label="Payoff"
                                  type="number"
                                  value={housingForm.landPayoff || ''}
                                  onChange={handleHousingChange('landPayoff')}
                                  InputProps={{ startAdornment: '$' }}
                      />
                    </Box>
                              <Box sx={{ flex: 1 }}>
                    <FormTextField
                                  label="Mo. Pay"
                                  type="number"
                                  value={housingForm.landMonthlyPayment || ''}
                                  onChange={handleHousingChange('landMonthlyPayment')}
                                  InputProps={{ startAdornment: '$' }}
                      />
                    </Box>
                  </Box>
                          </>
                        )}

                        {housingForm.hasIdentifiedLocation === false && (
                          <>
                      <FormTextField
                              label="What area do you want to live in?"
                              value={housingForm.desiredArea || ''}
                              onChange={handleHousingChange('desiredArea')}
                              placeholder="City, county, or general area"
                      />
                      <FormTextField
                              label="How much land?"
                              value={housingForm.desiredLandSize || ''}
                              onChange={handleHousingChange('desiredLandSize')}
                              placeholder="e.g., 1-5 acres"
                            />
                          </>
                        )}

                        {housingForm.hasIdentifiedLocation !== true && housingForm.hasIdentifiedLocation !== false && (
                          <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
                            Answer the location question to enter land details
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
              </Paper>
              )}

              {/* Page 3: Lender Information */}
              {currentStep === 2 && (
                <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                    Lender Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Pricing Needs Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Pricing Needs
                    </Typography>
                  </Box>
                      <Stack spacing={2.5}>
                        <FormSelect
                          label="Cash/Financing"
                          value={housingForm.dealType || ''}
                          onChange={handleHousingChange('dealType')}
                          options={[
                            { value: 'cash', label: 'Cash' },
                            { value: 'chattel', label: 'Chattel' },
                            { value: 'land/home', label: 'Land/Home' },
                            { value: 'lnl', label: 'LNL' }
                          ]}
                        />

                        {housingForm.dealType === 'cash' && (
                          <>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                      <FormTextField
                                  label="Ideal Price"
                                  type="number"
                                  value={housingForm.idealPrice || ''}
                                  onChange={handleHousingChange('idealPrice')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                </Box>
                              <Box sx={{ flex: 1 }}>
                      <FormTextField
                                  label="Max Price"
                                  type="number"
                                  value={housingForm.maxPrice || ''}
                                  onChange={handleHousingChange('maxPrice')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                      <FormTextField
                                  label="Available"
                                  type="number"
                                  value={housingForm.cashAvailable || ''}
                                  onChange={handleHousingChange('cashAvailable')}
                                  InputProps={{ startAdornment: '$' }}
                      />
                    </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormSelect
                                  label="Source"
                                  value={housingForm.cashSource || ''}
                                  onChange={handleHousingChange('cashSource')}
                                  options={[
                                    { value: 'checking', label: 'Checking' },
                                    { value: 'savings', label: 'Savings' },
                                    { value: 'gift', label: 'Gift' },
                                    { value: '401k', label: '401k' },
                                    { value: 'sale', label: 'Sale' }
                                  ]}
                                />
                  </Box>
                            </Box>
                          </>
                        )}

                        {housingForm.dealType && housingForm.dealType !== 'cash' && (
                          <>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Ideal Payment"
                                  type="number"
                                  value={housingForm.idealMonthlyPayment || ''}
                                  onChange={handleHousingChange('idealMonthlyPayment')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Max Payment"
                                  type="number"
                                  value={housingForm.maxMonthlyPayment || ''}
                                  onChange={handleHousingChange('maxMonthlyPayment')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Down Payment"
                                  type="number"
                                  value={housingForm.downPayment || ''}
                                  onChange={handleHousingChange('downPayment')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Available"
                                  type="number"
                                  value={housingForm.availableToday || ''}
                                  onChange={handleHousingChange('availableToday')}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormSelect
                                  label="Source"
                                  value={housingForm.fundsSource || ''}
                                  onChange={handleHousingChange('fundsSource')}
                                  options={[
                                    { value: 'checking', label: 'Checking' },
                                    { value: 'savings', label: 'Savings' },
                                    { value: 'gift', label: 'Gift' },
                                    { value: '401k', label: '401k' },
                                    { value: 'land', label: 'Land' }
                                  ]}
                                />
                  </Box>
                </Box>
                          </>
                        )}
                      </Stack>
                  </Box>

                    {/* Employment Information Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                          Employment Information
                    </Typography>
                  </Box>
                      <Stack spacing={2.5}>
                        {housingForm.dealType && housingForm.dealType !== 'cash' ? (
                          <>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 2 }}>
                                <FormTextField
                                  label="Buyer Employer"
                                  value={housingForm.buyerEmployer || ''}
                                  onChange={handleHousingChange('buyerEmployer')}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Start Date"
                                  type="date"
                                  value={housingForm.buyerStartDate || ''}
                                  onChange={handleHousingChange('buyerStartDate')}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 2 }}>
                                <FormTextField
                                  label="Co-Buyer Employer"
                                  value={housingForm.coBuyerEmployer || ''}
                                  onChange={handleHousingChange('coBuyerEmployer')}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <FormTextField
                                  label="Start Date"
                                  type="date"
                                  value={housingForm.coBuyerStartDate || ''}
                                  onChange={handleHousingChange('coBuyerStartDate')}
                                  InputLabelProps={{ shrink: true }}
                                />
                  </Box>
                </Box>
                          </>
                        ) : (
                          <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
                            Only needed if financing
                    </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
              </Paper>
              )}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <Button
                variant="outlined"
                onClick={async () => {
                  await saveHousingData();
                  setCurrentStep(Math.max(0, currentStep - 1));
                }}
                disabled={currentStep === 0 || savingHousing}
                      sx={{ 
                  minWidth: 120,
                        color: 'text.primary',
                  borderColor: 'customColors.calendarBorder',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                }}
              >
                {savingHousing ? 'Saving...' : 'Previous'}
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {[0, 1, 2].map((step) => (
                  <Box
                    key={step}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: currentStep === step ? 'primary.main' : 'customColors.calendarBorder',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
                  </Box>

              <Button
                variant="contained"
                onClick={async () => {
                  await saveHousingData();
                  if (currentStep < 2) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    setHomeNeedsModalOpen(false);
                  }
                }}
                disabled={savingHousing}
                sx={{ 
                  minWidth: 120,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.7
                  }
                }}
              >
                {savingHousing ? 'Saving...' : (currentStep === 2 ? 'Save & Close' : 'Next')}
              </Button>
                </Box>
                  </Box>
        </Dialog>

        {/* Speed Dial - Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            '& .MuiSpeedDial-fab': {
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          <SpeedDialAction
            icon={<TaskIcon />}
            tooltipTitle="Tasks"
            onClick={() => {
              setSpeedDialOpen(false);
              setTasksDrawerOpen(true);
            }}
            sx={{
              backgroundColor: 'warning.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'warning.dark'
              }
            }}
          />
          <SpeedDialAction
            icon={<DescriptionIcon />}
            tooltipTitle="Documents"
            onClick={() => {
              setSpeedDialOpen(false);
              setDocumentsDrawerOpen(true);
            }}
            sx={{
              backgroundColor: 'success.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'success.dark'
              }
            }}
          />
          <SpeedDialAction
            icon={<TimelineIcon />}
            tooltipTitle="Activities"
            onClick={() => {
              setSpeedDialOpen(false);
              setActivitiesDrawerOpen(true);
            }}
            sx={{
              backgroundColor: 'secondary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'secondary.dark'
              }
            }}
          />
          <SpeedDialAction
            icon={<ChatIcon />}
            tooltipTitle="Notes"
            onClick={() => {
              setSpeedDialOpen(false);
              setNotesDrawerOpen(true);
            }}
            sx={{
              backgroundColor: 'info.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'info.dark'
              }
            }}
          />
        </SpeedDial>

        {/* Tasks Drawer */}
        <Drawer
          anchor="right"
          open={tasksDrawerOpen}
          onClose={() => setTasksDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 450 },
              backgroundColor: 'background.paper'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Tasks</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                    {buyerInfo?.firstName} {buyerInfo?.lastName}
                  </Typography>
                </Box>
                <IconButton onClick={() => setTasksDrawerOpen(false)} size="small">
                  <CloseIcon />
                    </IconButton>
              </Box>
              
              {/* Create Task Button */}
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<TaskIcon />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Create Task
              </Button>
            </Box>

            {/* Tasks List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={2}>
                {tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <Box
                      key={task.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: isCompleted ? 'success.lighterOpacity' : 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { backgroundColor: isCompleted ? 'success.lightOpacity' : 'action.selected' }
                      }}
                    >
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {task.title || 'Untitled Task'}
                    </Typography>
                          <Chip
                            size="small"
                            label={task.status || 'pending'}
                            color={isCompleted ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'}
                            sx={{ fontSize: 11, height: 20 }}
                          />
                  </Box>
                        {task.description && (
                          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {task.description}
                          </Typography>
                        )}
                        <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                          Due: {task.dueDate?.toDate?.().toLocaleDateString() || 'No due date'}
                        </Typography>
                      </Stack>
                </Box>
                  );
                })}
                {tasks.length === 0 && (
                  <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                    No tasks yet. Create one above!
                    </Typography>
                )}
              </Stack>
                  </Box>
          </Box>
        </Drawer>

        {/* Activities Drawer */}
        <Drawer
          anchor="right"
          open={activitiesDrawerOpen}
          onClose={() => setActivitiesDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 450 },
              backgroundColor: 'background.paper'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Activity Timeline</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                    {buyerInfo?.firstName} {buyerInfo?.lastName}
                    </Typography>
                  </Box>
                <IconButton onClick={() => setActivitiesDrawerOpen(false)} size="small">
                  <CloseIcon />
                    </IconButton>
                </Box>
              
              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => setCallDrawerOpen(true)}
                  size="small"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Call
                </Button>
                <Button
                  onClick={() => setEmailDrawerOpen(true)}
                  size="small"
                  variant="contained"
                  color="info"
                  fullWidth
                >
                  Email
                </Button>
                <Button
                  onClick={() => setAppointmentDrawerOpen(true)}
                  size="small"
                  variant="contained"
                  color="secondary"
                  fullWidth
                >
                  Appointment
                </Button>
                <Button
                  onClick={() => setVisitDrawerOpen(true)}
                  size="small"
                  variant="contained"
                  color="warning"
                  fullWidth
                >
                  Visit
                </Button>
              </Stack>
                  </Box>

            {/* Activities List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={2}>
                {activities.map((item) => {
                  const getActivityIcon = () => {
                    switch (item.type) {
                      case 'call': return <PhoneIcon sx={{ fontSize: 20, color: 'info.main' }} />;
                      case 'email': return <EmailIcon sx={{ fontSize: 20, color: 'warning.main' }} />;
                      case 'appointment': return <EventIcon sx={{ fontSize: 20, color: 'success.main' }} />;
                      case 'visit': return <HomeIcon sx={{ fontSize: 20, color: 'secondary.main' }} />;
                      default: return <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />;
                    }
                  };

                  return (
                    <Box
                      key={item.id}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box sx={{ mt: 0.5 }}>
                          {getActivityIcon()}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600 }}>
                            {item.title}
                    </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
                            {item.subtitle}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                              {item.createdAt?.toDate?.().toLocaleString([], { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) || 'Recently'}
                            </Typography>
                            <Chip 
                      size="small"
                              label={getUserDisplayName(item.createdBy)} 
                              sx={{ 
                                bgcolor: 'primary.lighterOpacity', 
                                color: 'primary.main',
                                height: 20,
                                fontSize: 11
                              }} 
                            />
                          </Stack>
                  </Box>
                      </Stack>
                </Box>
                  );
                })}
                {activities.length === 0 && (
                  <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                    No activities yet.
                    </Typography>
                )}
              </Stack>
                  </Box>
          </Box>
        </Drawer>

        {/* Documents Drawer */}
        <Drawer
          anchor="right"
          open={documentsDrawerOpen}
          onClose={() => setDocumentsDrawerOpen(false)}
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
                    {buyerInfo?.firstName} {buyerInfo?.lastName}
                    </Typography>
                  </Box>
                <IconButton onClick={() => setDocumentsDrawerOpen(false)} size="small">
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
                            onClick={() => setUploadingDocs(prev => prev.filter((_, i) => i !== index))}
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
                          <MenuItem value="Customer Documents">Customer Documents</MenuItem>
                          <MenuItem value="Credit Application Documents">Credit Application Documents</MenuItem>
                          <MenuItem value="Income Documents">Income Documents</MenuItem>
                          <MenuItem value="Home Documents">Home Documents</MenuItem>
                          <MenuItem value="Property Documents">Property Documents</MenuItem>
                          <MenuItem value="Closing Documents">Closing Documents</MenuItem>
                          <MenuItem value="Other Documents">Other Documents</MenuItem>
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

        {/* Notes Drawer */}
        <Drawer
          anchor="right"
          open={notesDrawerOpen}
          onClose={() => setNotesDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 400 },
              backgroundColor: 'background.paper'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Quick Notes</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                  {buyerInfo?.firstName} {buyerInfo?.lastName}
                    </Typography>
                  </Box>
              <IconButton onClick={() => setNotesDrawerOpen(false)} size="small">
                <CloseIcon />
                    </IconButton>
            </Box>

            {/* Notes List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={2}>
                {notes.map((note) => (
                  <Box
                    key={note.id}
                      sx={{ 
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {note.authorName?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 600 }}>
                          {note.authorName}
                        </Typography>
                        <Typography sx={{ color: 'text.primary', fontSize: 14, mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {note.text}
                        </Typography>
                        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 1 }}>
                          {note.createdAt?.toDate?.().toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) || 'Just now'}
                    </Typography>
          </Box>
                    </Stack>
                </Box>
                ))}
                {notes.length === 0 && (
                  <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                    No notes yet. Add one below!
                    </Typography>
                )}
              </Stack>
                  </Box>

            {/* Mention Suggestions */}
            {showMentions && filteredUsers.length > 0 && (
              <Box
                sx={{
                  mx: 2,
                  mb: 1,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  boxShadow: '0px -2px 8px rgba(100, 116, 139, 0.1)'
                }}
              >
                <List sx={{ py: 0 }}>
                  {filteredUsers.slice(0, 5).map((user) => (
                    <ListItemButton
                      key={user.email}
                      onClick={() => insertMention(user)}
                      sx={{ py: 1, px: 2 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                          {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={user.email}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                      </Stack>
                    </ListItemButton>
                  ))}
                </List>
            </Box>
            )}

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
              <Stack spacing={1.5}>
                <TextField
                  inputRef={noteInputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type @ to mention someone..."
                  value={noteText}
                  onChange={(e) => {
                    setNoteText(e.target.value);
                    setCursorPosition(e.target.selectionStart);
                  }}
                  onKeyPress={handleNoteKeyPress}
                  onSelect={(e) => setCursorPosition(e.target.selectionStart)}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendNote}
                  disabled={!noteText.trim()}
                  fullWidth
                >
                  Add Note
                </Button>
              </Stack>
          </Box>
          </Box>
        </Drawer>

        {/* Activity Action Drawers */}
        <LeadCallLogDrawer
          open={callDrawerOpen}
          onClose={() => setCallDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <EmailDrawer
          open={emailDrawerOpen}
          onClose={() => setEmailDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <LeadAppointmentDrawer
          open={appointmentDrawerOpen}
          onClose={() => setAppointmentDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <VisitLogDrawer
          open={visitDrawerOpen}
          onClose={() => setVisitDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <LeadTaskDrawer
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
      </Box>
    </UnifiedLayout>
  );
}

// Main component with context provider
function ProspectPortal() {
  const params = useParams();
  const { userProfile } = useUser();

  // Handle both prospect and deal routes
  const prospectId = params.prospectId || params.dealId;
  const isDeal = !!params.dealId;


  // Don't render until userProfile is available
  if (!userProfile) {
  return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
                  </Box>
      </UnifiedLayout>
    );
  }

  return (
    <ProspectPortalContent userProfile={userProfile} prospectId={prospectId} isDeal={isDeal} />
  );
}

// Credit Snapshot Display Component
function CreditSnapshotDisplayContent({ creditData, getScoreColor }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.disabled', fontSize: 17 }}>—</Typography>;

  const buyer = creditData || {};
  const coBuyer = creditData || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Date of Birth</Typography>{show(buyer.buyerDOB)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>DL</Typography>{show(buyer.buyerDL)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>State</Typography>{show(buyer.buyerDLState)}</Stack></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>SSN</Typography>{show(buyer.buyerSSN)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Gender</Typography>{show(buyer.buyerGender)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Race</Typography>{show(buyer.buyerRace)}</Stack></Box>
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Date of Birth</Typography>{show(coBuyer.coBuyerDOB)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>DL</Typography>{show(coBuyer.coBuyerDL)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>State</Typography>{show(coBuyer.coBuyerDLState)}</Stack></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>SSN</Typography>{show(coBuyer.coBuyerSSN)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Gender</Typography>{show(coBuyer.coBuyerGender)}</Stack></Box>
              <Box sx={{ flex: 1 }}><Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Race</Typography>{show(coBuyer.coBuyerRace)}</Stack></Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>TransUnion</Typography><Typography sx={{ color: getScoreColor(buyer.buyerTransUnion), fontSize: 20, fontWeight: 700 }}>{buyer.buyerTransUnion || '-'}</Typography></Stack>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Equifax</Typography><Typography sx={{ color: getScoreColor(buyer.buyerEquifax), fontSize: 20, fontWeight: 700 }}>{buyer.buyerEquifax || '-'}</Typography></Stack>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Experian</Typography><Typography sx={{ color: getScoreColor(buyer.buyerExperian), fontSize: 20, fontWeight: 700 }}>{buyer.buyerExperian || '-'}</Typography></Stack>
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>TransUnion</Typography><Typography sx={{ color: getScoreColor(coBuyer.coBuyerTransUnion), fontSize: 20, fontWeight: 700 }}>{coBuyer.coBuyerTransUnion || '-'}</Typography></Stack>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Equifax</Typography><Typography sx={{ color: getScoreColor(coBuyer.coBuyerEquifax), fontSize: 20, fontWeight: 700 }}>{coBuyer.coBuyerEquifax || '-'}</Typography></Stack>
            <Stack spacing={0.5}><Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Experian</Typography><Typography sx={{ color: getScoreColor(coBuyer.coBuyerExperian), fontSize: 20, fontWeight: 700 }}>{coBuyer.coBuyerExperian || '-'}</Typography></Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

// Credit Snapshot Edit Component  
function CreditSnapshotEditContent({ creditData, setCreditData, getScoreColor }) {
  const credit = creditData || {};

  const handleChange = (field) => (e) => {
    setCreditData({ ...credit, [field]: e.target.value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Date of Birth" type="date" value={credit.buyerDOB || ''} onChange={handleChange('buyerDOB')} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField size="small" label="DL" value={credit.buyerDL || ''} onChange={handleChange('buyerDL')} fullWidth />
              <TextField size="small" label="State" value={credit.buyerDLState || ''} onChange={handleChange('buyerDLState')} placeholder="e.g., TX" fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="SSN" value={credit.buyerSSN || ''} onChange={handleChange('buyerSSN')} fullWidth />
              <TextField size="small" label="Gender" value={credit.buyerGender || ''} onChange={handleChange('buyerGender')} fullWidth />
              <TextField size="small" label="Race" value={credit.buyerRace || ''} onChange={handleChange('buyerRace')} fullWidth />
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Date of Birth" type="date" value={credit.coBuyerDOB || ''} onChange={handleChange('coBuyerDOB')} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField size="small" label="DL" value={credit.coBuyerDL || ''} onChange={handleChange('coBuyerDL')} fullWidth />
              <TextField size="small" label="State" value={credit.coBuyerDLState || ''} onChange={handleChange('coBuyerDLState')} placeholder="e.g., TX" fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="SSN" value={credit.coBuyerSSN || ''} onChange={handleChange('coBuyerSSN')} fullWidth />
              <TextField size="small" label="Gender" value={credit.coBuyerGender || ''} onChange={handleChange('coBuyerGender')} fullWidth />
              <TextField size="small" label="Race" value={credit.coBuyerRace || ''} onChange={handleChange('coBuyerRace')} fullWidth />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TextField size="small" label="TransUnion" type="number" value={credit.buyerTransUnion || ''} onChange={handleChange('buyerTransUnion')} fullWidth />
            <TextField size="small" label="Equifax" type="number" value={credit.buyerEquifax || ''} onChange={handleChange('buyerEquifax')} fullWidth />
            <TextField size="small" label="Experian" type="number" value={credit.buyerExperian || ''} onChange={handleChange('buyerExperian')} fullWidth />
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TextField size="small" label="TransUnion" type="number" value={credit.coBuyerTransUnion || ''} onChange={handleChange('coBuyerTransUnion')} fullWidth />
            <TextField size="small" label="Equifax" type="number" value={credit.coBuyerEquifax || ''} onChange={handleChange('coBuyerEquifax')} fullWidth />
            <TextField size="small" label="Experian" type="number" value={credit.coBuyerExperian || ''} onChange={handleChange('coBuyerExperian')} fullWidth />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default ProspectPortal;
