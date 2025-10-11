import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { FormTextField, FormSelect, FormGrid, FormGridItem } from '../FormField';
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
    <BaseDrawer
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Lead' : 'Add Lead'}
      actions={
        <DrawerActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitDisabled={!isValid || submitting}
          submitLabel={submitLabel || (initial ? 'Save Changes' : 'Create Lead')}
        />
      }
    >
      <FormGrid>
        <FormGridItem xs={12} sm={6}>
          <FormTextField
            label="First Name"
            value={form.firstName}
            onChange={handleChange('firstName')}
          />
        </FormGridItem>
        <FormGridItem xs={12} sm={6}>
          <FormTextField
            label="Last Name"
            value={form.lastName}
            onChange={handleChange('lastName')}
          />
        </FormGridItem>
        <FormGridItem xs={12} sm={6}>
          <FormTextField
            label="Phone Number"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
        </FormGridItem>
        <FormGridItem xs={12} sm={6}>
          <FormTextField
            label="Email"
            value={form.email}
            onChange={handleChange('email')}
            type="email"
          />
        </FormGridItem>
        <FormGridItem xs={12} sm={6}>
          <FormSelect
            label="Source"
            value={form.source}
            onChange={handleChange('source')}
            options={LEAD_SOURCES}
          />
        </FormGridItem>
        <FormGridItem xs={12} sm={6}>
          <FormSelect
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            options={LEAD_STATUSES}
          />
        </FormGridItem>
      </FormGrid>
    </BaseDrawer>
  );
}

export default AddLeadDrawer;


