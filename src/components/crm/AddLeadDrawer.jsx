import React, { useEffect, useState } from 'react';
import { Drawer, Box, Stack, Typography, Grid, Button, TextField, MenuItem, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LEAD_SOURCES, LEAD_STATUSES } from './LeadConstants';

function AddLeadDrawer({ open, onClose, onCreate, onSubmit, initial, submitLabel }) {
  const empty = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    source: 'facebook',
    status: 'new'
  };
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName || '',
        lastName: initial.lastName || '',
        phone: initial.phone || '',
        email: initial.email || '',
        source: initial.source || 'facebook',
        status: initial.status || 'new'
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const isValid = form.firstName.trim() && form.lastName.trim() && form.phone.trim();

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        source: form.source,
        status: form.status
      };
      if (onSubmit) {
        await onSubmit(payload);
      } else if (onCreate) {
        await onCreate(payload);
      }
      setForm(empty);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (t) => t.zIndex.modal + 20 }}
      PaperProps={{ sx: { width: 420, p: 2, backgroundColor: '#2a2746', borderLeft: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{initial ? 'Edit Lead' : 'Add Lead'}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="First Name" value={form.firstName} onChange={handleChange('firstName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Last Name" value={form.lastName} onChange={handleChange('lastName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Phone Number" value={form.phone} onChange={handleChange('phone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" value={form.email} onChange={handleChange('email')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Source" value={form.source} onChange={handleChange('source')} SelectProps={{ MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
              {LEAD_SOURCES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Status" value={form.status} onChange={handleChange('status')} SelectProps={{ MenuProps: { sx: { zIndex: (t) => t.zIndex.modal + 50 } } }}>
              {LEAD_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>{submitLabel || (initial ? 'Save Changes' : 'Create Lead')}</Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default AddLeadDrawer;


