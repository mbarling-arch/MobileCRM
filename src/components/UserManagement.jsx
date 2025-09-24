import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  Add as AddIcon,
  AccountBalance as CompaniesIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as AdminIcon,
  Leaderboard as LeadershipIcon,
  Store as GeneralManagerIcon,
  ShoppingCart as SalesIcon,
  Engineering as OperationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDoc
} from 'firebase/firestore';

const drawerWidth = 240;

const ROLES = [
  { value: 'admin', label: 'Admin', icon: AdminIcon, color: 'error' },
  { value: 'leadership', label: 'Leadership', icon: LeadershipIcon, color: 'warning' },
  { value: 'general_manager', label: 'General Manager', icon: GeneralManagerIcon, color: 'info' },
  { value: 'sales', label: 'Sales', icon: SalesIcon, color: 'success' },
  { value: 'operations', label: 'Operations', icon: OperationsIcon, color: 'secondary' },
];

function UserManagement() {
  const { logout, currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { userPermissions, accessibleCompanies, accessibleLocations } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyId: '',
    locationId: '',
    role: '',
    status: 'pending'
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [alert, setAlert] = useState(null);

  // Fetch companies (filtered by user permissions)
  useEffect(() => {
    if (!userPermissions) return;

    const unsubscribe = onSnapshot(collection(db, 'companies'), (snapshot) => {
      let companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter companies based on user permissions
      if (!userPermissions.canViewAllCompanies) {
        companiesData = companiesData.filter(company =>
          accessibleCompanies.some(accCompany => accCompany.id === company.id)
        );
      }

      setCompanies(companiesData);
    });

    return unsubscribe;
  }, [userPermissions, accessibleCompanies]);

  // Fetch locations when company is selected
  useEffect(() => {
    if (!selectedCompanyId) {
      setLocations([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'companies', selectedCompanyId, 'locations'),
      (snapshot) => {
        const locationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLocations(locationsData);
      }
    );

    return unsubscribe;
  }, [selectedCompanyId]);

  // Fetch users from accessible companies and locations
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userPermissions) return;

      try {
        const usersData = [];

        // Get accessible companies
        let accessibleCompanyIds = companies.map(c => c.id);

        if (!userPermissions.canViewAllCompanies && accessibleCompanies.length > 0) {
          accessibleCompanyIds = accessibleCompanies.map(c => c.id);
        }

        for (const companyId of accessibleCompanyIds) {
          // Get locations for this company
          const locationsSnapshot = await getDocs(collection(db, 'companies', companyId, 'locations'));
          const companyData = companies.find(c => c.id === companyId);

          for (const locationDoc of locationsSnapshot.docs) {
            const locationId = locationDoc.id;

            // Check if user can access this location
            const canAccessThisLocation = userPermissions.canViewAllLocations ||
              accessibleLocations.some(loc => loc.id === locationId);

            if (!canAccessThisLocation) continue;

            // Get users for this location
            const usersSnapshot = await getDocs(collection(db, 'companies', companyId, 'locations', locationId, 'users'));

            usersSnapshot.docs.forEach(userDoc => {
              usersData.push({
                id: userDoc.id,
                companyId,
                locationId,
                company: companyData,
                location: locationDoc.data(),
                ...userDoc.data()
              });
            });
          }
        }

        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    if (companies.length > 0 && userPermissions) {
      fetchUsers();
    }
  }, [companies, userPermissions, accessibleCompanies, accessibleLocations]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleClickOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        companyId: user.companyId || '',
        locationId: user.locationId || '',
        role: user.role || '',
        status: user.status || 'pending'
      });
      setSelectedCompanyId(user.companyId || '');
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        companyId: '',
        locationId: '',
        role: '',
        status: 'pending'
      });
      setSelectedCompanyId('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      companyId: '',
      locationId: '',
      role: '',
      status: 'pending'
    });
    setSelectedCompanyId('');
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.email || !formData.companyId || !formData.locationId || !formData.role) {
        showAlert('Please fill in all required fields', 'error');
        return;
      }

      // Check if user with this email already exists
      const existingUser = users.find(u => u.email === formData.email && u.id !== editingUser?.id);
      if (existingUser) {
        showAlert('A user with this email already exists', 'error');
        return;
      }

      const userData = {
        ...formData,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        createdAt: new Date(),
        createdBy: currentUser.uid,
        updatedAt: new Date()
      };

      if (editingUser) {
        // Check if company/location changed
        if (editingUser.companyId !== formData.companyId || editingUser.locationId !== formData.locationId) {
          // Delete from old location
          await deleteDoc(doc(db, 'companies', editingUser.companyId, 'locations', editingUser.locationId, 'users', editingUser.id));
          // Add to new location
          await addDoc(collection(db, 'companies', formData.companyId, 'locations', formData.locationId, 'users'), userData);
        } else {
          // Update in same location
          await updateDoc(doc(db, 'companies', formData.companyId, 'locations', formData.locationId, 'users', editingUser.id), userData);
        }
        showAlert('User updated successfully');
      } else {
        // Add new user
        await addDoc(collection(db, 'companies', formData.companyId, 'locations', formData.locationId, 'users'), userData);
        showAlert('User added successfully');
      }
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
      showAlert('Error saving user', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'companies', user.companyId, 'locations', user.locationId, 'users', user.id));
        showAlert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user', 'error');
      }
    }
  };

  const getRoleInfo = (roleValue) => {
    return ROLES.find(role => role.value === roleValue) || ROLES[3]; // Default to sales
  };

  const getRoleIcon = (roleValue) => {
    const role = getRoleInfo(roleValue);
    const IconComponent = role.icon;
    return <IconComponent sx={{ fontSize: 16 }} />;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Mobile CRM
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            Welcome, {currentUser?.email?.split('@')[0]}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List sx={{ pt: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={false}
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={false}
                onClick={() => navigate('/companies')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <CompaniesIcon />
                </ListItemIcon>
                <ListItemText primary="Companies" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={true}
                onClick={() => navigate('/users')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={false}
                onClick={() => navigate('/reports')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <ReportsIcon />
                </ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={false}
                onClick={() => navigate('/settings')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 3 }}>
              {alert.message}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            {userPermissions?.canManageUsers && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleClickOpen()}
                sx={{ borderRadius: 2 }}
              >
                Add User
              </Button>
            )}
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {companies.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Companies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <LocationIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {locations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Locations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <AdminIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {users.filter(u => u.role === 'admin').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Users Table */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {user.displayName || `${user.firstName} ${user.lastName}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.company?.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.location?.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={getRoleInfo(user.role).label}
                            size="small"
                            color={getRoleInfo(user.role).color}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status || 'pending'}
                            size="small"
                            color={user.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {userPermissions?.canManageUsers && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleClickOpen(user)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(user)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                          <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No users yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add your first user to get started
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email *"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            variant="outlined"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            variant="outlined"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Company *</InputLabel>
            <Select
              value={formData.companyId}
              label="Company *"
              onChange={(e) => {
                setFormData({ ...formData, companyId: e.target.value, locationId: '' });
                setSelectedCompanyId(e.target.value);
              }}
              required
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!formData.companyId}>
            <InputLabel>Location *</InputLabel>
            <Select
              value={formData.locationId}
              label="Location *"
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              required
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role *</InputLabel>
            <Select
              value={formData.role}
              label="Role *"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                return (
                  <MenuItem key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconComponent sx={{ mr: 1, fontSize: 18 }} />
                      {role.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      {userPermissions?.canManageUsers && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => handleClickOpen()}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}

export default UserManagement;
