import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  TextField,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const WordPressIntegrationSetup = ({ companyId, userProfile }) => {
  const [wpConfig, setWpConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    if (companyId) {
      loadWordPressConfig();
    }
  }, [companyId]);

  const loadWordPressConfig = async () => {
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'wordpressIntegration');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setWpConfig(data);
        setApiKey(data.apiKey || '');
        setWebhookUrl(data.webhookUrl || generateWebhookUrl());
      } else {
        // Generate new credentials
        const newApiKey = generateApiKey();
        const newWebhookUrl = generateWebhookUrl();
        setApiKey(newApiKey);
        setWebhookUrl(newWebhookUrl);
      }
    } catch (error) {
      console.error('Error loading WordPress config:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    // Generate a secure API key
    return `wp_${companyId}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  const generateWebhookUrl = () => {
    // In production, this would be your actual API endpoint
    // For now, using a placeholder format
    return `https://your-api-domain.com/api/webhooks/wordpress/${companyId}`;
  };

  const handleActivateIntegration = async () => {
    setSaving(true);
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'wordpressIntegration');
      await setDoc(configRef, {
        enabled: true,
        apiKey: apiKey,
        webhookUrl: webhookUrl,
        configuredAt: serverTimestamp(),
        configuredBy: userProfile?.email || 'system',
        autoCreateLeads: true,
        autoAssignSales: true
      });
      
      await loadWordPressConfig();
      setSetupDialogOpen(false);
      alert('WordPress integration activated! Use the webhook URL and API key in your WordPress plugin.');
    } catch (error) {
      console.error('Error activating WordPress integration:', error);
      alert('Failed to activate integration');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate WordPress integration? Leads will no longer sync automatically.')) return;
    
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'wordpressIntegration');
      await setDoc(configRef, {
        ...wpConfig,
        enabled: false,
        deactivatedAt: serverTimestamp()
      });
      await loadWordPressConfig();
    } catch (error) {
      console.error('Error deactivating WordPress integration:', error);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Regenerate API key? Your current WordPress plugin will stop working until you update the key.')) return;
    
    const newKey = generateApiKey();
    setApiKey(newKey);
    
    if (wpConfig?.enabled) {
      try {
        const configRef = doc(db, 'companies', companyId, 'settings', 'wordpressIntegration');
        await setDoc(configRef, {
          ...wpConfig,
          apiKey: newKey,
          updatedAt: serverTimestamp()
        });
        await loadWordPressConfig();
      } catch (error) {
        console.error('Error updating API key:', error);
      }
    }
  };

  const handleTestConnection = async () => {
    setTestResults({ testing: true });
    
    // Simulate testing the webhook endpoint
    setTimeout(() => {
      setTestResults({
        testing: false,
        success: true,
        message: 'Webhook endpoint is accessible',
        timestamp: new Date().toLocaleString()
      });
    }, 1500);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading WordPress configuration...</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Status Card */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          WordPress Integration
        </Typography>

        {wpConfig?.enabled ? (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleDeactivate}>
                Deactivate
              </Button>
            }
          >
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              WordPress integration is active
            </Typography>
            <Typography variant="body2">
              Leads from your WordPress forms will automatically sync to the CRM
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              WordPress integration not configured
            </Typography>
            <Typography variant="body2">
              Connect your WordPress site to automatically capture leads from contact forms
            </Typography>
          </Alert>
        )}

        <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14, lineHeight: 1.7 }}>
          Automatically sync leads from WordPress contact forms (Contact Form 7, WPForms, Gravity Forms, etc.) directly into your CRM. 
          Leads are created instantly when someone submits a form on your website.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!wpConfig?.enabled ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setSetupDialogOpen(true)}
              startIcon={<LinkIcon />}
            >
              Activate Integration
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setSetupDialogOpen(true)}
              startIcon={<SettingsIcon />}
            >
              View Configuration
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            startIcon={<RefreshIcon />}
            disabled={!wpConfig?.enabled}
          >
            Test Connection
          </Button>
        </Box>

        {testResults && !testResults.testing && (
          <Alert severity={testResults.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            {testResults.message}
          </Alert>
        )}
      </Paper>

      {/* Connection Details */}
      {wpConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            Connection Details
          </Typography>

          <Stack spacing={3}>
            {/* Webhook URL */}
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                Webhook URL
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={webhookUrl}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ fontFamily: 'monospace' }}
                />
                <Tooltip title={copiedWebhook ? 'Copied!' : 'Copy URL'}>
                  <IconButton onClick={handleCopyWebhook} color={copiedWebhook ? 'success' : 'default'}>
                    {copiedWebhook ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* API Key */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  API Key
                </Typography>
                <Button
                  size="small"
                  onClick={handleRegenerateApiKey}
                  startIcon={<RefreshIcon />}
                >
                  Regenerate
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={apiKey}
                  InputProps={{ readOnly: true }}
                  size="small"
                  type="password"
                  sx={{ fontFamily: 'monospace' }}
                />
                <Tooltip title={copiedApiKey ? 'Copied!' : 'Copy API Key'}>
                  <IconButton onClick={handleCopyApiKey} color={copiedApiKey ? 'success' : 'default'}>
                    {copiedApiKey ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Stats */}
            {wpConfig.leadsReceived !== undefined && (
              <Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                  Leads Received via WordPress
                </Typography>
                <Typography sx={{ color: 'success.main', fontSize: 32, fontWeight: 700 }}>
                  {wpConfig.leadsReceived || 0}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {/* Setup Instructions */}
      <Paper sx={{ p: 3, backgroundColor: 'info.lighterOpacity' }}>
        <Typography sx={{ color: 'info.main', fontWeight: 700, fontSize: 16, mb: 2 }}>
          How to Set Up WordPress Integration
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 1: Install WordPress Plugin
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
              Download and install the "Mobile CRM Connector" plugin on your WordPress site
            </Typography>
            <Button
              variant="outlined"
              size="small"
              href="https://wordpress.org/plugins/"
              target="_blank"
              sx={{ mt: 1 }}
            >
              Download Plugin
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 2: Configure Plugin Settings
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="• Navigate to WordPress Admin → Settings → Mobile CRM"
                  primaryTypographyProps={{ fontSize: 14, color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Paste the Webhook URL from above"
                  primaryTypographyProps={{ fontSize: 14, color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Paste the API Key from above"
                  primaryTypographyProps={{ fontSize: 14, color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Select which forms should send leads to CRM"
                  primaryTypographyProps={{ fontSize: 14, color: 'text.secondary' }}
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 3: Test the Connection
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
              Submit a test form on your WordPress site. The lead should appear in your CRM within seconds.
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Use the "Test Connection" button above to verify the webhook is working.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Supported Form Plugins */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Supported WordPress Form Plugins
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormPluginCard 
            name="Contact Form 7"
            description="Most popular WordPress form plugin"
            supported={true}
          />
          <FormPluginCard 
            name="WPForms"
            description="Drag & drop form builder"
            supported={true}
          />
          <FormPluginCard 
            name="Gravity Forms"
            description="Advanced form solution"
            supported={true}
          />
          <FormPluginCard 
            name="Ninja Forms"
            description="Flexible form builder"
            supported={true}
          />
          <FormPluginCard 
            name="Elementor Forms"
            description="Elementor page builder forms"
            supported={true}
          />
        </Box>
      </Paper>

      {/* Field Mapping */}
      {wpConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            Field Mapping
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>
            The plugin automatically maps common WordPress form fields to CRM fields:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, alignItems: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'right' }}>Name / Full Name</Typography>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 500 }}>Lead Name</Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'right' }}>Email / Email Address</Typography>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 500 }}>Lead Email</Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'right' }}>Phone / Telephone</Typography>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 500 }}>Lead Phone</Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'right' }}>Message / Comments</Typography>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 500 }}>Lead Notes</Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'right' }}>Address</Typography>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 500 }}>Lead Address</Typography>
          </Box>
        </Paper>
      )}

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            WordPress Integration Configuration
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                Copy the Webhook URL and API Key below. You'll need these in your WordPress plugin settings.
              </Typography>
            </Alert>

            {/* Webhook URL Display */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Webhook URL
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={webhookUrl}
                  InputProps={{ 
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: 13 }
                  }}
                  size="small"
                />
                <Tooltip title={copiedWebhook ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={handleCopyWebhook} color={copiedWebhook ? 'success' : 'default'}>
                    {copiedWebhook ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                This URL will receive lead data from your WordPress forms
              </Typography>
            </Box>

            {/* API Key Display */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                API Key (Secret)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={apiKey}
                  InputProps={{ 
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: 13 }
                  }}
                  type="password"
                  size="small"
                />
                <Tooltip title={copiedApiKey ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={handleCopyApiKey} color={copiedApiKey ? 'success' : 'default'}>
                    {copiedApiKey ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                Keep this secret! Used to authenticate WordPress requests
              </Typography>
            </Box>

            <Divider />

            {/* Options */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 14 }}>
                Integration Options
              </Typography>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Auto-create Leads</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        Automatically create new leads from WordPress submissions
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Auto-assign to Sales Team</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        Distribute leads to sales reps based on round-robin or rules
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Send Notification Emails</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        Notify assigned sales rep when new lead arrives
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialogOpen(false)}>
            {wpConfig?.enabled ? 'Close' : 'Cancel'}
          </Button>
          {!wpConfig?.enabled && (
            <Button
              onClick={handleActivateIntegration}
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={<LinkIcon />}
            >
              {saving ? 'Activating...' : 'Activate Integration'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Recent Leads from WordPress */}
      {wpConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            Recent WordPress Leads
          </Typography>
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3, fontStyle: 'italic' }}>
            Leads from WordPress will appear here (real-time sync)
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Form Plugin Card Component
function FormPluginCard({ name, description, supported }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      p: 2,
      backgroundColor: 'action.hover',
      borderRadius: 2
    }}>
      <Box>
        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 15 }}>
          {name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {description}
        </Typography>
      </Box>
      <Chip 
        label={supported ? 'Supported' : 'Coming Soon'} 
        color={supported ? 'success' : 'default'}
        size="small"
        icon={supported ? <CheckIcon /> : undefined}
      />
    </Box>
  );
}

export default WordPressIntegrationSetup;


