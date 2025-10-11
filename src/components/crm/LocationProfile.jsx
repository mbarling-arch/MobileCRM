import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  PersonAdd as AddUserIcon,
  VpnKey as ResetPasswordIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import WordPressIntegrationSetup from './WordPressIntegrationSetup';
import StripeIntegrationSetup from './StripeIntegrationSetup';
import QuickBooksIntegrationSetup from './QuickBooksIntegrationSetup';

const LocationProfile = ({ location, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'sales' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location?.id) {
      loadLocationUsers();
    }
  }, [location?.id]);

  const loadLocationUsers = () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('locationId', '==', location.id));
    const unsub = onSnapshot(q, (snap) => {
      const userData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userData);
    });
    return unsub;
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const auth = getAuth();
      
      // Create Firebase Auth user
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, tempPassword);
      
      // Create user profile in Firestore
      await addDoc(collection(db, 'users'), {
        firebaseUid: userCredential.user.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        companyId: location.companyId,
        locationId: location.id,
        locationName: location.name,
        active: true,
        createdAt: serverTimestamp()
      });

      // Send password reset email so they can set their own password
      await sendPasswordResetEmail(auth, newUser.email);
      
      alert(`User created! A password reset email has been sent to ${newUser.email}`);
      setNewUser({ email: '', name: '', role: 'sales' });
      setAddUserDialogOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to create user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (userEmail) => {
    if (!confirm(`Send password reset email to ${userEmail}?`)) return;
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, userEmail);
      alert(`Password reset email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted. Note: Firebase Auth account still exists - delete manually if needed.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={onBack} size="small">
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
              {location.name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              {location.address || 'No address specified'}
            </Typography>
          </Box>
          <Chip label={location.active ? 'Active' : 'Inactive'} color={location.active ? 'success' : 'default'} />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            pt: 2,
            '& .MuiTab-root': { fontWeight: 600 },
            '& .MuiTabs-indicator': { height: 3 }
          }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Users" value="users" />
          <Tab label="WordPress" value="wordpress" />
          <Tab label="Stripe" value="stripe" />
          <Tab label="QuickBooks" value="quickbooks" />
        </Tabs>
        <Divider />

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <LocationOverview location={location} users={users} />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <LocationUsers
              location={location}
              users={users}
              onAddUser={() => setAddUserDialogOpen(true)}
              onResetPassword={handleResetPassword}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* WordPress Integration Tab */}
          {activeTab === 'wordpress' && (
            <WordPressIntegrationSetup
              companyId={location.companyId}
              locationId={location.id}
              userProfile={{ ...location }}
            />
          )}

          {/* Stripe Integration Tab */}
          {activeTab === 'stripe' && (
            <StripeIntegrationSetup
              companyId={location.companyId}
              locationId={location.id}
              userProfile={{ ...location }}
            />
          )}

          {/* QuickBooks Integration Tab */}
          {activeTab === 'quickbooks' && (
            <QuickBooksIntegrationSetup
              companyId={location.companyId}
              locationId={location.id}
              userProfile={{ ...location }}
            />
          )}
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            Add User to {location.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              label="Full Name *"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email Address *"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Role *"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              fullWidth
            >
              <MenuItem value="sales">Sales Representative</MenuItem>
              <MenuItem value="manager">Sales Manager</MenuItem>
              <MenuItem value="admin">Location Admin</MenuItem>
            </TextField>

            <Alert severity="info">
              A temporary password will be generated and a password reset email will be sent to the user.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? 'Creating User...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Location Overview Component
function LocationOverview({ location, users }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Paper sx={{ p: 3, flex: 1, backgroundColor: 'action.hover' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
            Active Users
          </Typography>
          <Typography sx={{ color: 'text.primary', fontSize: 32, fontWeight: 700 }}>
            {users.filter(u => u.active).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, backgroundColor: 'action.hover' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
            Total Leads
          </Typography>
          <Typography sx={{ color: 'text.primary', fontSize: 32, fontWeight: 700 }}>
            0
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, backgroundColor: 'action.hover' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
            Active Deals
          </Typography>
          <Typography sx={{ color: 'text.primary', fontSize: 32, fontWeight: 700 }}>
            0
          </Typography>
        </Paper>
      </Box>

      {/* Location Details */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Location Details
        </Typography>
        <Stack spacing={2}>
          <DetailRow label="Location ID" value={location.id} />
          <DetailRow label="Company ID" value={location.companyId} />
          <DetailRow label="Address" value={location.address || 'Not set'} />
          <DetailRow label="Phone" value={location.phone || 'Not set'} />
          <DetailRow label="Email" value={location.email || 'Not set'} />
          <DetailRow label="Created" value={location.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'} />
        </Stack>
      </Paper>
    </Box>
  );
}

// Location Users Component
function LocationUsers({ location, users, onAddUser, onResetPassword, onDeleteUser }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
          Location Users
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAddUser}
          startIcon={<AddUserIcon />}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                    {user.name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontSize: 14 }}>
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role || 'sales'} 
                      size="small" 
                      color={user.role === 'admin' ? 'primary' : user.role === 'manager' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={user.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => onResetPassword(user.email)}
                        title="Send password reset email"
                      >
                        <ResetPasswordIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteUser(user.id, user.email)}
                        title="Delete user"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.disabled', py: 6, fontStyle: 'italic' }}>
                    No users assigned to this location yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// Detail Row Component
function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{label}:</Typography>
      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

export default LocationProfile;

