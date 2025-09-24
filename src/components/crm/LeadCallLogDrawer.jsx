import React, { useEffect, useState } from 'react';
import { Drawer, Box, Typography, Stack, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../UserContext';

function LeadCallLogDrawer({ open, onClose, companyId, lead }) {
  const { userProfile } = useUser();
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!lead?.id) return;
    const q = query(collection(db, 'companies', companyId, 'leads', lead.id, 'callLogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [companyId, lead?.id]);

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
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (t) => t.zIndex.modal + 20 }} PaperProps={{ sx: { width: 420, p: 2, backgroundColor: '#2a2746' } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Log a Call</Typography>
      <Stack spacing={2}>
        <TextField
          label="Notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={handleSave} disabled={!note.trim()}>Save Log</Button>
        </Stack>
        <Divider />
        <Typography variant="subtitle2">History</Typography>
        <List dense>
          {logs.map((l) => (
            <ListItem key={l.id} sx={{ px: 0 }}>
              <ListItemText
                primary={l.note}
                secondary={`${l.createdBy || ''} • ${l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString() : ''}`}
              />
            </ListItem>
          ))}
          {logs.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No call logs yet.</Typography>
          )}
        </List>
      </Stack>
    </Drawer>
  );
}

export default LeadCallLogDrawer;


