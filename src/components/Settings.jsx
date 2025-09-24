import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Layout from './Layout';

const drawerWidth = 240;

function Settings() {
  const { logout, currentUser, updatePassword } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    autoBackup: true,
    twoFactorAuth: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };

  const handlePasswordChange = async () => {
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await updatePassword(passwordData.newPassword);
      setMessage('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError('Failed to update password: ' + error.message);
    }
  };

  const seedDemoData = async () => {
    setError('');
    setMessage('');
    try {
      const companies = [
        { name: 'Acme Homes', email: 'info@acmehomes.com', phone: '555-200-1000', industry: 'mobile homes', status: 'active' },
        { name: 'Pioneer Communities', email: 'contact@pioneerco.com', phone: '555-300-2000', industry: 'manufactured housing', status: 'active' },
        { name: 'Sunrise Estates', email: 'hello@sunriseestates.com', phone: '555-400-3000', industry: 'property management', status: 'active' },
      ];

      for (const company of companies) {
        const companyRef = await addDoc(collection(db, 'companies'), {
          ...company,
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid || 'seed'
        });

        // Seed a couple of locations per company
        const locations = [
          { name: 'Headquarters', address: '123 Main St', city: 'Fort Worth', state: 'TX', zipCode: '76102', phone: '555-111-2222', manager: 'Jane Doe' },
          { name: 'South Region', address: '456 Lakeview Dr', city: 'Austin', state: 'TX', zipCode: '78701', phone: '555-222-3333', manager: 'John Smith' },
        ];

        for (const location of locations) {
          const locationRef = await addDoc(collection(db, 'companies', companyRef.id, 'locations'), {
            ...location,
            createdAt: serverTimestamp(),
            createdBy: currentUser?.uid || 'seed'
          });

          // Seed a few users under each location
          const users = [
            { email: 'admin@' + company.name.replace(/\s+/g, '').toLowerCase() + '.com', firstName: 'Alex', lastName: 'Admin', role: 'admin', status: 'active' },
            { email: 'sara.sales@' + company.name.replace(/\s+/g, '').toLowerCase() + '.com', firstName: 'Sara', lastName: 'Sales', role: 'sales', status: 'active' },
            { email: 'oliver.ops@' + company.name.replace(/\s+/g, '').toLowerCase() + '.com', firstName: 'Oliver', lastName: 'Ops', role: 'operations', status: 'active' },
          ];

          for (const user of users) {
            await addDoc(collection(db, 'companies', companyRef.id, 'locations', locationRef.id, 'users'), {
              ...user,
              locationId: locationRef.id,
              displayName: `${user.firstName} ${user.lastName}`,
              createdAt: serverTimestamp(),
              createdBy: currentUser?.uid || 'seed',
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      setMessage('Demo data loaded successfully.');
    } catch (e) {
      console.error('Error seeding demo data:', e);
      setError('Failed to load demo data: ' + (e?.message || 'unknown error'));
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
            Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Profile Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Profile Settings
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Display Name"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    disabled
                    helperText="Email cannot be changed from settings"
                    sx={{ mb: 3 }}
                  />

                  <Button variant="contained" sx={{ borderRadius: 2 }}>
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <SecurityIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Security Settings
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    Change Password
                  </Typography>

                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    sx={{ mb: 3 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={handleSettingChange('twoFactorAuth')}
                      />
                    }
                    label="Enable Two-Factor Authentication"
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handlePasswordChange}
                    sx={{ borderRadius: 2 }}
                  >
                    Update Password
                  </Button>

                  {message && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {message}
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <NotificationsIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notification Settings
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange('emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                    sx={{ mb: 2, width: '100%' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={handleSettingChange('pushNotifications')}
                      />
                    }
                    label="Push Notifications"
                    sx={{ mb: 2, width: '100%' }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    Notification Types
                  </Typography>

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="New Company Signups"
                    sx={{ mb: 1, width: '100%' }}
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Payment Reminders"
                    sx={{ mb: 1, width: '100%' }}
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="System Alerts"
                    sx={{ mb: 3, width: '100%' }}
                  />

                  <Button variant="contained" sx={{ borderRadius: 2 }}>
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* System Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <StorageIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      System Settings
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoBackup}
                        onChange={handleSettingChange('autoBackup')}
                      />
                    }
                    label="Automatic Data Backup"
                    sx={{ mb: 2, width: '100%' }}
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Automatically backup your data daily to prevent data loss.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    Data Export
                  </Typography>

                  <Button variant="outlined" sx={{ mr: 2, mb: 2, borderRadius: 2 }}>
                    Export Companies Data
                  </Button>

                  <Button variant="outlined" sx={{ mr: 2, mb: 2, borderRadius: 2 }}>
                    Export Financial Data
                  </Button>

                  <Button variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    Export All Data
                  </Button>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    Demo Data
                  </Typography>

                  <Button variant="contained" onClick={seedDemoData} sx={{ borderRadius: 2, mr: 2 }}>
                    Load Demo Data
                  </Button>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, color: 'error.main' }}>
                    Danger Zone
                  </Typography>

                  <Button variant="outlined" color="error" sx={{ borderRadius: 2 }}>
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
}

export default Settings;
