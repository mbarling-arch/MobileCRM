import React, { useEffect, useState } from 'react';
import { Drawer, Box, Typography, Stack, TextField, Button, MenuItem, Divider, List, ListItem, ListItemText, Checkbox, FormControlLabel } from '@mui/material';
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../UserContext';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

function LeadTaskDrawer({ open, onClose, companyId, lead }) {
  const { userProfile } = useUser();
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'medium', description: '' });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!lead?.id) return;
    const q = query(collection(db, 'companies', companyId, 'leads', lead.id, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [companyId, lead?.id]);

  const isValid = form.title.trim() && form.dueDate;

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleTaskStatusChange = async (taskId, isCompleted) => {
    try {
      const taskRef = doc(db, 'companies', companyId, 'leads', lead.id, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: isCompleted ? 'completed' : 'open',
        completedAt: isCompleted ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    await addDoc(collection(db, 'companies', companyId, 'leads', lead.id, 'tasks'), {
      title: form.title.trim(),
      dueDate: new Date(form.dueDate),
      priority: form.priority,
      description: form.description.trim(),
      status: 'open',
      createdAt: serverTimestamp(),
      createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
    });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (t) => t.zIndex.modal + 20 }} PaperProps={{ sx: { width: 420, p: 2, backgroundColor: '#2a2746' } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>New Task</Typography>
      <Stack spacing={2}>
        <TextField label="Title" value={form.title} onChange={handleChange('title')} fullWidth />
        <TextField type="date" label="Due Date" value={form.dueDate} onChange={handleChange('dueDate')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField select label="Priority" value={form.priority} onChange={handleChange('priority')} fullWidth>
          {PRIORITIES.map(p => (<MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>))}
        </TextField>
        <TextField label="Description" value={form.description} onChange={handleChange('description')} fullWidth multiline minRows={3} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid}>Create Task</Button>
        </Stack>
        <Divider />
        <Typography variant="subtitle2">Tasks</Typography>
        <List dense>
          {tasks.map(t => {
            const isCompleted = t.status === 'completed';
            const isOverdue = !isCompleted && t.dueDate && new Date(t.dueDate.toDate ? t.dueDate.toDate() : t.dueDate) < new Date();

            return (
              <ListItem key={t.id} sx={{
                px: 0,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCompleted}
                      onChange={(e) => handleTaskStatusChange(t.id, e.target.checked)}
                      sx={{
                        color: 'rgba(255,255,255,0.5)',
                        '&.Mui-checked': {
                          color: '#4caf50',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'rgba(255,255,255,0.5)' : 'white',
                        fontWeight: isOverdue && !isCompleted ? 600 : 400,
                      }}
                    >
                      {`${t.title} • ${t.priority?.toUpperCase?.() || ''}`}
                      {isOverdue && !isCompleted && (
                        <Typography component="span" sx={{ color: '#f44336', ml: 1, fontSize: '0.8rem' }}>
                          (OVERDUE)
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem'
                      }}
                    >
                      {t.description ? t.description + ' • ' : ''}
                      {t.createdBy || ''} • Due: {t.dueDate?.toDate ? t.dueDate.toDate().toLocaleDateString() : t.dueDate || 'No due date'}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
          {tasks.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No tasks yet.</Typography>
          )}
        </List>
      </Stack>
    </Drawer>
  );
}

export default LeadTaskDrawer;


