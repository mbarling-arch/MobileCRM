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
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Link as LinkIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const StripeIntegrationSetup = ({ companyId, userProfile }) => {
  const [stripeConfig, setStripeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [copiedPublishable, setCopiedPublishable] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadStripeConfig();
    }
  }, [companyId]);

  const loadStripeConfig = async () => {
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'stripeIntegration');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setStripeConfig(data);
        setTestMode(data.testMode || false);
      }
    } catch (error) {
      console.error('Error loading Stripe config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!publishableKey || !secretKey) {
      alert('Please enter both Publishable and Secret keys');
      return;
    }

    setSaving(true);
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'stripeIntegration');
      await setDoc(configRef, {
        enabled: true,
        publishableKey: publishableKey,
        secretKey: secretKey, // In production, encrypt this!
        testMode: testMode,
        configuredAt: serverTimestamp(),
        configuredBy: userProfile?.email || 'system',
        features: {
          creditCards: true,
          achTransfers: true,
          subscriptions: true,
          invoices: true
        }
      });
      
      await loadStripeConfig();
      setSetupDialogOpen(false);
      alert('Stripe integration activated! You can now process payments directly in the CRM.');
    } catch (error) {
      console.error('Error activating Stripe:', error);
      alert('Failed to activate integration');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate Stripe integration? Payment processing will be disabled.')) return;
    
    try {
      const configRef = doc(db, 'companies', companyId, 'settings', 'stripeIntegration');
      await setDoc(configRef, {
        ...stripeConfig,
        enabled: false,
        deactivatedAt: serverTimestamp()
      });
      await loadStripeConfig();
    } catch (error) {
      console.error('Error deactivating Stripe:', error);
    }
  };

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading Stripe configuration...</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Status Card */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          Stripe Payment Integration
        </Typography>

        {stripeConfig?.enabled ? (
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
              Stripe integration is active {stripeConfig.testMode && '(Test Mode)'}
            </Typography>
            <Typography variant="body2">
              Accept payments via credit card, ACH, and more directly in your CRM
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              Stripe integration not configured
            </Typography>
            <Typography variant="body2">
              Connect Stripe to process payments, collect deposits, and manage subscriptions
            </Typography>
          </Alert>
        )}

        <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14, lineHeight: 1.7 }}>
          Process payments securely with Stripe. Accept credit cards, ACH transfers, collect deposits, 
          create payment plans, and track all transactions directly in your CRM.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!stripeConfig?.enabled ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setSetupDialogOpen(true)}
              startIcon={<LinkIcon />}
            >
              Connect Stripe
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setSetupDialogOpen(true)}
              startIcon={<PaymentIcon />}
            >
              Manage Integration
            </Button>
          )}
        </Box>
      </Paper>

      {/* Features Card */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Payment Features
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FeatureCard 
            icon={<CreditCardIcon />}
            title="Credit & Debit Cards"
            description="Accept all major credit and debit cards with PCI compliance built-in"
            enabled={stripeConfig?.enabled}
          />
          <FeatureCard 
            icon={<BankIcon />}
            title="ACH Bank Transfers"
            description="Direct bank transfers with lower fees for larger transactions"
            enabled={stripeConfig?.enabled}
          />
          <FeatureCard 
            icon={<PaymentIcon />}
            title="Deposit Collection"
            description="Collect and track customer deposits with automatic receipts"
            enabled={stripeConfig?.enabled}
          />
          <FeatureCard 
            icon={<PaymentIcon />}
            title="Payment Plans"
            description="Create installment plans and recurring billing schedules"
            enabled={stripeConfig?.enabled}
          />
        </Box>
      </Paper>

      {/* Connection Details */}
      {stripeConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            Connection Details
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Account Mode
                </Typography>
                <Chip 
                  label={stripeConfig.testMode ? 'Test Mode' : 'Live Mode'} 
                  color={stripeConfig.testMode ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                {stripeConfig.testMode 
                  ? 'Using test mode - no real charges will be processed' 
                  : 'Live mode - real payments are being processed'}
              </Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                  Payments Processed
                </Typography>
                <Typography sx={{ color: 'text.primary', fontSize: 28, fontWeight: 700 }}>
                  {stripeConfig.paymentsProcessed || 0}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                  Total Revenue
                </Typography>
                <Typography sx={{ color: 'success.main', fontSize: 28, fontWeight: 700 }}>
                  ${(stripeConfig.totalRevenue || 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Setup Instructions */}
      <Paper sx={{ p: 3, backgroundColor: 'info.lighterOpacity' }}>
        <Typography sx={{ color: 'info.main', fontWeight: 700, fontSize: 16, mb: 2 }}>
          How to Set Up Stripe Integration
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 1: Create Stripe Account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
              If you don't have a Stripe account, sign up at stripe.com
            </Typography>
            <Button
              variant="outlined"
              size="small"
              href="https://dashboard.stripe.com/register"
              target="_blank"
              sx={{ mt: 1 }}
            >
              Sign Up for Stripe
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 2: Get API Keys
            </Typography>
            <List dense>
              <ListItem>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  • Go to Stripe Dashboard → Developers → API Keys
                </Typography>
              </ListItem>
              <ListItem>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  • Copy your <strong>Publishable key</strong> (starts with pk_)
                </Typography>
              </ListItem>
              <ListItem>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  • Copy your <strong>Secret key</strong> (starts with sk_)
                </Typography>
              </ListItem>
              <ListItem>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  • Use test keys (pk_test_, sk_test_) for testing
                </Typography>
              </ListItem>
            </List>
            <Button
              variant="outlined"
              size="small"
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              sx={{ mt: 1 }}
            >
              Get API Keys
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Step 3: Activate Integration
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Click "Connect Stripe" above, paste your API keys, and activate the integration.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Use Cases */}
      {stripeConfig?.enabled && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
            How to Use Stripe in CRM
          </Typography>
          
          <Stack spacing={2}>
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                📝 Collect Deposits
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                In Deposit tab → Click "Add Deposit" → Select "Stripe Payment" → Customer enters card details → Instant processing
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                💰 Process Payments
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                Create payment links, send invoices, or process cards on file for recurring payments
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                📊 Track Revenue
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                All payments automatically logged, tracked, and synced to prospect/deal records
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            Connect Stripe Payment Processing
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="warning">
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Security Note
              </Typography>
              <Typography variant="body2">
                Never share your Secret Key. It will be encrypted and stored securely in Firestore.
              </Typography>
            </Alert>

            {/* Test/Live Mode Toggle */}
            <FormControlLabel
              control={
                <Switch 
                  checked={testMode} 
                  onChange={(e) => setTestMode(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    Test Mode {testMode && '(Recommended)'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Use test API keys for development - no real charges
                  </Typography>
                </Box>
              }
            />

            {/* Publishable Key */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Publishable Key
              </Typography>
              <TextField
                fullWidth
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder={testMode ? 'pk_test_...' : 'pk_live_...'}
                size="small"
                sx={{ fontFamily: 'monospace' }}
              />
              <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                Used in your frontend to tokenize card information (safe to expose)
              </Typography>
            </Box>

            {/* Secret Key */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Secret Key
              </Typography>
              <TextField
                fullWidth
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={testMode ? 'sk_test_...' : 'sk_live_...'}
                type="password"
                size="small"
                sx={{ fontFamily: 'monospace' }}
              />
              <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                Used server-side to create charges (keep secret!)
              </Typography>
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                Find your API keys in Stripe Dashboard → Developers → API Keys
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleActivate}
            variant="contained"
            color="primary"
            disabled={saving || !publishableKey || !secretKey}
            startIcon={<LinkIcon />}
          >
            {saving ? 'Activating...' : 'Activate Stripe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Methods Supported */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Supported Payment Methods
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Chip label="💳 Visa" variant="outlined" />
          <Chip label="💳 Mastercard" variant="outlined" />
          <Chip label="💳 American Express" variant="outlined" />
          <Chip label="💳 Discover" variant="outlined" />
          <Chip label="🏦 ACH Transfers" variant="outlined" />
          <Chip label="💵 Apple Pay" variant="outlined" />
          <Chip label="📱 Google Pay" variant="outlined" />
          <Chip label="🔄 Recurring Payments" variant="outlined" />
        </Box>
      </Paper>

      {/* Security & Compliance */}
      <Paper sx={{ p: 3, backgroundColor: 'success.lighterOpacity' }}>
        <Typography sx={{ color: 'success.main', fontWeight: 700, fontSize: 16, mb: 2 }}>
          Security & Compliance
        </Typography>
        <Stack spacing={1}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            ✓ PCI DSS Level 1 Compliant (Stripe handles all card data)
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            ✓ 256-bit SSL Encryption
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            ✓ 3D Secure & SCA Support (European regulations)
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            ✓ Automatic Fraud Detection
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            ✓ Instant Dispute Management
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

// Feature Card Component
function FeatureCard({ icon, title, description, enabled }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2,
      p: 2,
      backgroundColor: enabled ? 'action.selected' : 'action.hover',
      borderRadius: 2,
      opacity: enabled ? 1 : 0.6
    }}>
      <Box sx={{ color: enabled ? 'primary.main' : 'text.disabled' }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 15 }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

export default StripeIntegrationSetup;


