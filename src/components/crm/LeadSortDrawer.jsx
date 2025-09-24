import React, { useEffect, useState } from 'react';
import { Drawer, Stack, Typography, TextField, Button, MenuItem } from '@mui/material';

const COLUMNS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'createdAt', label: 'Created' },
  { value: 'source', label: 'Source' },
  { value: 'status', label: 'Status' }
];

function LeadSortDrawer({ open, onClose, initial, onApply, onSaveDefault }) {
  const empty = { column: 'createdAt', direction: 'desc' };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initial || empty);
  }, [initial, open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (t) => t.zIndex.modal + 20 }} PaperProps={{ sx: { width: 360, p: 2, backgroundColor: '#2a2746' } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Sort Leads</Typography>
      <Stack spacing={2}>
        <TextField select label="Column" value={form.column} onChange={(e) => setForm({ ...form, column: e.target.value })} fullWidth SelectProps={{ MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
          {COLUMNS.map(c => (<MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>))}
        </TextField>
        <TextField select label="Direction" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} fullWidth SelectProps={{ MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </TextField>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Button variant="text" onClick={() => setForm(empty)}>Reset</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onClose}>Close</Button>
            <Button variant="contained" onClick={() => onApply(form)}>Apply</Button>
          </Stack>
        </Stack>
        <Button variant="contained" color="secondary" onClick={() => onSaveDefault(form)}>Save As Default</Button>
      </Stack>
    </Drawer>
  );
}

export default LeadSortDrawer;


