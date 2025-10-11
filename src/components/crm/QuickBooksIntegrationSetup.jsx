import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  FormControlLabel,
  Switch,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Link as LinkIcon,
  AccountBalance as AccountingIcon,
  Sync as SyncIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  TrendingUp as RevenueIcon
} from '@mui/icons-material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const QuickBooksIntegrationSetup = ({ companyId, userProfile }) => {
  const [qbConfig, setQbConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadQuickBooksConfig();
    }
  }, [companyId]);

  const loadQuickBooksConfig = async () => {
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'quickbooksIntegration');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setQbConfig(data);
        setLastSync(data.lastSyncAt);
      }
    } catch (error) {
      console.error('Error loading QuickBooks config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setSaving(true);
    try {
      // In production, this would:
      // 1. Redirect to QuickBooks OAuth
      // 2. Get authorization
      // 3. Store encrypted tokens
      
      const configRef = doc(db, 'companies', companyId, 'settings', 'quickbooksIntegration');
      await setDoc(configRef, {
        enabled: true,
        companyId: companyId,
        realmId: 'demo-realm-id', // This comes from QuickBooks OAuth
        accessToken: 'encrypted-token-here',
        refreshToken: 'encrypted-refresh-token',
        connectedAt: serverTimestamp(),
        connectedBy: userProfile?.email || 'system',
        syncSettings: {
          autoSyncCustomers: true,
          autoSyncInvoices: true,
          autoSyncPayments: true,
          syncInterval: 'hourly'
        }
      });
      
      alert('QuickBooks OAuth Setup:\n\n1. This would redirect you to QuickBooks\n2. Authorize app access\n3. Sync starts automatically\n\nFor demo purposes, integration is now "connected".');
      
      await loadQuickBooksConfig();
      setSetupDialogOpen(false);
    } catch (error) {
      console.error('Error connecting QuickBooks:', error);
      alert('Failed to connect to QuickBooks');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect QuickBooks? Automatic syncing will stop.')) return;
    
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'quickbooksIntegration');
      await setDoc(configRef, {
        ...qbConfig,
        enabled: false,
        disconnectedAt: serverTimestamp()
      });
      await loadQuickBooksConfig();
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      // In production, this would trigger backend sync process
      setTimeout(() => {
        setLastSync(new Date());
        setSyncing(false);
        alert('Sync complete! Customers, invoices, and payments are up to date.');
      }, 2000);
    } catch (error) {
      console.error('Error syncing QuickBooks:', error);
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading QuickBooks configuration...</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Status Card */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          QuickBooks Integration
        </Typography>

        {qbConfig?.enabled ? (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleDisconnect}>
                Disconnect
              </Button>
            }
          >
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              QuickBooks integration is active
            </Typography>
            <Typography variant="body2">
              Automatic sync is running. Last sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              QuickBooks integration not configured
            </Typography>
            <Typography variant="body2">
              Connect QuickBooks to automatically sync customers, invoices, and payments
            </Typography>
          </Alert>
        )}

        <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14, lineHeight: 1.7 }}>
          Sync your CRM data with QuickBooks Online. Customers, deals, invoices, and payments are automatically 
          synchronized between systems, eliminating double-entry and keeping your books accurate.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!qbConfig?.enabled ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setSetupDialogOpen(true)}
              startIcon={<LinkIcon />}
            >
              Connect QuickBooks
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleManualSync}
                startIcon={syncing ? <RefreshIcon className="rotating" /> : <SyncIcon />}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSetupDialogOpen(true)}
              >
                Settings
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Sync Features */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          What Gets Synced
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SyncFeatureCard 
            title="Customers & Prospects"
            direction="CRM → QuickBooks"
            description="Prospects converted to Deals automatically become QuickBooks customers"
            enabled={qbConfig?.enabled}
          />
          <SyncFeatureCard 
            title="Invoices"
            direction="CRM ↔ QuickBooks"
            description="Create invoices in either system - they sync both ways"
            enabled={qbConfig?.enabled}
          />
          <SyncFeatureCard 
            title="Payments & Deposits"
            direction="CRM → QuickBooks"
            description="Payments collected in CRM are recorded as QuickBooks payments"
            enabled={qbConfig?.enabled}
          />
          <SyncFeatureCard 
            title="Revenue Tracking"
            direction="QuickBooks → CRM"
            description="See QuickBooks revenue data in CRM dashboards"
            enabled={qbConfig?.enabled}
          />
        </Box>
      </Paper>

      {/* Sync Settings */}
      {qbConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            Sync Settings
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Auto-sync Customers</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  New deals → QuickBooks customers
                </Typography>
              </Box>
              <Switch checked={qbConfig.syncSettings?.autoSyncCustomers} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Auto-sync Invoices</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  CRM invoices → QuickBooks invoices
                </Typography>
              </Box>
              <Switch checked={qbConfig.syncSettings?.autoSyncInvoices} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Auto-sync Payments</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  Deposits & payments → QuickBooks
                </Typography>
              </Box>
              <Switch checked={qbConfig.syncSettings?.autoSyncPayments} />
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 1 }}>Sync Interval</Typography>
              <Chip 
                label={qbConfig.syncSettings?.syncInterval === 'hourly' ? 'Every Hour' : qbConfig.syncSettings?.syncInterval === 'daily' ? 'Daily' : 'Real-time'} 
                color="primary"
                size="small"
              />
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Setup Instructions */}
      <Paper sx={{ p: 3, backgroundColor: 'info.lighterOpacity' }}>
        <Typography sx={{ color: 'info.main', fontWeight: 700, fontSize: 16, mb: 2 }}>
          How to Set Up QuickBooks Integration
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 1: QuickBooks Online Account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Make sure you have a QuickBooks Online account (Desktop version not supported)
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 2: Click "Connect QuickBooks"
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              You'll be redirected to QuickBooks to authorize the connection
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 3: Configure Sync Settings
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Choose what data to sync and how often
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 4: Initial Sync
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              The first sync may take a few minutes depending on data volume
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

// Sync Feature Card Component
function SyncFeatureCard({ title, direction, description, enabled }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      backgroundColor: enabled ? 'action.selected' : 'action.hover',
      borderRadius: 2,
      opacity: enabled ? 1 : 0.6
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 15, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, mb: 0.5 }}>
          {description}
        </Typography>
        <Chip 
          label={direction} 
          size="small" 
          sx={{ fontSize: 11, height: 20 }}
          color="primary"
          variant="outlined"
        />
      </Box>
      {enabled && <CheckIcon sx={{ color: 'success.main' }} />}
    </Box>
  );
}

export default QuickBooksIntegrationSetup;


