import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider as MuiDivider,
  InputAdornment,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Collapse
} from '@mui/material';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import PaletteIcon from '@mui/icons-material/Palette';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { collection, onSnapshot, query, orderBy, collectionGroup, addDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../UserContext';
import CRMLayout from '../CRMLayout';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

// Custom event component to style events
const EventComponent = ({ event }) => (
  <div style={{
    backgroundColor: event.color || '#1976d2',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }}>
    {event.title}
  </div>
);

// Custom toolbar component
const CustomToolbar = ({ label, view, views, onView, onNavigate, localizer: { messages } }) => {
  const navigate = (action) => onNavigate(action);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#2a2746', borderRadius: 2 }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => navigate('PREV')}>Prev</Button>
        <Button variant="outlined" onClick={() => navigate('TODAY')}>Today</Button>
        <Button variant="outlined" onClick={() => navigate('NEXT')}>Next</Button>
      </Stack>
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1}>
        {views.map(viewName => (
          <Button
            key={viewName}
            variant={view === viewName ? "contained" : "outlined"}
            onClick={() => onView(viewName)}
            startIcon={viewName === 'week' ? <ViewWeekIcon /> : <CalendarViewMonthIcon />}
          >
            {viewName === 'week' ? 'Week' : 'Month'}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

function CalendarPage() {
  const { userProfile } = useUser();

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;
  const userId = userProfile?.firebaseUser?.uid;

  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('month');
  const [userColors, setUserColors] = useState({});
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1976d2');
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    type: 'lead', // 'lead' or 'prospect'
    recordId: '',
    recordName: ''
  });
  const [savingColors, setSavingColors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [leads, setLeads] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [deals, setDeals] = useState([]);
  const [locationUsers, setLocationUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([currentUserEmail]); // Start with current user selected
  const [userFilterExpanded, setUserFilterExpanded] = useState(false);

  // Available colors for users
  const colorOptions = [
    '#1976d2', // Blue
    '#dc004e', // Red
    '#4caf50', // Green
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#607d8b', // Blue Grey
    '#795548', // Brown
    '#e91e63', // Pink
  ];

  // Fetch appointments from leads and prospects
  useEffect(() => {
    if (!companyId) return;

    const unsubs = [];

    // Helper function to fetch appointments for a specific record
    const fetchRecordAppointments = async (recordType, recordId, recordData) => {
      const appointmentsQuery = query(
        collection(db, 'companies', companyId, recordType, recordId, 'appointments'),
        orderBy('at', 'asc')
      );

      const unsub = onSnapshot(appointmentsQuery, (apptsSnap) => {
        const appointments = apptsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: recordType.slice(0, -1), // Remove 's' to get 'lead' or 'prospect'
          recordId,
          recordName: recordType === 'leads'
            ? `${recordData.firstName || ''} ${recordData.lastName || ''}`.trim() || 'Unknown Lead'
            : `${recordData.firstName || ''} ${recordData.lastName || ''}`.trim() || 'Unknown Prospect'
        }));

        setAppointments(prev => {
          const filtered = prev.filter(apt => !(apt.type === recordType.slice(0, -1) && apt.recordId === recordId));
          return [...filtered, ...appointments];
        });
      });

      unsubs.push(unsub);
    };

    // Fetch all leads and their appointments
    const leadsQuery = query(collection(db, 'companies', companyId, 'leads'));
    const leadsUnsub = onSnapshot(leadsQuery, (leadsSnap) => {
      leadsSnap.docs.forEach(leadDoc => {
        fetchRecordAppointments('leads', leadDoc.id, leadDoc.data());
      });
    });

    // Fetch all prospects and their appointments
    const prospectsQuery = query(collection(db, 'companies', companyId, 'prospects'));
    const prospectsUnsub = onSnapshot(prospectsQuery, (prospectsSnap) => {
      prospectsSnap.docs.forEach(prospectDoc => {
        fetchRecordAppointments('prospects', prospectDoc.id, prospectDoc.data());
      });
    });

    // Fetch all deals and their appointments
    const dealsQuery = query(collection(db, 'companies', companyId, 'deals'));
    const dealsUnsub = onSnapshot(dealsQuery, (dealsSnap) => {
      dealsSnap.docs.forEach(dealDoc => {
        fetchRecordAppointments('deals', dealDoc.id, dealDoc.data());
      });
    });

    unsubs.push(leadsUnsub, prospectsUnsub, dealsUnsub);

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  // Load user color preferences
  useEffect(() => {
    if (!userId || !companyId) return;

    const loadColors = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const colorPrefsRef = doc(db, 'companies', companyId, 'users', userId, 'preferences', 'calendarColors');
        const colorPrefsSnap = await getDoc(colorPrefsRef);

        if (colorPrefsSnap.exists()) {
          const colorData = colorPrefsSnap.data();
          setUserColors(colorData.colors || {});
        }
      } catch (error) {
        console.error('Error loading color preferences:', error);
      }
    };

    loadColors();
  }, [userId, companyId]);

  // Fetch leads, prospects, and deals for search functionality
  useEffect(() => {
    if (!companyId) return;

    const unsubs = [];

    // Fetch leads
    const leadsQuery = query(collection(db, 'companies', companyId, 'leads'));
    const leadsUnsub = onSnapshot(leadsQuery, (snap) => {
      const leadsData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'lead',
        displayName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unknown Lead'
      }));
      setLeads(leadsData);
    });
    unsubs.push(leadsUnsub);

    // Fetch prospects
    const prospectsQuery = query(collection(db, 'companies', companyId, 'prospects'));
    const prospectsUnsub = onSnapshot(prospectsQuery, (snap) => {
      const prospectsData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'prospect',
        displayName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unknown Prospect'
      }));
      setProspects(prospectsData);
    });
    unsubs.push(prospectsUnsub);

    // Fetch deals
    const dealsQuery = query(collection(db, 'companies', companyId, 'deals'));
    const dealsUnsub = onSnapshot(dealsQuery, (snap) => {
      const dealsData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'deal',
        displayName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unknown Deal'
      }));
      setDeals(dealsData);
    });
    unsubs.push(dealsUnsub);

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  // Fetch users in the same location
  useEffect(() => {
    if (!companyId || !locationId) return;

    const fetchLocationUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, 'companies', companyId, 'users'),
          where('locationId', '==', locationId)
        );
        const usersSnap = await getDocs(usersQuery);
        const users = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          email: doc.data().email || doc.data().firebaseUser?.email
        })).filter(user => user.email); // Only include users with emails

        setLocationUsers(users);
      } catch (error) {
        console.error('Error fetching location users:', error);
      }
    };

    fetchLocationUsers();
  }, [companyId, locationId, currentUserEmail]);

  // Transform appointments for calendar - filter by selected users
  const calendarEvents = useMemo(() => {
    return appointments
      .filter(apt => selectedUsers.includes(apt.createdBy))
      .map(apt => ({
        id: apt.id,
        title: apt.title,
        start: apt.at?.toDate ? apt.at.toDate() : new Date(apt.at),
        end: apt.at?.toDate ? apt.at.toDate() : new Date(apt.at),
        color: userColors[apt.createdBy] || '#1976d2',
        createdBy: apt.createdBy,
        description: apt.description,
        type: apt.type,
        recordId: apt.recordId,
      }));
  }, [appointments, userColors, selectedUsers]);

  // Combined records for search - prioritize most advanced status (deal > prospect > lead)
  const allRecords = useMemo(() => {
    const recordsMap = new Map();

    // Add leads first (lowest priority)
    leads.forEach(lead => {
      recordsMap.set(lead.email || lead.phone || lead.id, {
        ...lead,
        priority: 1 // Lowest priority for leads
      });
    });

    // Add prospects - they override leads with same contact info
    prospects.forEach(prospect => {
      const key = prospect.email || prospect.phone || prospect.id;
      recordsMap.set(key, {
        ...prospect,
        priority: 2 // Medium priority for prospects
      });
    });

    // Add deals - they override prospects/leads with same contact info (highest priority)
    deals.forEach(deal => {
      const key = deal.email || deal.phone || deal.id;
      recordsMap.set(key, {
        ...deal,
        priority: 3 // Highest priority for deals
      });
    });

    // Return only the highest priority records
    return Array.from(recordsMap.values()).sort((a, b) => b.priority - a.priority);
  }, [leads, prospects, deals]);

  // Filter search results based on query
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allRecords.filter(record =>
      record.displayName.toLowerCase().includes(query) ||
      (record.email && record.email.toLowerCase().includes(query)) ||
      (record.phone && record.phone.includes(query))
    ).slice(0, 10); // Limit to 10 results
  }, [allRecords, searchQuery]);

  // Get unique users for color coding
  const uniqueUsers = useMemo(() => {
    const users = [...new Set(appointments.map(apt => apt.createdBy).filter(Boolean))];
    return users.sort();
  }, [appointments]);

  // Handle color selection
  const handleColorSave = async () => {
    if (!selectedUser || !selectedColor || !userId || !companyId) return;

    setSavingColors(true);
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const colorPrefsRef = doc(db, 'companies', companyId, 'users', userId, 'preferences', 'calendarColors');

      const newColors = {
        ...userColors,
        [selectedUser]: selectedColor
      };

      await setDoc(colorPrefsRef, {
        colors: newColors,
        updatedAt: serverTimestamp(),
        updatedBy: currentUserEmail
      });

      setUserColors(newColors);
      setColorDialogOpen(false);
      setSelectedUser('');
      setSelectedColor('#1976d2');
    } catch (error) {
      console.error('Error saving color preferences:', error);
    } finally {
      setSavingColors(false);
    }
  };

  // Handle adding appointment
  const handleAddAppointment = () => {
    setAddAppointmentOpen(true);
    setAppointmentForm({
      title: '',
      date: '',
      time: '',
      description: '',
      type: 'lead',
      recordId: '',
      recordName: ''
    });
    setSelectedRecord(null);
    setSearchQuery('');
  };

  // Handle selecting a record from search
  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setAppointmentForm(prev => ({
      ...prev,
      type: record.type,
      recordId: record.id,
      recordName: record.displayName
    }));
    setSearchQuery(record.displayName);
  };

  // Handle saving appointment
  const handleSaveAppointment = async () => {
    if (!appointmentForm.title.trim() || !appointmentForm.date || !appointmentForm.time || !selectedRecord) {
      return;
    }

    setSavingAppointment(true);
    try {
      const dateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}:00`);

      // Determine collection path based on record type
      const collectionPath = selectedRecord.type === 'deal'
        ? `companies/${companyId}/deals/${selectedRecord.id}/appointments`
        : selectedRecord.type === 'prospect'
        ? `companies/${companyId}/prospects/${selectedRecord.id}/appointments`
        : `companies/${companyId}/leads/${selectedRecord.id}/appointments`;

      await addDoc(collection(db, collectionPath), {
        title: appointmentForm.title.trim(),
        at: dateTime,
        description: appointmentForm.description.trim(),
        createdAt: serverTimestamp(),
        createdBy: currentUserEmail
      });
      setAddAppointmentOpen(false);
      setSelectedRecord(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setSavingAppointment(false);
    }
  };

  // Calendar styling
  const calendarStyle = {
    height: 'calc(100vh - 300px)',
    fontFamily: 'inherit',
    '& .rbc-calendar': {
      backgroundColor: '#1e1e1e',
      color: 'white',
    },
    '& .rbc-header': {
      backgroundColor: '#2a2746',
      color: 'white',
      padding: '8px',
      fontWeight: 'bold',
    },
    '& .rbc-month-view': {
      backgroundColor: '#1e1e1e',
    },
    '& .rbc-week-view': {
      backgroundColor: '#1e1e1e',
    },
    '& .rbc-today': {
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
    },
    '& .rbc-event': {
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      padding: '2px 6px',
    },
    '& .rbc-event.rbc-selected': {
      backgroundColor: '#1976d2',
    },
    '& .rbc-slot-selection': {
      backgroundColor: 'rgba(25, 118, 210, 0.5)',
    },
    '& .rbc-time-slot': {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    '& .rbc-timeslot-group': {
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
  };

  return (
    <CRMLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Appointment Calendar
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<PaletteIcon />}
              onClick={() => setColorDialogOpen(true)}
              sx={{ backgroundColor: '#1976d2' }}
            >
              Color Code Users
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAppointment}
              sx={{ backgroundColor: '#4caf50' }}
            >
              Add Appointment
            </Button>
          </Stack>
        </Stack>

        {/* User Filter */}
        {locationUsers.length > 1 && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Team Calendar View
              </Typography>
              <Button
                size="small"
                onClick={() => setUserFilterExpanded(!userFilterExpanded)}
                endIcon={userFilterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {userFilterExpanded ? 'Hide' : 'Show'} Filters
              </Button>
            </Stack>

            <Collapse in={userFilterExpanded}>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                Select team members whose appointments you want to see:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {locationUsers.map(user => (
                  <FormControlLabel
                    key={user.email}
                    control={
                      <Checkbox
                        checked={selectedUsers.includes(user.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.email]);
                          } else {
                            setSelectedUsers(prev => prev.filter(email => email !== user.email));
                          }
                        }}
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-checked': {
                            color: userColors[user.email] || '#1976d2',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {user.email === currentUserEmail ? `${user.email} (You)` : user.email}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Collapse>

            {!userFilterExpanded && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Showing appointments for: {selectedUsers.map(email =>
                  email === currentUserEmail ? 'You' : email.split('@')[0]
                ).join(', ')}
              </Typography>
            )}
          </Paper>
        )}

        {/* User Color Legend */}
        {uniqueUsers.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              User Colors
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {uniqueUsers
                .filter(user => selectedUsers.includes(user))
                .map(user => (
                  <Chip
                    key={user}
                    label={user === currentUserEmail ? `${user.split('@')[0]} (You)` : user.split('@')[0]}
                    sx={{
                      backgroundColor: userColors[user] || '#1976d2',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: userColors[user] || '#1976d2',
                        opacity: 0.8
                      }
                    }}
                  />
                ))}
            </Stack>
          </Paper>
        )}

        {/* Calendar */}
        <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={calendarStyle}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={setView}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar
              }}
              views={['month', 'week']}
              defaultView="month"
            />
          </Box>
        </Paper>

        {/* Color Selection Dialog */}
        <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Colors to Users</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Select User"
                >
                  {uniqueUsers.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Color</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {colorOptions.map(color => (
                    <Box
                      key={color}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: selectedColor === color ? '3px solid white' : '2px solid transparent',
                        '&:hover': {
                          border: '3px solid white'
                        }
                      }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </Stack>
              </Box>

              {selectedUser && (
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">
                    Preview: <Chip label={selectedUser} sx={{ backgroundColor: selectedColor, color: 'white', ml: 1 }} />
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColorDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleColorSave} variant="contained" disabled={!selectedUser || savingColors}>
              {savingColors ? 'Saving...' : 'Save Color'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Appointment Drawer */}
        <Drawer
          anchor="right"
          open={addAppointmentOpen}
          onClose={() => setAddAppointmentOpen(false)}
          sx={{ zIndex: (t) => t.zIndex.modal + 20 }}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 500 },
              backgroundColor: '#2a2746',
              color: 'white'
            }
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Add New Appointment
            </Typography>

            <Stack spacing={3} sx={{ flex: 1 }}>
              {/* Search for Lead/Prospect */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
                  Search Lead or Prospect *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  inputProps={{
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    autoCapitalize: 'off',
                    spellCheck: 'false'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1e1e1e',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                />

                {/* Search Results */}
                {searchQuery && (
                  <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto', backgroundColor: '#1e1e1e' }}>
                    <List dense>
                      {filteredSearchResults.length > 0 ? (
                        filteredSearchResults.map((record) => (
                          <ListItem key={record.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleSelectRecord(record)}
                              sx={{
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                '&.Mui-selected': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography sx={{ color: 'white' }}>
                                      {record.displayName}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={record.type}
                                      color={
                                        record.type === 'lead' ? 'warning' :
                                        record.type === 'prospect' ? 'success' :
                                        'secondary' // purple for deals
                                      }
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  </Stack>
                                }
                                secondary={
                                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                    {record.email && `Email: ${record.email}`}
                                    {record.phone && ` • Phone: ${record.phone}`}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                No results found
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}

                {/* Selected Record Display */}
                {selectedRecord && (
                  <Paper sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', border: '1px solid rgba(25, 118, 210, 0.5)' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                      Selected:
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ color: 'white' }}>
                        {selectedRecord.displayName}
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedRecord.type}
                        color={
                          selectedRecord.type === 'lead' ? 'warning' :
                          selectedRecord.type === 'prospect' ? 'success' :
                          'secondary' // purple for deals
                        }
                        variant="outlined"
                      />
                    </Stack>
                  </Paper>
                )}
              </Box>

              <MuiDivider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

              {/* Appointment Details */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                  Appointment Details
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Title *"
                    value={appointmentForm.title}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1e1e1e',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputBase-input': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date *"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1e1e1e',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                        },
                        '& .MuiInputBase-input': { color: 'white' },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      }}
                    />

                    <TextField
                      fullWidth
                      type="time"
                      label="Time *"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1e1e1e',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                        },
                        '& .MuiInputBase-input': { color: 'white' },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={appointmentForm.description}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1e1e1e',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputBase-input': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Button
                variant="outlined"
                onClick={() => setAddAppointmentOpen(false)}
                sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.23)', color: 'white' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAppointment}
                disabled={
                  savingAppointment ||
                  !appointmentForm.title.trim() ||
                  !appointmentForm.date ||
                  !appointmentForm.time ||
                  !selectedRecord
                }
                sx={{
                  flex: 1,
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  '&:disabled': { backgroundColor: 'rgba(25, 118, 210, 0.3)' }
                }}
              >
                {savingAppointment ? 'Saving...' : 'Save Appointment'}
              </Button>
            </Stack>
          </Box>
        </Drawer>
      </Box>
    </CRMLayout>
  );
}

export default CalendarPage;