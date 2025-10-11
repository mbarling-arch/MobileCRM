import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import WordPressIntegrationSetup from './WordPressIntegrationSetup';
import StripeIntegrationSetup from './StripeIntegrationSetup';
import QuickBooksIntegrationSetup from './QuickBooksIntegrationSetup';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';

function LocationPortal() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [location, setLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'sales' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({});

  const companyId = userProfile?.companyId || 'demo-company';

  // Load location data
  useEffect(() => {
    if (!locationId || !companyId) return;

    const locationRef = doc(db, 'companies', companyId, 'locations', locationId);
    const unsub = onSnapshot(locationRef, (snap) => {
      if (snap.exists()) {
        setLocation({ id: snap.id, ...snap.data() });
        setLocationForm({ id: snap.id, ...snap.data() });
      } else {
        setSnackbar({ open: true, message: 'Location not found', severity: 'error' });
        navigate('/crm/setup');
      }
    });

    return () => unsub();
  }, [locationId, companyId, navigate]);

  // Load users for this location
  useEffect(() => {
    if (!locationId || !companyId) return;

    const usersRef = collection(db, 'companies', companyId, 'locations', locationId, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    });

    return () => unsub();
  }, [locationId, companyId]);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    try {
      const { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();

      // Create Firebase Auth user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, tempPassword);

      // Create user profile in Firestore (location-specific)
      await addDoc(collection(db, 'companies', companyId, 'locations', locationId, 'users'), {
        firebaseUid: userCredential.user.uid,
        email: newUser.email,
        displayName: newUser.name,
        role: newUser.role,
        status: 'active',
        createdAt: serverTimestamp()
      });

      // Send password reset email
      await sendPasswordResetEmail(auth, newUser.email);

      setSnackbar({ open: true, message: `User created! Password reset email sent to ${newUser.email}`, severity: 'success' });
      setAddUserDialogOpen(false);
      setNewUser({ email: '', name: '', role: 'sales' });
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({ open: true, message: 'Failed to create user: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, 'companies', companyId, 'locations', locationId, 'users', userId));
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleResetPassword = async (userEmail) => {
    if (!confirm(`Send password reset email to ${userEmail}?`)) return;

    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, userEmail);
      setSnackbar({ open: true, message: `Password reset email sent to ${userEmail}`, severity: 'success' });
    } catch (error) {
      console.error('Error sending reset email:', error);
      setSnackbar({ open: true, message: 'Failed to send reset email: ' + error.message, severity: 'error' });
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const { id, createdAt, ...updateData } = locationForm;
      await updateDoc(doc(db, 'companies', companyId, 'locations', locationId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      setSnackbar({ open: true, message: 'Location updated successfully', severity: 'success' });
      setEditLocationDialogOpen(false);
    } catch (error) {
      console.error('Error updating location:', error);
      setSnackbar({ open: true, message: 'Failed to update location', severity: 'error' });
    }
  };

  if (!location) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ p: 3 }}>
          <Typography>Loading location...</Typography>
        </Box>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={2} 
          sx={{ mb: 3, width: '100%' }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <IconButton onClick={() => navigate('/crm/setup')} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <BusinessIcon sx={{ color: 'primary.main', fontSize: 40 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                {location.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {location.address && `${location.address}`}
                {location.city && `, ${location.city}`}
                {location.state && `, ${location.state}`}
                {location.zipCode && ` ${location.zipCode}`}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditLocationDialogOpen(true)}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Edit Location
          </Button>
        </Stack>

        {/* Main Card */}
        <Card elevation={6} sx={{ backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                px: 3,
                pt: 2,
                pb: 0,
                mb: 1,
                '& .MuiTab-root': { fontWeight: 600 },
                '& .MuiTabs-indicator': { height: 3 }
              }}
            >
              <Tab label="Overview" value="overview" />
              <Tab label="Users" value="users" />
              <Tab label="Integrations" value="integrations" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                        Location Details
                      </Typography>
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Location ID
                          </Typography>
                          <Typography sx={{ color: 'white' }}>
                            {location.locationId || 'Not set'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Phone
                          </Typography>
                          <Typography sx={{ color: 'white' }}>
                            {location.phone || 'Not set'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Manager
                          </Typography>
                          <Typography sx={{ color: 'white' }}>
                            {location.manager || 'Not assigned'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Status
                          </Typography>
                          <Chip
                            label={location.status || 'Active'}
                            color="success"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                        Quick Stats
                      </Typography>
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        <Box>
                          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {users.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Active Users
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            0
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Active Deals
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            0
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Inventory Items
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'stretch', sm: 'center' }} 
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Location Users
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddUserDialogOpen(true)}
                    sx={{ 
                      backgroundColor: '#4caf50', 
                      '&:hover': { backgroundColor: '#45a049' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Add User
                  </Button>
                </Stack>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                            {user.displayName || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role || 'sales'}
                              size="small"
                              color={user.role === 'admin' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.status === 'active' ? 'Active' : 'Inactive'}
                              size="small"
                              color={user.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleResetPassword(user.email)}
                                sx={{ color: '#90caf9' }}
                                title="Send password reset"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No users assigned to this location yet. Add your first user to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                  Location Integrations
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>WordPress Integration</Typography>
                    <WordPressIntegrationSetup
                      companyId={companyId}
                      locationId={locationId}
                      userProfile={userProfile}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Stripe Integration</Typography>
                    <StripeIntegrationSetup
                      companyId={companyId}
                      locationId={locationId}
                      userProfile={userProfile}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>QuickBooks Integration</Typography>
                    <QuickBooksIntegrationSetup
                      companyId={companyId}
                      locationId={locationId}
                      userProfile={userProfile}
                    />
                  </Box>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User to {location.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Full Name *"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
              <TextField
                select
                fullWidth
                label="Role *"
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="sales">Sales Representative</MenuItem>
                <MenuItem value="operations">Operations</MenuItem>
                <MenuItem value="general_manager">General Manager</MenuItem>
                <MenuItem value="leadership">Leadership</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </TextField>
              <Alert severity="info">
                A password reset email will be sent to the user so they can set their own password.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} variant="contained" color="primary">
              Create User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Location Dialog */}
        <Dialog
          open={editLocationDialogOpen}
          onClose={() => setEditLocationDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Location</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Location ID"
                  value={locationForm.locationId || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, locationId: e.target.value }))}
                />
                <TextField
                  fullWidth
                  required
                  label="Location Name"
                  value={locationForm.name || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, name: e.target.value }))}
                />
              </Stack>
              <TextField
                fullWidth
                label="Address"
                value={locationForm.address || ''}
                onChange={(e) => setLocationForm(f => ({ ...f, address: e.target.value }))}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={locationForm.city || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, city: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="State"
                  value={locationForm.state || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, state: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={locationForm.zipCode || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, zipCode: e.target.value }))}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={locationForm.phone || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, phone: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Manager"
                  value={locationForm.manager || ''}
                  onChange={(e) => setLocationForm(f => ({ ...f, manager: e.target.value }))}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditLocationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLocation} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

export default LocationPortal;

