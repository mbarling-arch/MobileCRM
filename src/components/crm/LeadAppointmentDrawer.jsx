import React, { useEffect, useState } from 'react';
import { Drawer, Typography, Stack, TextField, Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../UserContext';

function LeadAppointmentDrawer({ open, onClose, companyId, lead }) {
  const { userProfile } = useUser();
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const isValid = form.title.trim() && form.date && form.time;
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    if (!lead?.id) return;
    const q = query(collection(db, 'companies', companyId, 'leads', lead.id, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setAppts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [companyId, lead?.id]);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!isValid) return;
    const dateTime = new Date(`${form.date}T${form.time}:00`);
    await addDoc(collection(db, 'companies', companyId, 'leads', lead.id, 'appointments'), {
      title: form.title.trim(),
      at: dateTime,
      description: form.description.trim(),
      createdAt: serverTimestamp(),
      createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
    });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (t) => t.zIndex.modal + 20 }} PaperProps={{ sx: { width: 420, p: 2, backgroundColor: '#2a2746' } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Schedule Appointment</Typography>
      <Stack spacing={2}>
        <TextField label="Title" value={form.title} onChange={handleChange('title')} fullWidth />
        <TextField type="date" label="Date" value={form.date} onChange={handleChange('date')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField type="time" label="Time" value={form.time} onChange={handleChange('time')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="Description" value={form.description} onChange={handleChange('description')} fullWidth multiline minRows={3} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid}>Schedule</Button>
        </Stack>
        <Divider />
        <Typography variant="subtitle2">Appointments</Typography>
        <List dense>
          {appts.map(a => (
            <ListItem key={a.id} sx={{ px: 0 }}>
              <ListItemText
                primary={a.title}
                secondary={`${a.description ? a.description + ' • ' : ''}${a.createdBy || ''} • ${a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ''}`}
              />
            </ListItem>
          ))}
          {appts.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No appointments yet.</Typography>
          )}
        </List>
      </Stack>
    </Drawer>
  );
}

export default LeadAppointmentDrawer;


