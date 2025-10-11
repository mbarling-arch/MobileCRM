import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const EmailDrawer = ({ open, onClose, leadId, companyId, docType = 'prospects', recipientEmail, recipientName }) => {
  const [emailForm, setEmailForm] = useState({
    to: recipientEmail || '',
    subject: '',
    body: '',
    template: ''
  });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      // Log email to Firestore
      await addDoc(collection(db, 'companies', companyId, docType, leadId, 'emails'), {
        to: emailForm.to,
        subject: emailForm.subject,
        body: emailForm.body,
        createdAt: serverTimestamp(),
        status: 'logged'
      });

      // Open default mail client
      window.location.href = `mailto:${emailForm.to}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.body)}`;

      // Reset form and close
      setEmailForm({ to: recipientEmail || '', subject: '', body: '', template: '' });
      onClose();
    } catch (error) {
      console.error('Error logging email:', error);
      alert('Failed to log email');
    } finally {
      setSending(false);
    }
  };

  const emailTemplates = [
    { value: 'intro', label: 'Introduction Email', subject: 'Welcome to Mobile CRM', body: 'Hi {name},\n\nThank you for your interest...' },
    { value: 'followup', label: 'Follow-up Email', subject: 'Following up on our conversation', body: 'Hi {name},\n\nI wanted to follow up...' },
    { value: 'appointment', label: 'Appointment Confirmation', subject: 'Appointment Confirmation', body: 'Hi {name},\n\nThis confirms your appointment...' }
  ];

  const handleTemplateSelect = (templateValue) => {
    const template = emailTemplates.find(t => t.value === templateValue);
    if (template) {
      setEmailForm(prev => ({
        ...prev,
        template: templateValue,
        subject: template.subject,
        body: template.body.replace('{name}', recipientName || 'there')
      }));
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 500 }, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
            Send Email
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Email Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Emails will open in your default mail client (Outlook, Gmail, etc.) and are logged in the CRM.
        </Alert>

        {/* Email Form */}
        <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
          {/* Template Selector */}
          <TextField
            select
            label="Use Template (Optional)"
            value={emailForm.template}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            size="small"
          >
            <MenuItem value="">None - Blank Email</MenuItem>
            {emailTemplates.map(template => (
              <MenuItem key={template.value} value={template.value}>{template.label}</MenuItem>
            ))}
          </TextField>

          {/* To Field */}
          <TextField
            label="To *"
            value={emailForm.to}
            onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
            placeholder="recipient@example.com"
            fullWidth
          />

          {/* Subject Field */}
          <TextField
            label="Subject *"
            value={emailForm.subject}
            onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject"
            fullWidth
          />

          {/* Body Field */}
          <TextField
            label="Message *"
            value={emailForm.body}
            onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
            placeholder="Compose your email..."
            multiline
            rows={12}
            fullWidth
          />
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={sending || !emailForm.to || !emailForm.subject || !emailForm.body}
            startIcon={<SendIcon />}
            fullWidth
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default EmailDrawer;

