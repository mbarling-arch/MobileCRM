import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';

function InventoryDialog({ open, onClose, onCreate, onSubmit, initial, mode: initialMode = 'create' }) {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState(initialMode); // 'create', 'view', 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [masterPricing, setMasterPricing] = useState({
    single: {}, double: {}, triple: {}, tiny: {}, used: {}
  });

  const empty = {
    // Home Information
    status: 'stock',
    availabilityStatus: 'available',
    factory: '',
    type: 'single',
    model: '',
    size: '',
    year: '',
    bedBath: '',
    squareFeet: '',
    invoice: 0,
    markupPercent: 0,
    salesPrice: 0,
    
    // Build Information - Single values
    serialNumber1: '',
    serialNumber2: '',
    serialNumber3: '',
    hudNumber1: '',
    hudNumber2: '',
    hudNumber3: '',
    weight1: '',
    weight2: '',
    weight3: '',
    width1: '',
    width2: '',
    width3: '',
    length1: '',
    length2: '',
    length3: '',
    
    // Common build specs
    floorRValue: '',
    floorThickness: '',
    wallRValue: '',
    wallThickness: '',
    roofRValue: '',
    roofThickness: '',
    windZone: '',
    thermalZone: '',
    roofLoad: ''
  };

  const [form, setForm] = useState(empty);

  // Load master pricing from user's location
  useEffect(() => {
    if (!userProfile?.companyId || !userProfile?.locationId || !open) return;

    const loadMasterPricing = async () => {
      try {
        const docRef = doc(db, 'companies', userProfile.companyId, 'locations', userProfile.locationId, 'settings', 'masterPricing');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMasterPricing(docSnap.data());
        }
      } catch (error) {
        console.error('Error loading master pricing:', error);
      }
    };

    loadMasterPricing();
  }, [userProfile, open]);

  // Calculate sales price when invoice, markup, or type changes
  useEffect(() => {
    if (form.invoice || form.markupPercent) {
      const invoice = parseFloat(form.invoice) || 0;
      const markupPercent = parseFloat(form.markupPercent) || 0;
      const pricing = masterPricing[form.type] || {};

      // Start with invoice
      let total = invoice;

      // Add master pricing options
      const masterOptions = ['basePrice', 'deliverySetup', 'ac', 'steps', 'trimOut', 'skirting', 'pad'];
      masterOptions.forEach(option => {
        if (pricing[option]) {
          total += parseFloat(pricing[option]) || 0;
        }
      });

      // Apply markup percentage to the total
      total = total * (1 + (markupPercent / 100));

      setForm(prev => ({ ...prev, salesPrice: Math.round(total) }));
    }
  }, [form.invoice, form.markupPercent, form.type, masterPricing]);

  useEffect(() => {
    if (initial) {
      setForm({ ...empty, ...initial });
      setMode(initialMode || 'view');
    } else {
      setForm(empty);
      setMode('create');
    }
    setActiveTab(0);
  }, [initial, open, initialMode]);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleNumberChange = (key) => (e) => {
    const value = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const isValid = () => {
    return !!(form.factory.trim() && form.model.trim());
  };

  const handleSubmit = async () => {
    if (!isValid() || submitting) return;
    setSubmitting(true);
    
    try {
      const payload = {
        ...form,
        year: parseInt(form.year) || 0,
        squareFeet: parseInt(form.squareFeet) || 0,
        invoice: parseFloat(form.invoice) || 0,
        markupPercent: parseFloat(form.markupPercent) || 0,
        salesPrice: parseFloat(form.salesPrice) || 0
      };

      if (initial && onSubmit) {
        await onSubmit(payload);
      } else if (!initial && onCreate) {
        await onCreate(payload);
      }
      
      setForm(empty);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getSectionCount = () => {
    if (form.type === 'single' || form.type === 'tiny') return 1;
    if (form.type === 'double') return 2;
    if (form.type === 'triple') return 3;
    return 1;
  };

  const isReadOnly = mode === 'view';
  const canEdit = mode === 'view' && initial;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'customColors.cardBackground',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {mode === 'create' ? 'Add Inventory Item' : mode === 'view' ? 'View Inventory Item' : 'Edit Inventory Item'}
        </Typography>
        <Box>
          {canEdit && (
            <IconButton onClick={() => setMode('edit')} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600 }
        }}
      >
        <Tab label="Home Information" />
        <Tab label="Build Information" />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {/* Home Information Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status (Tab Category)"
                value={form.status}
                onChange={handleChange('status')}
                disabled={isReadOnly}
                helperText="Determines which tab this home appears in"
              >
                <MenuItem value="quote">Quote</MenuItem>
                <MenuItem value="on_order">On Order</MenuItem>
                <MenuItem value="rso">RSO</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="used">Used</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Availability"
                value={form.availabilityStatus || 'available'}
                onChange={handleChange('availabilityStatus')}
                disabled={isReadOnly}
                helperText="Current sales status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Factory"
                value={form.factory}
                onChange={handleChange('factory')}
                required
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                value={form.type}
                onChange={handleChange('type')}
                disabled={isReadOnly}
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="double">Double</MenuItem>
                <MenuItem value="triple">Triple</MenuItem>
                <MenuItem value="tiny">Tiny</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={form.model}
                onChange={handleChange('model')}
                required
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Size"
                value={form.size}
                onChange={handleChange('size')}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={form.year}
                onChange={handleNumberChange('year')}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="B/B (Bed/Bath)"
                value={form.bedBath}
                onChange={handleChange('bedBath')}
                placeholder="e.g., 3/2"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                value={form.squareFeet}
                onChange={handleNumberChange('squareFeet')}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice"
                type="number"
                value={form.invoice}
                onChange={handleNumberChange('invoice')}
                InputProps={{ startAdornment: '$' }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mark Up %"
                type="number"
                value={form.markupPercent}
                onChange={handleNumberChange('markupPercent')}
                InputProps={{ endAdornment: '%' }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sales Price (Calculated)"
                type="number"
                value={form.salesPrice}
                InputProps={{ startAdornment: '$' }}
                disabled
                helperText="Invoice + Master Pricing + Markup %"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(76, 175, 80, 0.9)',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
          </Grid>
        )}

        {/* Build Information Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Serial Numbers, HUD Numbers, Weight, Width, Length - based on type */}
            {[...Array(getSectionCount())].map((_, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                {getSectionCount() > 1 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Section {index + 1}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Serial Number"
                      value={form[`serialNumber${index + 1}`]}
                      onChange={handleChange(`serialNumber${index + 1}`)}
                      disabled={isReadOnly}
                    />
                  </Grid>

                  {form.type !== 'tiny' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="HUD Number"
                        value={form[`hudNumber${index + 1}`]}
                        onChange={handleChange(`hudNumber${index + 1}`)}
                        disabled={isReadOnly}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Weight"
                      value={form[`weight${index + 1}`]}
                      onChange={handleChange(`weight${index + 1}`)}
                      disabled={isReadOnly}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Width"
                      value={form[`width${index + 1}`]}
                      onChange={handleChange(`width${index + 1}`)}
                      disabled={isReadOnly}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Length"
                      value={form[`length${index + 1}`]}
                      onChange={handleChange(`length${index + 1}`)}
                      disabled={isReadOnly}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            {/* Common Build Specs */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Build Specifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Floor R-Value"
                  value={form.floorRValue}
                  onChange={handleChange('floorRValue')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Floor Thickness"
                  value={form.floorThickness}
                  onChange={handleChange('floorThickness')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wall R-Value"
                  value={form.wallRValue}
                  onChange={handleChange('wallRValue')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wall Thickness"
                  value={form.wallThickness}
                  onChange={handleChange('wallThickness')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roof R-Value"
                  value={form.roofRValue}
                  onChange={handleChange('roofRValue')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roof Thickness"
                  value={form.roofThickness}
                  onChange={handleChange('roofThickness')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Wind Zone"
                  value={form.windZone}
                  onChange={handleChange('windZone')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Thermal Zone"
                  value={form.thermalZone}
                  onChange={handleChange('thermalZone')}
                  disabled={isReadOnly}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Roof Load"
                  value={form.roofLoad}
                  onChange={handleChange('roofLoad')}
                  disabled={isReadOnly}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {mode !== 'view' && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!isValid() || submitting}
            color="success"
          >
            {submitting ? 'Saving...' : initial ? 'Save Changes' : 'Add Inventory'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default InventoryDialog;

