import React, { useState } from 'react';
import { Drawer, Stack, Typography, TextField, Button } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function VisitLogDrawer({ open, onClose, companyId, docType = 'prospects', leadId }) {
  const { userProfile } = useUser();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const isValid = !!date && !!time;

  const handleSave = async () => {
    if (!isValid || !companyId || !leadId) return;
    const at = new Date(`${date}T${time}:00`);
    await addDoc(collection(db, 'companies', companyId, docType, leadId, 'visits'), {
      at,
      createdAt: serverTimestamp(),
      createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
    });
    onClose();
  };

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose} 
      sx={{ zIndex: (t)=>t.zIndex.modal + 20 }} 
      PaperProps={{ 
        sx: { 
          width: 380, 
          p: 2, 
          backgroundColor: 'background.paper' 
        } 
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Log a Visit</Typography>
      <Stack spacing={2}>
        <TextField 
          type="date" 
          label="Date" 
          value={date} 
          onChange={(e)=>setDate(e.target.value)} 
          fullWidth 
          InputLabelProps={{ shrink: true }} 
        />
        <TextField 
          type="time" 
          label="Time" 
          value={time} 
          onChange={(e)=>setTime(e.target.value)} 
          fullWidth 
          InputLabelProps={{ shrink: true }} 
        />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid}>Save</Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default VisitLogDrawer;



