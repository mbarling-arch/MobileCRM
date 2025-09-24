import React, { useEffect, useState } from 'react';
import { Drawer, Box, Stack, Typography, Grid, Button, TextField, MenuItem, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function AddInventoryDrawer({ open, onClose, onCreate, onSubmit, initial, submitLabel }) {
  const empty = {
    facility: '',
    name: '',
    model: '',
    size: '',
    bedBath: '',
    po: '',
    invoice: 0,
    deliverySetup: 0,
    ac: 0,
    tileDelivery: 0,
    steps: 0,
    trimOut: 0,
    skirting: 0,
    pad: 0,
    esc: 0,
    misc: 0,
    srg: 25,
    salesPrice: 0,
    status: 'quote'
  };

  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        facility: initial.facility || '',
        name: initial.name || '',
        model: initial.model || '',
        size: initial.size || '',
        bedBath: initial.bedBath || '',
        po: initial.po || '',
        invoice: initial.invoice || 0,
        deliverySetup: initial.deliverySetup || 0,
        ac: initial.ac || 0,
        tileDelivery: initial.tileDelivery || 0,
        steps: initial.steps || 0,
        trimOut: initial.trimOut || 0,
        skirting: initial.skirting || 0,
        pad: initial.pad || 0,
        esc: initial.esc || 0,
        misc: initial.misc || 0,
        srg: initial.srg || 25,
        salesPrice: initial.salesPrice || 0,
        status: initial.status || 'quote'
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const isValid = form.name.trim() && form.model.trim() && form.facility.trim();

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleNumberChange = (key) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const calculateSalesPrice = () => {
    const costs = [
      form.invoice,
      form.deliverySetup,
      form.ac,
      form.tileDelivery,
      form.steps,
      form.trimOut,
      form.skirting,
      form.pad,
      form.esc,
      form.misc
    ].reduce((sum, cost) => sum + cost, 0);

    const srgAmount = costs * (form.srg / 100);
    return costs + srgAmount;
  };

  const handleCalculateSalesPrice = () => {
    const calculatedPrice = calculateSalesPrice();
    setForm((f) => ({ ...f, salesPrice: Math.round(calculatedPrice) }));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        facility: form.facility.trim(),
        name: form.name.trim(),
        model: form.model.trim(),
        size: form.size.trim(),
        bedBath: form.bedBath.trim(),
        po: form.po.trim(),
        invoice: form.invoice,
        deliverySetup: form.deliverySetup,
        ac: form.ac,
        tileDelivery: form.tileDelivery,
        steps: form.steps,
        trimOut: form.trimOut,
        skirting: form.skirting,
        pad: form.pad,
        esc: form.esc,
        misc: form.misc,
        srg: form.srg,
        salesPrice: form.salesPrice,
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
      PaperProps={{ sx: { width: 500, p: 2, backgroundColor: '#2a2746', borderLeft: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>{initial ? 'Edit Inventory Item' : 'Add Inventory Item'}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Facility/Location"
              value={form.facility}
              onChange={handleChange('facility')}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model/SKU"
              value={form.model}
              onChange={handleChange('model')}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Item Name"
              value={form.name}
              onChange={handleChange('name')}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Size (Width x Length)"
              value={form.size}
              onChange={handleChange('size')}
              placeholder="e.g., 28x60"
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bed & Bath"
              value={form.bedBath}
              onChange={handleChange('bedBath')}
              placeholder="e.g., 3/2"
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Purchase Order (PO)"
              value={form.po}
              onChange={handleChange('po')}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mt: 2 }}>Cost Breakdown</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Invoice Cost"
              type="number"
              value={form.invoice}
              onChange={handleNumberChange('invoice')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DEL/SET"
              type="number"
              value={form.deliverySetup}
              onChange={handleNumberChange('deliverySetup')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="A/C"
              type="number"
              value={form.ac}
              onChange={handleNumberChange('ac')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="T/D"
              type="number"
              value={form.tileDelivery}
              onChange={handleNumberChange('tileDelivery')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Steps"
              type="number"
              value={form.steps}
              onChange={handleNumberChange('steps')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Trim Out"
              type="number"
              value={form.trimOut}
              onChange={handleNumberChange('trimOut')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Skirting"
              type="number"
              value={form.skirting}
              onChange={handleNumberChange('skirting')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pad"
              type="number"
              value={form.pad}
              onChange={handleNumberChange('pad')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ESC"
              type="number"
              value={form.esc}
              onChange={handleNumberChange('esc')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="MISC"
              type="number"
              value={form.misc}
              onChange={handleNumberChange('misc')}
              InputProps={{ startAdornment: '$' }}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mt: 2 }}>Pricing</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SRG (%)"
              type="number"
              value={form.srg}
              onChange={handleNumberChange('srg')}
              sx={{
                '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Sales Price"
                type="number"
                value={form.salesPrice}
                onChange={handleNumberChange('salesPrice')}
                InputProps={{ startAdornment: '$' }}
                sx={{
                  '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.05)' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleCalculateSalesPrice}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Calc
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            sx={{ backgroundColor: '#90caf9', '&:hover': { backgroundColor: '#64b5f6' } }}
          >
            {submitLabel || (initial ? 'Save Changes' : 'Add Inventory')}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default AddInventoryDrawer;


