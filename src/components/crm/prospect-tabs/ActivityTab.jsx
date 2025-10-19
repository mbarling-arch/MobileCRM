import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Stack, Paper, Chip } from '@mui/material';
import { Phone as PhoneIcon, Email as EmailIcon, Event as EventIcon, Home as HomeIcon } from '@mui/icons-material';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import LeadCallLogDrawer from '../LeadCallLogDrawer';
import LeadAppointmentDrawer from '../LeadAppointmentDrawer';
import VisitLogDrawer from '../VisitLogDrawer';
import EmailDrawer from '../EmailDrawer';

const ActivityTab = ({ prospectId, userProfile, context }) => {
  const [calls, setCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [emails, setEmails] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Drawer states
  const [callDrawerOpen, setCallDrawerOpen] = useState(false);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);

  // Load users for name mapping
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

  // Helper function to get user display name from email
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

  const activities = useMemo(() => {
    return [
      ...calls.map(d => ({ id: `call-${d.id}`, type: 'call', title: 'Call Logged', subtitle: d.notes || 'No notes', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...emails.map(d => ({ id: `email-${d.id}`, type: 'email', title: 'Email Sent', subtitle: d.subject || 'No subject', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...appointments.map(d => ({ id: `appt-${d.id}`, type: 'appointment', title: d.title || 'Appointment', subtitle: d.notes || '', createdAt: d.createdAt, createdBy: d.createdBy })),
      ...visits.map(d => ({ id: `visit-${d.id}`, type: 'visit', title: 'Visit Logged', subtitle: d.notes || 'No notes', createdAt: d.createdAt, createdBy: d.createdBy })),
    ].sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [calls, emails, appointments, visits]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Activities Content */}
      <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Activity Timeline
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                onClick={() => setCallDrawerOpen(true)}
                size="small"
                variant="contained"
                color="primary"
                startIcon={<PhoneIcon />}
              >
                Log a Call
              </Button>
              <Button
                onClick={() => setEmailDrawerOpen(true)}
                size="small"
                variant="contained"
                color="info"
                startIcon={<EmailIcon />}
              >
                Send Email
              </Button>
              <Button
                onClick={() => setAppointmentDrawerOpen(true)}
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<EventIcon />}
              >
                Set Appointment
              </Button>
              <Button
                onClick={() => setVisitDrawerOpen(true)}
                size="small"
                variant="contained"
                color="warning"
                startIcon={<HomeIcon />}
              >
                Log a Visit
              </Button>
            </Stack>
          </Box>

          {/* Activity List */}
          <Stack spacing={1.5}>
            {activities.map((item) => (
              <Box 
                key={item.id} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 15 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{item.subtitle}</Typography>
                    <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}
                    </Typography>
                  </Stack>
                  <Chip size="small" label={getUserDisplayName(item.createdBy)} sx={{ bgcolor: 'primary.mainOpacity', color: 'primary.main' }} />
                </Stack>
              </Box>
            ))}
            {activities.length === 0 && (
              <Typography sx={{ color: 'text.disabled', textAlign: 'center', py: 4, fontStyle: 'italic' }}>No activity yet.</Typography>
          )}
        </Stack>
      </Paper>

      {/* Drawers */}
      <LeadCallLogDrawer
        open={callDrawerOpen}
        onClose={() => setCallDrawerOpen(false)}
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
      <EmailDrawer
        open={emailDrawerOpen}
        onClose={() => setEmailDrawerOpen(false)}
        leadId={prospectId}
        companyId={userProfile?.companyId}
        docType="prospects"
        recipientEmail={context?.prospect?.email || ''}
        recipientName={context?.prospect?.name || ''}
      />
    </Box>
  );
};

export default ActivityTab;
