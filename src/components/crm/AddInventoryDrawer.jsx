import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { FormTextField, FormSelect, FormGrid, FormGridItem, FormSection } from '../FormField';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';

function AddInventoryDrawer({ open, onClose, onCreate, onSubmit, initial, submitLabel }) {
  const { userProfile } = useUser();
  const [masterPricing, setMasterPricing] = useState({ single: {}, double: {} });

  const empty = {
    model: '',
    size: '',
    bedBath: '',
    po: '',
    width: 'single', // single or double
    status: 'stock',
    // Home information fields
    factory: '',
    serialNumber: '',
    year: '',
    widthLength: '', // WxL format (e.g., "14x70")
    squareFeet: '',
    invoice: 0, // Base cost
    markupPercent: 0, // Markup percentage
    salesPrice: 0, // Final price (calculated)
  };

  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  // Load master pricing
  useEffect(() => {
    if (!userProfile?.companyId || !open) return;

    const loadMasterPricing = async () => {
      try {
        const docRef = doc(db, 'companies', userProfile.companyId, 'settings', 'masterPricing');
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

  // Calculate sales price based on invoice, markup percentage, and master pricing
  const calculateSalesPrice = () => {
    const invoice = parseFloat(form.invoice) || 0;
    const markupPercent = parseFloat(form.markupPercent) || 0;
    const pricing = masterPricing[form.width] || {};

    // Start with invoice
    let total = invoice;

    // Add master pricing options (these are fixed amounts, not percentages)
    const masterOptions = [
      'deliverySetup', 'ac', 'tileDelivery', 'steps',
      'trimOut', 'skirting', 'pad', 'esc', 'misc'
    ];

    masterOptions.forEach(option => {
      if (pricing[option]) {
        total += parseFloat(pricing[option]);
      }
    });

    // Apply markup to the total (invoice + master pricing options)
    total = total * (1 + (markupPercent / 100));

    return Math.round(total);
  };

  // Auto-calculate sales price when invoice or markup changes
  useEffect(() => {
    if (form.invoice || form.markupPercent) {
      const calculatedPrice = calculateSalesPrice();
      setForm(prev => ({ ...prev, salesPrice: calculatedPrice }));
    }
  }, [form.invoice, form.markupPercent, form.width, masterPricing]);

  useEffect(() => {
    if (initial) {
      setForm({
        ...empty,
        ...initial,
        // Ensure all fields have proper defaults
        width: initial.width || 'single',
        status: initial.status || 'stock',
        squareFeet: initial.squareFeet || '',
        year: initial.year || '',
        invoice: initial.invoice || 0,
        markupPercent: initial.markupPercent || 0,
        salesPrice: initial.salesPrice || 0,
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const isValid = !!(form.model.trim() && form.factory.trim());
  console.log('Form validation - model:', form.model, 'factory:', form.factory, 'isValid:', isValid);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleNumberChange = (key) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm((f) => ({ ...f, [key]: value }));
  };


  const handleSubmit = async () => {
    console.log('AddInventoryDrawer handleSubmit called');
    console.log('isValid:', isValid, 'submitting:', submitting);
    console.log('form data:', JSON.stringify(form, null, 2));

    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        model: form.model.trim(),
        size: form.size.trim(),
        bedBath: form.bedBath.trim(),
        po: form.po.trim(),
        width: form.width,
        status: form.status,
        // Home information fields
        factory: form.factory.trim(),
        serialNumber: form.serialNumber.trim(),
        year: parseInt(form.year) || 0,
        widthLength: form.widthLength.trim(),
        squareFeet: parseInt(form.squareFeet) || 0,
        invoice: parseFloat(form.invoice) || 0,
        markupPercent: parseFloat(form.markupPercent) || 0,
        salesPrice: parseFloat(form.salesPrice) || 0,
      };

      if (initial && onSubmit) {
        // Editing existing item
        await onSubmit(payload);
      } else if (!initial && onCreate) {
        // Creating new item
        await onCreate(payload);
      }
      setForm(empty);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Inventory Item' : 'Add Inventory Item'}
      width={600}
      actions={
        <DrawerActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitDisabled={!isValid || submitting}
          submitLabel={submitLabel || (initial ? 'Save Changes' : 'Add Inventory')}
        />
      }
    >
      <FormSection title="Home Information">
        <FormGrid>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Factory"
              value={form.factory}
              onChange={handleChange('factory')}
              required
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Serial Number"
              value={form.serialNumber}
              onChange={handleChange('serialNumber')}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Model"
              value={form.model}
              onChange={handleChange('model')}
              required
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Size"
              value={form.size}
              onChange={handleChange('size')}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Year"
              type="number"
              value={form.year}
              onChange={handleNumberChange('year')}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="WxL (Width x Length)"
              value={form.widthLength}
              onChange={handleChange('widthLength')}
              placeholder="e.g., 14x70"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="B/B (Bed/Bath)"
              value={form.bedBath}
              onChange={handleChange('bedBath')}
              placeholder="e.g., 3/2"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Square Feet"
              type="number"
              value={form.squareFeet}
              onChange={handleNumberChange('squareFeet')}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Invoice (Cost)"
              type="number"
              value={form.invoice}
              onChange={handleNumberChange('invoice')}
              InputProps={{ startAdornment: '$' }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Markup %"
              type="number"
              value={form.markupPercent}
              onChange={handleNumberChange('markupPercent')}
              InputProps={{ endAdornment: '%' }}
              helperText="Percentage markup on invoice"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormTextField
              label="Sales Price"
              type="number"
              value={form.salesPrice}
              onChange={handleNumberChange('salesPrice')}
              InputProps={{ startAdornment: '$' }}
            />
          </FormGridItem>
        </FormGrid>
      </FormSection>

      <FormSection title="Details">
        <FormGrid>
          <FormGridItem xs={12} sm={6}>
            <FormSelect
              label="Width"
              value={form.width}
              onChange={handleChange('width')}
              options={[
                { value: 'single', label: 'Single-Wide' },
                { value: 'double', label: 'Double-Wide' }
              ]}
              required
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6}>
            <FormSelect
              label="Status"
              value={form.status}
              onChange={handleChange('status')}
              options={[
                { value: 'quote', label: 'Quote' },
                { value: 'ordered', label: 'Ordered' },
                { value: 'stock', label: 'In Stock' },
                { value: 'sold', label: 'Sold' }
              ]}
            />
          </FormGridItem>
        </FormGrid>
      </FormSection>
    </BaseDrawer>
  );
}

export default AddInventoryDrawer;