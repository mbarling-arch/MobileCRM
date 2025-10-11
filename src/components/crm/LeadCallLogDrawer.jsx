import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { FormTextField } from '../FormField';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function LeadCallLogDrawer({ open, onClose, companyId, lead }) {
  const { userProfile } = useUser();
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);
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
    const q = query(collection(db, 'companies', companyId, 'leads', lead.id, 'callLogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [companyId, lead?.id]);

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
    if (!note.trim()) return;
    await addDoc(collection(db, 'companies', companyId, 'leads', lead.id, 'callLogs'), {
      note: note.trim(),
      createdAt: serverTimestamp(),
      createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
    });
    setNote('');
  };

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      title="Log a Call"
      width={500}
      actions={
        <>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!note.trim()}>
            Save Log
          </Button>
        </>
      }
    >
      <FormTextField
        label="Notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        multiline
        minRows={4}
        required
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        History
      </Typography>

      <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
        {logs.map((l) => (
          <ListItem key={l.id} sx={{ px: 0 }}>
            <ListItemText
              primary={l.note}
              secondary={`${getUserDisplayName(l.createdBy)} • ${l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString() : ''}`}
            />
          </ListItem>
        ))}
        {logs.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No call logs yet.
          </Typography>
        )}
      </List>
    </BaseDrawer>
  );
}

export default LeadCallLogDrawer;


