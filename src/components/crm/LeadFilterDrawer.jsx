import React, { useEffect, useState } from 'react';
import { Drawer, Stack, Typography, TextField, Button, MenuItem, Divider } from '@mui/material';
import { LEAD_SOURCES, LEAD_STATUSES } from './LeadConstants';

function LeadFilterDrawer({ open, onClose, initial, onApply }) {
  const empty = { sources: [], statuses: [], dateRange: 'all', customStart: '', customEnd: '' };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initial || empty);
  }, [initial, open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (t) => t.zIndex.modal + 20 }} PaperProps={{ sx: { width: 420, p: 2, backgroundColor: '#2a2746' } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Filter Leads</Typography>
      <Stack spacing={2}>
        <TextField select label="Date Range" value={form.dateRange} onChange={(e) => setForm({ ...form, dateRange: e.target.value })} fullWidth SelectProps={{ MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="this_week">This Week</MenuItem>
          <MenuItem value="this_month">This Month</MenuItem>
          <MenuItem value="60d">Last 60 Days</MenuItem>
          <MenuItem value="90d">Last 90 Days</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
        </TextField>
        {form.dateRange === 'custom' && (
          <Stack direction="row" spacing={2}>
            <TextField type="date" label="Start" value={form.customStart} onChange={(e) => setForm({ ...form, customStart: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField type="date" label="End" value={form.customEnd} onChange={(e) => setForm({ ...form, customEnd: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        )}
        <TextField select label="Sources" value={form.sources} onChange={(e) => setForm({ ...form, sources: Array.isArray(e.target.value) ? e.target.value : [e.target.value] })} fullWidth SelectProps={{ multiple: true, MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
          {LEAD_SOURCES.map(s => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
        </TextField>
        <TextField select label="Statuses" value={form.statuses} onChange={(e) => setForm({ ...form, statuses: Array.isArray(e.target.value) ? e.target.value : [e.target.value] })} fullWidth SelectProps={{ multiple: true, MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
          {LEAD_STATUSES.map(s => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
        </TextField>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Button variant="text" onClick={() => setForm(empty)}>Reset</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onClose}>Close</Button>
            <Button variant="contained" onClick={() => onApply(form)}>Apply</Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default LeadFilterDrawer;


