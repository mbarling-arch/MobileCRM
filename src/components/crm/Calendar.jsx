import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  Typography,
  Stack,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import UnifiedLayout from '../UnifiedLayout';
import CalendarSidebar from './CalendarSidebar';

// User color palette for calendar
const USER_COLORS = [
  '#8C57FF', // primary purple
  '#FF4C51', // error red
  '#FFB400', // warning amber
  '#56CA00', // success green
  '#16B1FF', // info cyan
  '#F0718D', // pink
  '#0D9394', // teal
  '#7E4EE6'  // dark purple
];

function CalendarApp() {
  const { userProfile } = useUser();
  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId;

  const [calendarApi, setCalendarApi] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]); // All leads, prospects, deals
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUserFilters, setSelectedUserFilters] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const calendarRef = useRef();
  const mdAbove = useMediaQuery((theme) => theme.breakpoints.up('md'));

  // Initialize calendar API
  useEffect(() => {
    if (calendarRef.current) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, []);

  // Load users at this location from the proper path
  useEffect(() => {
    if (!companyId || !locationId) return;

    // Query users from companies/{companyId}/locations/{locationId}/users
    const usersRef = collection(db, 'companies', companyId, 'locations', locationId, 'users');

    const unsub = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        email: doc.data().email,
        name: doc.data().displayName || doc.data().name || doc.data().email,
        color: USER_COLORS[index % USER_COLORS.length]
      }));
      setUsers(usersData);
      
      // Select all users by default
      setSelectedUserFilters(usersData.map(u => u.email));
    });

    return () => unsub();
  }, [companyId, locationId]);

  // Load all appointments from leads, prospects, and deals
  useEffect(() => {
    if (!companyId) return;

    const allAppointments = [];
    const unsubs = [];

    // Helper to fetch appointments AND visits for a specific collection
    const fetchAppointments = (docType) => {
      const recordsRef = collection(db, 'companies', companyId, docType);
      const unsub = onSnapshot(recordsRef, (recordsSnapshot) => {
        recordsSnapshot.docs.forEach((recordDoc) => {
          const recordData = recordDoc.data();
          
          // Fetch appointments
          const appointmentsRef = collection(db, 'companies', companyId, docType, recordDoc.id, 'appointments');
          const apptUnsub = onSnapshot(appointmentsRef, (apptSnapshot) => {
            apptSnapshot.docs.forEach((apptDoc) => {
              const appt = apptDoc.data();
              const appointmentEvent = {
                id: `appt-${docType}-${recordDoc.id}-${apptDoc.id}`,
                title: appt.title || `📅 ${recordData.firstName || ''} ${recordData.lastName || ''}`.trim() || 'Appointment',
                start: appt.at?.toDate?.() || appt.start?.toDate?.(),
                end: appt.endAt?.toDate?.() || appt.end?.toDate?.() || appt.at?.toDate?.(),
                extendedProps: {
                  description: appt.notes || '',
                  assignedTo: appt.assignedTo || recordData.assignedTo || '',
                  recordType: docType,
                  recordId: recordDoc.id,
                  recordName: `${recordData.firstName || ''} ${recordData.lastName || ''}`.trim(),
                  eventType: 'appointment'
                }
              };
              
              const existingIndex = allAppointments.findIndex(a => a.id === appointmentEvent.id);
              if (existingIndex >= 0) {
                allAppointments[existingIndex] = appointmentEvent;
              } else {
                allAppointments.push(appointmentEvent);
              }
            });
            setAppointments([...allAppointments]);
          });
          unsubs.push(apptUnsub);

          // Fetch visits
          const visitsRef = collection(db, 'companies', companyId, docType, recordDoc.id, 'visits');
          const visitUnsub = onSnapshot(visitsRef, (visitSnapshot) => {
            visitSnapshot.docs.forEach((visitDoc) => {
              const visit = visitDoc.data();
              const visitEvent = {
                id: `visit-${docType}-${recordDoc.id}-${visitDoc.id}`,
                title: visit.title || `🏠 ${recordData.firstName || ''} ${recordData.lastName || ''}`.trim() || 'Visit',
                start: visit.visitedAt?.toDate?.() || visit.start?.toDate?.(),
                end: visit.visitEndAt?.toDate?.() || visit.end?.toDate?.() || visit.visitedAt?.toDate?.(),
                extendedProps: {
                  description: visit.notes || '',
                  assignedTo: visit.assignedTo || recordData.assignedTo || '',
                  recordType: docType,
                  recordId: recordDoc.id,
                  recordName: `${recordData.firstName || ''} ${recordData.lastName || ''}`.trim(),
                  eventType: 'visit'
                }
              };
              
              const existingIndex = allAppointments.findIndex(a => a.id === visitEvent.id);
              if (existingIndex >= 0) {
                allAppointments[existingIndex] = visitEvent;
              } else {
                allAppointments.push(visitEvent);
              }
            });
            setAppointments([...allAppointments]);
          });
          unsubs.push(visitUnsub);
      });
    });
      unsubs.push(unsub);
    };

    // Fetch from all sources
    fetchAppointments('leads');
    fetchAppointments('prospects');
    fetchAppointments('deals');

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  // Load all customers (leads, prospects, deals) for search - deduplicated by furthest stage
  useEffect(() => {
    if (!companyId) return;

    let allLeads = [];
    let allProspects = [];
    let allDeals = [];

    const unsubs = [];

    // Fetch leads
    const leadsRef = collection(db, 'companies', companyId, 'leads');
    const leadsUnsub = onSnapshot(leadsRef, (snapshot) => {
      allLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'lead',
        name: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unnamed Lead',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        leadId: doc.id,
        ...doc.data()
      }));
      updateDeduplicatedCustomers();
    });
    unsubs.push(leadsUnsub);

    // Fetch prospects
    const prospectsRef = collection(db, 'companies', companyId, 'prospects');
    const prospectsUnsub = onSnapshot(prospectsRef, (snapshot) => {
      allProspects = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'prospect',
        name: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unnamed Prospect',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        prospectId: doc.id,
        leadId: doc.data().leadId,
        ...doc.data()
      }));
      updateDeduplicatedCustomers();
    });
    unsubs.push(prospectsUnsub);

    // Fetch deals
    const dealsRef = collection(db, 'companies', companyId, 'deals');
    const dealsUnsub = onSnapshot(dealsRef, (snapshot) => {
      allDeals = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'deal',
        name: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unnamed Deal',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        dealId: doc.id,
        prospectId: doc.data().prospectId,
        leadId: doc.data().leadId,
        ...doc.data()
      }));
      updateDeduplicatedCustomers();
    });
    unsubs.push(dealsUnsub);

    // Deduplicate: Show only furthest stage (Deal > Prospect > Lead)
    const updateDeduplicatedCustomers = () => {
      const customerMap = new Map();

      // First add all leads
      allLeads.forEach(lead => {
        const key = lead.leadId || lead.id;
        customerMap.set(key, lead);
      });

      // Override with prospects (higher priority)
      allProspects.forEach(prospect => {
        const key = prospect.leadId || prospect.prospectId || prospect.id;
        customerMap.set(key, prospect);
      });

      // Override with deals (highest priority)
      allDeals.forEach(deal => {
        const key = deal.leadId || deal.prospectId || deal.dealId || deal.id;
        customerMap.set(key, deal);
      });

      setCustomers(Array.from(customerMap.values()));
    };

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  // Filter appointments based on selected users
  const filteredAppointments = appointments.filter(appt => {
    // If no filters selected, show none
    if (selectedUserFilters.length === 0) return false;
    
    // Show appointments assigned to selected users
    const assignedTo = appt.extendedProps.assignedTo;
    return selectedUserFilters.includes(assignedTo);
  });

  // Assign colors based on user
  const appointmentsWithColors = filteredAppointments.map(appt => {
    const user = users.find(u => u.email === appt.extendedProps.assignedTo);
    return {
      ...appt,
      backgroundColor: user?.color || '#8C57FF',
      borderColor: user?.color || '#8C57FF'
    };
  });

  // Handle date click (create new event)
  const handleDateClick = (info) => {
    const startDate = new Date(info.date);
    const endDate = new Date(info.date);
    endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration

    // Auto-assign to current user
    const defaultAssignee = users.length > 0 ? users.find(u => u.email === userProfile?.email)?.email || users[0]?.email || '' : '';

    setSelectedEvent({
      type: 'appointment', // 'appointment' or 'visit'
      title: '',
      start: startDate,
      end: endDate,
      allDay: false,
      assignedTo: defaultAssignee,
      description: '',
      customerId: null,
      customerType: null,
      customerName: ''
    });
    setSelectedCustomer(null);
    setCustomerSearch('');
    setAddEventOpen(true);
  };

  // Handle event click (edit event)
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      calendar: event.extendedProps.calendar,
      description: event.extendedProps.description || '',
      guests: event.extendedProps.guests || []
    });
    setAddEventOpen(true);
  };

  // Handle event drop/resize
  const handleEventChange = async (changeInfo) => {
    const event = changeInfo.event;
    
    try {
      const eventRef = doc(db, 'companies', companyId, 'calendarEvents', event.id);
      await updateDoc(eventRef, {
        start: event.start,
        end: event.end,
        allDay: event.allDay
      });
    } catch (error) {
      console.error('Error updating event:', error);
      changeInfo.revert();
    }
  };

  // Save event (add appointment or visit to customer record)
  const handleSaveEvent = async () => {
    if (!selectedEvent.title) {
      alert('Please enter a title');
      return;
    }

    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (!selectedEvent.assignedTo) {
      alert('Please assign to a user');
      return;
    }

    try {
      const collectionName = selectedCustomer.type === 'lead' ? 'leads' : selectedCustomer.type === 'prospect' ? 'prospects' : 'deals';
      const eventCollection = selectedEvent.type === 'visit' ? 'visits' : 'appointments';

      console.log('Saving to:', `companies/${companyId}/${collectionName}/${selectedCustomer.id}/${eventCollection}`);

      // Add to customer's sub-collection
      const docRef = await addDoc(collection(db, 'companies', companyId, collectionName, selectedCustomer.id, eventCollection), {
        title: selectedEvent.title,
        [selectedEvent.type === 'visit' ? 'visitedAt' : 'at']: selectedEvent.start,
        [selectedEvent.type === 'visit' ? 'visitEndAt' : 'endAt']: selectedEvent.end,
        notes: selectedEvent.description || '',
        assignedTo: selectedEvent.assignedTo,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system'
      });

      console.log('Saved successfully! ID:', docRef.id);

      setAddEventOpen(false);
      setSelectedEvent(null);
      setSelectedCustomer(null);
      setCustomerSearch('');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + error.message);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent.id) return;
    if (!confirm('Delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'companies', companyId, 'calendarEvents', selectedEvent.id));
      setAddEventOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Go to selected date
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  };

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 100px)', gap: 0 }}>
        {/* Left Sidebar */}
        <CalendarSidebar
          open={mdAbove || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onAddEvent={() => {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + 1);

            // Auto-assign to current user
            const defaultAssignee = users.length > 0 ? users.find(u => u.email === userProfile?.email)?.email || users[0]?.email || '' : '';

            setSelectedEvent({
              type: 'appointment',
              title: '',
              start: startDate,
              end: endDate,
              allDay: false,
              assignedTo: defaultAssignee,
              description: ''
            });
            setSelectedCustomer(null);
            setCustomerSearch('');
            setAddEventOpen(true);
          }}
          users={users}
          selectedUserFilters={selectedUserFilters}
          onFilterChange={setSelectedUserFilters}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />

        {/* Main Calendar */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              start: !mdAbove ? 'sidebarToggle,title' : 'title',
              center: '',
              end: 'dayGridMonth,timeGridWeek,listMonth'
            }}
            customButtons={{
              sidebarToggle: {
                text: '☰',
                click: () => setSidebarOpen(!sidebarOpen)
              }
            }}
            events={appointmentsWithColors}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={2}
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventChange}
            eventResize={handleEventChange}
            height="85vh"
            contentHeight="80vh"
            aspectRatio={1.8}
          />
              </Box>

        {/* Add/Edit Event Dialog */}
        <Dialog 
          open={addEventOpen} 
          onClose={() => {
            setAddEventOpen(false);
            setSelectedCustomer(null);
            setCustomerSearch('');
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                Add Event
                  </Typography>
              <IconButton onClick={() => setAddEventOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
                </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              {/* Event Type Selection */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1, textTransform: 'uppercase' }}>
                  Event Type *
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant={selectedEvent?.type === 'appointment' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setSelectedEvent(prev => ({ ...prev, type: 'appointment' }))}
                    sx={{ py: 1.5 }}
                  >
                    📅 Set Appointment
            </Button>
                  <Button
                    fullWidth
                    variant={selectedEvent?.type === 'visit' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setSelectedEvent(prev => ({ ...prev, type: 'visit' }))}
                    sx={{ py: 1.5 }}
                  >
                    🏠 Log a Visit
                  </Button>
                </Stack>
              </Box>

              {/* Customer Search */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1, textTransform: 'uppercase' }}>
                  Search Customer *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search leads, prospects, or deals..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  sx={{ mb: 1 }}
                />
                
                {/* Selected Customer Display */}
                {selectedCustomer ? (
                  <Box sx={{ p: 2, backgroundColor: 'success.lighterOpacity', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary' }}>
                        {selectedCustomer.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {selectedCustomer.type.toUpperCase()} • {selectedCustomer.email || selectedCustomer.phone || 'No contact info'}
                      </Typography>
                    </Box>
                    <Button size="small" onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}>
                      Change
                    </Button>
                  </Box>
                ) : customerSearch.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                   c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                   c.phone?.includes(customerSearch))
                      .slice(0, 10)
                      .map((customer) => (
                        <Box
                          key={`${customer.type}-${customer.id}`}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch('');
                          }}
                              sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{customer.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                            {customer.type.toUpperCase()} • {customer.email || customer.phone || 'No contact'}
                                    </Typography>
                        </Box>
                      ))}
                  </Box>
                ) : null}
              </Box>

              {/* Title */}
                  <TextField
                    fullWidth
                    label="Title *"
                value={selectedEvent?.title || ''}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder={selectedEvent?.type === 'visit' ? 'Visit purpose...' : 'Meeting topic...'}
              />

              {/* Start Date & Time */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                  label="Start Date *"
                      type="date"
                  value={selectedEvent?.start ? new Date(selectedEvent.start).toISOString().slice(0, 10) : ''}
                  onChange={(e) => {
                    const newStart = new Date(selectedEvent.start);
                    const selectedDate = new Date(e.target.value);
                    newStart.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setSelectedEvent(prev => ({ ...prev, start: newStart }));
                  }}
                      InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={selectedEvent?.start ? new Date(selectedEvent.start).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newStart = new Date(selectedEvent.start);
                    newStart.setHours(parseInt(hours), parseInt(minutes));
                    setSelectedEvent(prev => ({ ...prev, start: newStart }));
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* End Date & Time */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                  label="End Date *"
                  type="date"
                  value={selectedEvent?.end ? new Date(selectedEvent.end).toISOString().slice(0, 10) : ''}
                  onChange={(e) => {
                    const newEnd = new Date(selectedEvent.end);
                    const selectedDate = new Date(e.target.value);
                    newEnd.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setSelectedEvent(prev => ({ ...prev, end: newEnd }));
                  }}
                      InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={selectedEvent?.end ? new Date(selectedEvent.end).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newEnd = new Date(selectedEvent.end);
                    newEnd.setHours(parseInt(hours), parseInt(minutes));
                    setSelectedEvent(prev => ({ ...prev, end: newEnd }));
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Assign To */}
              <TextField
                select
                fullWidth
                label="Assign To *"
                value={users.find(u => u.email === selectedEvent?.assignedTo) ? selectedEvent?.assignedTo : (users[0]?.email || '')}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, assignedTo: e.target.value }))}
              >
                {users.length > 0 ? users.map((user) => (
                  <MenuItem key={user.id} value={user.email}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: user.color }} />
                      {user.name}
                    </Box>
                  </MenuItem>
                )) : (
                  <MenuItem value="">No users found</MenuItem>
                )}
              </TextField>

              {/* Notes */}
              <TextField
                fullWidth
                label="Notes"
                    multiline
                    rows={3}
                value={selectedEvent?.description || ''}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add notes about this appointment or visit..."
                  />
                </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAddEventOpen(false)}>
                Cancel
              </Button>
            <Button onClick={handleSaveEvent} variant="contained" color="primary">
              Save {selectedEvent?.type === 'visit' ? 'Visit' : 'Appointment'}
              </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </UnifiedLayout>
  );
}

export default CalendarApp;
