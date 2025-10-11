import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import WordPressIntegrationSetup from './WordPressIntegrationSetup';
import StripeIntegrationSetup from './StripeIntegrationSetup';
import QuickBooksIntegrationSetup from './QuickBooksIntegrationSetup';
import SetupImportExport from './SetupImportExport';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ROLES, ROLE_PERMISSIONS } from '../../redux-store/slices/userSlice';
import { CRM_NAV_ITEMS } from '../navigationConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';

function Setup() {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('locations');
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [locationForm, setLocationForm] = useState({
    locationId: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    manager: ''
  });
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'sales', locationId: '', password: '' });
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    pages: []
  });
  const [migrating, setMigrating] = useState(false);

  const companyId = userProfile?.companyId || 'demo-company';

  // Available CRM pages for role permissions
  const availablePages = CRM_NAV_ITEMS.map(item => ({
    id: item.id,
    label: item.label,
    path: item.path
  }));

  // Load locations
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'locations');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocations(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load custom roles
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'roles');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRoles(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load all users across all locations
  useEffect(() => {
    if (locations.length === 0) return;

    const allUsers = [];
    const unsubscribes = [];

    locations.forEach(location => {
      const usersRef = collection(db, 'companies', companyId, 'locations', location.id, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        const locationUsers = snap.docs.map(d => ({
          id: d.id,
          locationId: location.id,
          locationName: location.name,
          ...d.data()
        }));
        
        // Update users array
        setUsers(prevUsers => {
          const filtered = prevUsers.filter(u => u.locationId !== location.id);
          return [...filtered, ...locationUsers];
        });
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [companyId, locations]);

  const handleAddLocation = () => {
    setEditLocation(null);
    setLocationForm({
      locationId: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      manager: ''
    });
    setAddLocationOpen(true);
  };

  const handleEditLocation = (location) => {
    setEditLocation(location);
    setLocationForm({
      locationId: location.locationId || '',
      name: location.name || '',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      zipCode: location.zipCode || '',
      phone: location.phone || '',
      manager: location.manager || ''
    });
    setAddLocationOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!locationForm.name.trim()) {
      setSnackbar({ open: true, message: 'Location name is required', severity: 'error' });
      return;
    }

    try {
      if (editLocation) {
        await updateDoc(doc(db, 'companies', companyId, 'locations', editLocation.id), {
          ...locationForm,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Location updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'companies', companyId, 'locations'), {
          ...locationForm,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Location added successfully', severity: 'success' });
      }
      setAddLocationOpen(false);
    } catch (error) {
      console.error('Error saving location:', error);
      setSnackbar({ open: true, message: 'Failed to save location', severity: 'error' });
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('Are you sure you want to delete this location? This cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'companies', companyId, 'locations', locationId));
      setSnackbar({ open: true, message: 'Location deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting location:', error);
      setSnackbar({ open: true, message: 'Failed to delete location', severity: 'error' });
    }
  };

  const handleOpenLocation = (locationId) => {
    navigate(`/crm/locations/${locationId}`);
  };

  const handleAddUser = async () => {
    const [firstName = '', lastName = ''] = (newUser.name || '').trim().split(/\s+/, 2);
    if (!firstName || !lastName || !newUser.email || !newUser.locationId || !newUser.role || !newUser.password) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    if (newUser.password.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters long', severity: 'error' });
      return;
    }

    try {
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

      const userData = {
        firebaseUid: userCredential.user.uid,
        email: newUser.email,
        displayName: `${firstName} ${lastName}`.trim(),
        name: `${firstName} ${lastName}`.trim(),
        firstName: firstName,
        lastName: lastName,
        role: newUser.role,
        companyId: companyId,
        locationId: newUser.locationId,
        status: 'active',
        createdAt: serverTimestamp()
      };

      // Create user in location-specific path
      await addDoc(collection(db, 'companies', companyId, 'locations', newUser.locationId, 'users'), userData);

      // Also create in top-level users collection for global access (e.g., calendar across locations)
      await doc(db, 'users', userCredential.user.uid);
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      setSnackbar({ open: true, message: `User ${newUser.email} created successfully`, severity: 'success' });
      setAddUserDialogOpen(false);
      setNewUser({ email: '', name: '', role: 'sales', locationId: '', password: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({ open: true, message: 'Failed to create user: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteUser = async (userId, userEmail, locationId) => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return;

    try {
      // Get the user's firebaseUid before deleting
      const userDocRef = doc(db, 'companies', companyId, 'locations', locationId, 'users', userId);
      const { getDoc } = await import('firebase/firestore');
      const userDocSnap = await getDoc(userDocRef);
      const firebaseUid = userDocSnap.data()?.firebaseUid;

      // Delete from location-specific path
      await deleteDoc(userDocRef);

      // Also delete from top-level users collection if firebaseUid exists
      if (firebaseUid) {
        await deleteDoc(doc(db, 'users', firebaseUid));
      }

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

  const handleAddRole = () => {
    setEditRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      pages: []
    });
    setAddRoleDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditRole(role);
    setRoleForm({
      name: role.name || '',
      displayName: role.displayName || '',
      description: role.description || '',
      pages: role.pages || []
    });
    setAddRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim() || !roleForm.displayName.trim()) {
      setSnackbar({ open: true, message: 'Role name and display name are required', severity: 'error' });
      return;
    }

    if (roleForm.pages.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one page permission', severity: 'error' });
      return;
    }

    try {
      const roleData = {
        name: roleForm.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: roleForm.displayName,
        description: roleForm.description,
        pages: roleForm.pages,
        isCustomRole: true
      };

      if (editRole) {
        await updateDoc(doc(db, 'companies', companyId, 'roles', editRole.id), {
          ...roleData,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Role updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'companies', companyId, 'roles'), {
          ...roleData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Role created successfully', severity: 'success' });
      }
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
      setSnackbar({ open: true, message: 'Failed to save role', severity: 'error' });
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!confirm(`Delete role "${roleName}"? This cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, 'companies', companyId, 'roles', roleId));
      setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting role:', error);
      setSnackbar({ open: true, message: 'Failed to delete role', severity: 'error' });
    }
  };

  const handleTogglePage = (pageId) => {
    setRoleForm(prev => ({
      ...prev,
      pages: prev.pages.includes(pageId)
        ? prev.pages.filter(p => p !== pageId)
        : [...prev.pages, pageId]
    }));
  };

  const handleMigrateUsers = async () => {
    if (!confirm('This will sync all existing users to enable calendar and team features. Continue?')) {
      return;
    }

    setMigrating(true);
    try {
      const { migrateUsersToTopLevel } = await import('../../utils/migrateUsers');
      const result = await migrateUsersToTopLevel();
      
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: `Migration complete! Synced ${result.migratedCount} users.`, 
          severity: 'success' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: `Migration failed: ${result.error}`, 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Migration failed: ' + error.message, 
        severity: 'error' 
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <UnifiedLayout mode="crm">
    <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>CRM Setup & Administration</Typography>
          <Stack direction="row" spacing={1}>
            {(activeTab === 'locations' || activeTab === 'roles' || activeTab === 'users') && (
              <Button
                variant="outlined"
                onClick={() => setImportExportOpen(true)}
                sx={{ borderColor: 'primary.main', color: 'primary.main' }}
              >
                Import/Export
              </Button>
            )}
            {activeTab === 'locations' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLocation}
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                Add Location
              </Button>
            )}
            {activeTab === 'users' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddUserDialogOpen(true)}
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                Add User
              </Button>
            )}
            {activeTab === 'roles' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRole}
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                Add Role
              </Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': { color: 'primary.main' }
                }
              }}
            >
              <Tab label="Locations" value="locations" />
              <Tab label="Users" value="users" />
              <Tab label="Roles & Permissions" value="roles" />
              <Tab label="Integrations" value="integrations" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {/* Locations Tab */}
              {activeTab === 'locations' && (
                <LocationsTable
                locations={locations}
                  onOpenLocation={handleOpenLocation}
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
                />
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <>
                  {users.length > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Sync Users for Calendar & Team Features</Typography>
                          <Typography variant="body2">
                            If users aren't showing in the calendar or team member section, click here to sync them.
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          onClick={handleMigrateUsers}
                          disabled={migrating}
                          sx={{ ml: 2, minWidth: 120 }}
                        >
                          {migrating ? 'Syncing...' : 'Sync Users'}
                        </Button>
                      </Stack>
                    </Alert>
                  )}
                  <UsersTable
                    users={users}
                    locations={locations}
                    onResetPassword={handleResetPassword}
                    onDelete={handleDeleteUser}
                  />
                </>
              )}

              {/* Roles & Permissions Tab */}
              {activeTab === 'roles' && (
                <RolesTable
                  roles={roles}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <IntegrationsTab companyId={companyId} userProfile={userProfile} />
              )}
    </Box>
          </CardContent>
        </Card>

        {/* Add Location Dialog */}
        <Dialog open={addLocationOpen} onClose={() => setAddLocationOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editLocation ? 'Edit Location' : 'Add New Location'}
      </DialogTitle>
      <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
                  label="Location ID (Optional)"
                  value={locationForm.locationId}
                  onChange={(e) => setLocationForm({ ...locationForm, locationId: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Location Name"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
            />
          </Stack>

          <TextField
            fullWidth
                label="Street Address"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="City"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
            />
            <TextField
              fullWidth
              label="State"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
            />
            <TextField
              fullWidth
              label="ZIP Code"
                  value={locationForm.zipCode}
                  onChange={(e) => setLocationForm({ ...locationForm, zipCode: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
                  label="Phone Number"
                  value={locationForm.phone}
                  onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
                  label="Manager Name"
                  value={locationForm.manager}
                  onChange={(e) => setLocationForm({ ...locationForm, manager: e.target.value })}
            />
          </Stack>
        </Stack>
      </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddLocationOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLocation} variant="contained" color="primary">
              {editLocation ? 'Save Changes' : 'Add Location'}
        </Button>
      </DialogActions>
    </Dialog>
        
        {/* Import/Export Dialog */}
        <SetupImportExport
          open={importExportOpen}
          onClose={() => setImportExportOpen(false)}
          type={activeTab}
                companyId={companyId}
          locations={locations}
          data={activeTab === 'locations' ? locations : activeTab === 'users' ? users : roles}
          onImportComplete={() => {
            setSnackbar({ open: true, message: `${activeTab} imported successfully!`, severity: 'success' });
          }}
        />
        
        {/* Add User Dialog */}
        <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="First Name *"
                value={newUser.name?.split(' ')[0] || ''}
                onChange={(e) => {
                  const lastName = newUser.name?.split(' ').slice(1).join(' ') || '';
                  setNewUser(prev => ({ ...prev, name: `${e.target.value} ${lastName}`.trim() }));
                }}
              />
              <TextField
                fullWidth
                label="Last Name *"
                value={newUser.name?.split(' ').slice(1).join(' ') || ''}
                onChange={(e) => {
                  const firstName = newUser.name?.split(' ')[0] || '';
                  setNewUser(prev => ({ ...prev, name: `${firstName} ${e.target.value}`.trim() }));
                }}
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
                label="Location *"
                value={newUser.locationId}
                onChange={(e) => setNewUser(prev => ({ ...prev, locationId: e.target.value }))}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                ))}
              </TextField>
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
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                helperText="Minimum 6 characters"
              />
              <Alert severity="info">
                Passwords are stored securely in Firebase Authentication. Share credentials manually with your users.
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

        {/* Add Role Dialog */}
        <Dialog open={addRoleDialogOpen} onClose={() => setAddRoleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editRole ? 'Edit Role' : 'Create New Role'}
      </DialogTitle>
      <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
          <TextField
            fullWidth
            required
                label="Role Name"
                placeholder="e.g., sales_rep"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                helperText="This will be the internal identifier (lowercase, underscores only)"
              />
              <TextField
                fullWidth
                required
                label="Display Name"
                placeholder="e.g., Sales Representative"
                value={roleForm.displayName}
                onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                helperText="This is what users will see"
              />
          <TextField
            fullWidth
            multiline
                rows={2}
            label="Description"
                placeholder="Brief description of this role's responsibilities"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />

          <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Page Access Permissions
            </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select which CRM pages users with this role can access:
                </Typography>
                
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Stack spacing={1}>
                    {availablePages.map((page) => (
                      <Box
                        key={page.id}
                sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: roleForm.pages.includes(page.id) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          border: '1px solid',
                          borderColor: roleForm.pages.includes(page.id) ? 'primary.main' : 'rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => handleTogglePage(page.id)}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography sx={{ fontWeight: roleForm.pages.includes(page.id) ? 600 : 400 }}>
                            {page.label}
                  </Typography>
                          {roleForm.pages.includes(page.id) && (
                            <Chip label="Allowed" size="small" color="primary" />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {page.path}
                </Typography>
              </Box>
                    ))}
                  </Stack>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {roleForm.pages.length} of {availablePages.length} pages selected
                </Typography>
          </Box>
        </Stack>
      </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} variant="contained" color="primary">
              {editRole ? 'Save Changes' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

// Locations Table Component
function LocationsTable({ locations, onOpenLocation, onEdit, onDelete }) {
  return (
      <TableContainer>
      <Table
                    size="small"
        sx={{
          '& thead th': {
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            borderBottomColor: 'rgba(255,255,255,0.08)'
          },
          '& tbody td': {
            color: 'rgba(255,255,255,0.92)',
            borderBottomColor: 'rgba(255,255,255,0.06)'
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)'
          }
        }}
      >
          <TableHead>
            <TableRow>
            <TableCell>Location Name</TableCell>
            <TableCell>Location ID</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id} hover>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography sx={{ color: 'white', fontWeight: 600 }}>
                    {location.name}
                  </Typography>
                </Stack>
                      </TableCell>
              <TableCell>{location.locationId || '-'}</TableCell>
                      <TableCell>
                {location.address && `${location.address}, `}
                {location.city && `${location.city}`}
                  {location.state && `, ${location.state}`}
                  {location.zipCode && ` ${location.zipCode}`}
                {!location.address && !location.city && '-'}
                </TableCell>
              <TableCell>{location.phone || '-'}</TableCell>
              <TableCell>{location.manager || '-'}</TableCell>
                <TableCell>
                <Chip
                  label={location.status || 'active'}
                          size="small"
                  color={location.status === 'active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                    endIcon={<ChevronRightIcon />}
                    onClick={() => onOpenLocation(location.id)}
                    sx={{ minWidth: 100 }}
                    >
                    Open
                    </Button>
                    <IconButton size="small" onClick={() => onEdit(location)} sx={{ color: '#90caf9' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(location.id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {locations.length === 0 && (
              <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <BusinessIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  No locations configured yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Click "Add Location" to create your first dealership location
                </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  );
}

// Users Table Component
function UsersTable({ users, locations, onResetPassword, onDelete }) {
  return (
      <TableContainer>
      <Table
        size="small"
        sx={{
          '& thead th': {
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            borderBottomColor: 'rgba(255,255,255,0.08)'
          },
          '& tbody td': {
            color: 'rgba(255,255,255,0.92)',
            borderBottomColor: 'rgba(255,255,255,0.06)'
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)'
          }
        }}
      >
          <TableHead>
            <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {users.map((user) => {
            const firstName = user.displayName?.split(' ')[0] || '';
            const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
            
            return (
              <TableRow key={`${user.locationId}-${user.id}`} hover>
                <TableCell>
                  <Chip
                    label={user.locationName || 'Unknown'}
                    size="small"
                    icon={<LocationIcon />}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: 'white', fontWeight: 600 }}>
                    {firstName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: 'white', fontWeight: 600 }}>
                    {lastName}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role || 'sales'}
                    size="small"
                    color={user.role === 'admin' ? 'primary' : user.role === 'leadership' ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status === 'active' ? 'Active' : 'Inactive'}
                    size="small"
                    color={user.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => onResetPassword(user.email)}
                      sx={{ color: '#90caf9' }}
                      title="Send password reset"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(user.id, user.email, user.locationId)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
              <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <PersonIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  No users found
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Add locations first, then add users to each location
                </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  );
}

// Roles & Permissions Table Component
function RolesTable({ roles, onEdit, onDelete }) {
  // Default/Built-in roles
  const defaultRoles = [
    { id: 'admin', name: 'admin', displayName: 'Administrator', description: 'Full system access', pages: CRM_NAV_ITEMS.map(i => i.id), isDefault: true },
    { id: 'leadership', name: 'leadership', displayName: 'Leadership', description: 'Leadership level access', pages: CRM_NAV_ITEMS.map(i => i.id), isDefault: true },
    { id: 'general_manager', name: 'general_manager', displayName: 'General Manager', description: 'Location management access', pages: CRM_NAV_ITEMS.filter(i => i.id !== 'setup').map(i => i.id), isDefault: true },
    { id: 'sales', name: 'sales', displayName: 'Sales Representative', description: 'Standard sales access', pages: CRM_NAV_ITEMS.filter(i => !['setup', 'components', 'master-pricing'].includes(i.id)).map(i => i.id), isDefault: true },
    { id: 'operations', name: 'operations', displayName: 'Operations', description: 'Operations access', pages: CRM_NAV_ITEMS.filter(i => !['setup', 'components', 'master-pricing'].includes(i.id)).map(i => i.id), isDefault: true }
  ];

  const allRoles = [...defaultRoles, ...roles];

  return (
      <TableContainer>
      <Table
        size="small"
        sx={{
          '& thead th': {
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            borderBottomColor: 'rgba(255,255,255,0.08)'
          },
          '& tbody td': {
            color: 'rgba(255,255,255,0.92)',
            borderBottomColor: 'rgba(255,255,255,0.06)'
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)'
          }
        }}
      >
          <TableHead>
            <TableRow>
            <TableCell>Role Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Page Access</TableCell>
            <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {allRoles.map((role) => (
            <TableRow key={role.id} hover>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: role.isDefault ? 'primary.main' : 'secondary.main', width: 40, height: 40 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                      {role.displayName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {role.name}
                    </Typography>
                  </Box>
                </Stack>
                </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {role.description || '-'}
                </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                  label={role.isDefault ? 'Built-in' : 'Custom'}
                    size="small"
                  color={role.isDefault ? 'default' : 'secondary'}
                  variant={role.isDefault ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ maxWidth: 400 }}>
                  {role.pages.slice(0, 3).map((pageId) => {
                    const page = CRM_NAV_ITEMS.find(p => p.id === pageId);
                    return page ? (
                      <Chip
                        key={pageId}
                        label={page.label}
                        size="small"
                        sx={{ fontSize: '0.7rem', mb: 0.5 }}
                      />
                    ) : null;
                  })}
                  {role.pages.length > 3 && (
                    <Chip
                      label={`+${role.pages.length - 3} more`}
                      size="small"
                      sx={{ fontSize: '0.7rem', mb: 0.5 }}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </TableCell>
              <TableCell align="right">
                {!role.isDefault && (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(role)}
                      sx={{ color: '#90caf9' }}
                      title="Edit role"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(role.id, role.displayName)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
                {role.isDefault && (
                  <Chip label="System Role" size="small" variant="outlined" disabled />
                )}
                </TableCell>
              </TableRow>
            ))}
          {allRoles.length === 0 && (
              <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  No custom roles found
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Click "Add Role" to create your first custom role
                </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  );
}

// Integrations Tab Component
function IntegrationsTab({ companyId, userProfile }) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        These are company-wide integrations. For location-specific integrations, open a location and configure them in the location portal.
      </Alert>
      
      <Stack spacing={4}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LinkIcon />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              WordPress Integration
            </Typography>
          </Stack>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <WordPressIntegrationSetup companyId={companyId} userProfile={userProfile} />
          </Paper>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

          <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <LinkIcon />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Stripe Integration
            </Typography>
        </Stack>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <StripeIntegrationSetup companyId={companyId} userProfile={userProfile} />
          </Paper>
        </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main' }}>
              <LinkIcon />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              QuickBooks Integration
          </Typography>
          </Stack>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <QuickBooksIntegrationSetup companyId={companyId} userProfile={userProfile} />
          </Paper>
            </Box>
        </Stack>
    </Box>
  );
}

export default Setup;
