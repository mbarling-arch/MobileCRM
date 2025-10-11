import React, { useEffect, useState } from 'react';
import { Typography, Divider, List, ListItem, ListItemText } from '@mui/material';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { FormTextField } from '../FormField';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function LeadAppointmentDrawer({ open, onClose, companyId, lead }) {
  const { userProfile } = useUser();
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const isValid = form.title.trim() && form.date && form.time;
  const [appts, setAppts] = useState([]);
  const [users, setUsers] = useState([]);

  // Load users for name mapping
  useEffect(() => {
    if (!companyId) return;

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
  }, [companyId]);

  useEffect(() => {
    if (!lead?.id) return;
    const q = query(collection(db, 'companies', companyId, 'leads', lead.id, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setAppts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [companyId, lead?.id]);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Helper function to get user display name from email
  const getUserDisplayName = (email) => {
    if (!email) return '';
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.displayName || email;
    }
    return email;
  };

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
    <BaseDrawer
      open={open}
      onClose={onClose}
      title="Schedule Appointment"
      width={500} // Slightly wider for the appointment list
      actions={
        <DrawerActions
          onCancel={onClose}
          onSubmit={handleSave}
          submitDisabled={!isValid}
          submitLabel="Schedule"
        />
      }
    >
      <FormTextField
        label="Title"
        value={form.title}
        onChange={handleChange('title')}
        required
      />

      <FormTextField
        label="Date"
        type="date"
        value={form.date}
        onChange={handleChange('date')}
        required
        InputLabelProps={{ shrink: true }}
      />

      <FormTextField
        label="Time"
        type="time"
        value={form.time}
        onChange={handleChange('time')}
        required
        InputLabelProps={{ shrink: true }}
      />

      <FormTextField
        label="Description"
        value={form.description}
        onChange={handleChange('description')}
        multiline
        minRows={3}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Appointments
      </Typography>

      <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
        {appts.map(a => (
          <ListItem key={a.id} sx={{ px: 0 }}>
            <ListItemText
              primary={a.title}
              secondary={`${a.description ? a.description + ' • ' : ''}${getUserDisplayName(a.createdBy)} • ${a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ''}`}
            />
          </ListItem>
        ))}
        {appts.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No appointments yet.
          </Typography>
        )}
      </List>
    </BaseDrawer>
  );
}

export default LeadAppointmentDrawer;


