import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Stack, Typography, Button as MuiButton, Chip, Box } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HomeIcon from '@mui/icons-material/Home';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

function ActivityLog({ companyId, docType = 'leads', docId, createdAt, createdBy, onAction }) {
  const [calls, setCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [emails, setEmails] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!companyId || !docId) return;
    const base = ['companies', companyId, docType, docId];
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
    safeAttach([...base, 'tasks'], setTasks);
    return () => unsubs.forEach(u => u());
  }, [companyId, docType, docId]);

  const items = useMemo(() => {
    const mapItem = (type, d) => {
      // For appointments and tasks, use the relevant date instead of creation date for display
      let displayDate = d.createdAt;
      if (type === 'appointment') {
        displayDate = d.at;
      } else if (type === 'task') {
        displayDate = d.dueDate;
      }
      return { id: `${type}-${d.id}`, type, title: typeTitle(type, d), subtitle: typeSubtitle(type, d), createdAt: d.createdAt, displayDate, createdBy: d.createdBy };
    };
    const all = [
      ...calls.map(d => mapItem('call', d)),
      ...emails.map(d => mapItem('email', d)),
      ...visits.map(d => mapItem('visit', d)),
      ...appointments.map(d => mapItem('appointment', d)),
      ...tasks.map(d => mapItem('task', d)),
    ].sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));


    // push the created event at the end of the list
    if (createdAt) {
      all.push({ id: 'created', type: 'created', title: 'Lead Created', subtitle: 'Lead was added to the system', createdAt, displayDate: createdAt, createdBy });
    }
    return all;
  }, [calls, appointments, visits, emails, tasks, createdAt, createdBy]);

  return (
    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'transparent' }}>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <MuiButton size="small" variant="contained" color="success" onClick={() => onAction && onAction('callNotes')} startIcon={<PhoneIcon />}>Log a Call</MuiButton>
          <MuiButton size="small" variant="contained" color="secondary" onClick={() => onAction && onAction('message')} startIcon={<EmailIcon />}>Send Email</MuiButton>
          <MuiButton size="small" variant="contained" onClick={() => onAction && onAction('calendar')} startIcon={<EventIcon />}>Set Appointment</MuiButton>
          <MuiButton size="small" variant="contained" sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }} onClick={() => onAction && onAction('visit')} startIcon={<HomeIcon />}>Log a Visit</MuiButton>
          <MuiButton size="small" variant="contained" onClick={() => onAction && onAction('task')} startIcon={<TaskAltIcon />}>Create Task</MuiButton>
        </Stack>
      </Stack>

      <Stack spacing={1.25}>
        {items.map((item) => (
          <Box key={item.id} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#222536', border: '1px solid rgba(0,255,127,0.25)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{item.title}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{item.subtitle}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, mt: 0.5 }}>
                  {item.displayDate?.toDate ? item.displayDate.toDate().toLocaleString() : item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}
                </Typography>
              </Stack>
              <Chip size="small" label={item.createdBy || ''} sx={{ bgcolor: 'rgba(0,255,127,0.15)', color: '#a6f3c0' }} />
            </Stack>
          </Box>
        ))}
        {items.length === 0 && (
          <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>No activity yet.</Typography>
        )}
      </Stack>
    </Paper>
  );
}

function typeTitle(type, d) {
  switch (type) {
    case 'call': return 'Call Logged';
    case 'email': return 'Email Sent';
    case 'visit': return 'Visit Logged';
    case 'appointment': return d.title ? `Appointment: ${d.title}` : 'Appointment Scheduled';
    case 'task': {
      const isCompleted = d.status === 'completed';
      const isOverdue = !isCompleted && d.dueDate && new Date(d.dueDate.toDate ? d.dueDate.toDate() : d.dueDate) < new Date();
      let title = d.title ? `Task: ${d.title}` : 'Task Created';
      if (isCompleted) title += ' (Completed)';
      if (isOverdue) title += ' (Overdue)';
      return title;
    }
    default: return 'Activity';
  }
}

function typeSubtitle(type, d) {
  switch (type) {
    case 'call': return d.note || '—';
    case 'email': return d.subject || '—';
    case 'visit': return d.note || '—';
    case 'appointment': return d.description || '—';
    case 'task': {
      let subtitle = d.description || '';
      if (d.priority) {
        subtitle += (subtitle ? ' • ' : '') + `Priority: ${d.priority}`;
      }
      if (d.status === 'completed') {
        subtitle += (subtitle ? ' • ' : '') + '✓ Completed';
      } else {
        const dueDate = d.dueDate?.toDate ? d.dueDate.toDate() : d.dueDate;
        if (dueDate) {
          const isOverdue = new Date(dueDate) < new Date();
          subtitle += (subtitle ? ' • ' : '') + `Due: ${new Date(dueDate).toLocaleDateString()}`;
          if (isOverdue) {
            subtitle += ' (OVERDUE)';
          }
        }
      }
      return subtitle || '—';
    }
    default: return '';
  }
}

export default ActivityLog;


