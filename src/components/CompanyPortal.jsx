import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Alert,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOn,
  AdminPanelSettings as AdminIcon,
  Leaderboard as LeadershipIcon,
  Store as GeneralManagerIcon,
  ShoppingCart as SalesIcon,
  Engineering as OperationsIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useUser } from '../UserContext';
import { db, auth } from '../firebase';
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
import {
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword
} from 'firebase/auth';

import Layout from './Layout';
import Panel from './ui/Panel';
import DataTable from './ui/DataTable';

const ROLES = [
  { value: 'admin', label: 'Admin', icon: AdminIcon, color: 'error' },
  { value: 'leadership', label: 'Leadership', icon: LeadershipIcon, color: 'warning' },
  { value: 'general_manager', label: 'General Manager', icon: GeneralManagerIcon, color: 'info' },
  { value: 'sales', label: 'Sales', icon: SalesIcon, color: 'success' },
  { value: 'operations', label: 'Operations', icon: OperationsIcon, color: 'secondary' },
];

// Reusable Components
const PageHeader = ({ title, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <Typography variant="h5" className="font-semibold">{title}</Typography>
    {action}
  </div>
);

// legacy DataTable removed in favor of shared ui/DataTable

// Tab Components
const LocationsTab = ({ locations, onAdd, onEdit, onDelete, userPermissions }) => (
  <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
    <PageHeader
      title="Locations"
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} className="rounded-lg">
          Add Location
        </Button>
      }
    />
    <DataTable
      headers={['ID', 'Name', 'Address', 'Contact', 'Actions']}
      data={locations.map(location => ({
        cells: [
          <Typography key="id" variant="body2" className="font-mono font-medium text-blue-600">
            {location.locationId || 'N/A'}
          </Typography>,
          <Typography key="name" variant="body1" className="font-medium">{location.name}</Typography>,
          <Typography key="address" variant="body2" className="text-gray-600">
            {location.address}
            {location.city && `, ${location.city}`}
            {location.state && `, ${location.state}`}
            {location.zipCode && ` ${location.zipCode}`}
          </Typography>,
          <div key="contact">
            <Typography variant="body2">{location.phone}</Typography>
            {location.manager && (
              <Typography variant="body2" className="text-gray-500">
                Manager: {location.manager}
              </Typography>
            )}
          </div>
        ]
      }))}
      actions={(row, idx) => (
        <div className="flex gap-1">
          <IconButton size="small" onClick={() => onEdit(locations[idx])}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(locations[idx].id)} color="error">
            <DeleteIcon />
          </IconButton>
        </div>
      )}
      emptyState={
        <div className="text-center">
          <LocationOn className="text-6xl text-gray-400 mb-4 mx-auto" />
          <Typography variant="h6" className="text-gray-500 mb-2">No locations yet</Typography>
          <Typography variant="body2" className="text-gray-500">Add your first location to get started</Typography>
        </div>
      }
    />
  </div>
);

const UsersTab = ({ users, onAdd, onEdit, onDelete, userPermissions }) => (
  <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
    <PageHeader
      title="Users"
      action={
        userPermissions?.canManageUsers && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} className="rounded-lg">
            Add User
          </Button>
        )
      }
    />
    <DataTable
      headers={['User', 'Location', 'Role', 'Status', 'Actions']}
      data={users.map(user => ({
        cells: [
          <div key="user" className="flex items-center">
            <Avatar className="mr-3 bg-blue-500">
              {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Typography variant="body1" className="font-medium">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </Typography>
              <Typography variant="body2" className="text-gray-600">{user.email}</Typography>
            </div>
          </div>,
          <Typography key="location" variant="body2">{user.location?.name}</Typography>,
          <Chip
            key="role"
            icon={ROLES.find(r => r.value === user.role)?.icon && React.createElement(ROLES.find(r => r.value === user.role).icon, { sx: { fontSize: 16 } })}
            label={ROLES.find(r => r.value === user.role)?.label || 'Unknown'}
            size="small"
            color={ROLES.find(r => r.value === user.role)?.color || 'default'}
            variant="outlined"
          />,
          <Chip key="status" label={user.status || 'pending'} size="small" color={user.status === 'active' ? 'success' : 'default'} />
        ]
      }))}
      actions={(row, idx) => (
        userPermissions?.canManageUsers && (
          <div className="flex gap-1">
            <IconButton size="small" onClick={() => onEdit(users[idx])}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(users[idx])} color="error">
              <DeleteIcon />
            </IconButton>
          </div>
        )
      )}
      emptyState={
        <div className="text-center">
          <PeopleIcon className="text-6xl text-gray-400 mb-4 mx-auto" />
          <Typography variant="h6" className="text-gray-500 mb-2">No users yet</Typography>
          <Typography variant="body2" className="text-gray-500">Add your first user to get started</Typography>
        </div>
      }
    />
  </div>
);

const SettingsTab = ({ company, locations, users }) => (
  <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 space-y-8">
    <Typography variant="h5" className="font-semibold">Company Settings</Typography>

    {/* Company Information */}
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-6">
        <Typography variant="h6" className="font-semibold mb-6">Company Information</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField fullWidth label="Company Name" value={company.name || ''} InputProps={{ readOnly: true }} className="bg-gray-50" />
          <TextField fullWidth label="Industry" value={company.industry || ''} InputProps={{ readOnly: true }} className="bg-gray-50" />
          <TextField fullWidth label="Email" value={company.email || ''} InputProps={{ readOnly: true }} className="bg-gray-50" />
          <TextField fullWidth label="Phone" value={company.phone || ''} InputProps={{ readOnly: true }} className="bg-gray-50" />
        </div>
      </CardContent>
    </Card>

    {/* Statistics */}
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-6">
        <Typography variant="h6" className="font-semibold mb-6">Statistics</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center">
              <Typography variant="h3" className="text-3xl font-bold text-blue-600 mb-2">{locations.length}</Typography>
              <Typography variant="body2" className="text-gray-600 font-medium">Locations</Typography>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center">
              <Typography variant="h3" className="text-3xl font-bold text-green-600 mb-2">{users.length}</Typography>
              <Typography variant="body2" className="text-gray-600 font-medium">Users</Typography>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center">
              <Typography variant="h3" className="text-3xl font-bold text-orange-600 mb-2">{users.filter(u => u.role === 'admin').length}</Typography>
              <Typography variant="body2" className="text-gray-600 font-medium">Admins</Typography>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
);

function CompanyPortal() {
  const { companyId } = useParams();
  const { currentUser } = useAuth();
  const { userPermissions, accessibleCompanies } = useUser();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Data states
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);

  // Dialog states
  const [locationOpen, setLocationOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', email: '', phone: '' });

  // Form states
  const [locationFormData, setLocationFormData] = useState({
    locationId: '', name: '', address: '', city: '', state: '', zipCode: '', phone: '', manager: ''
  });
  const [userFormData, setUserFormData] = useState({
    email: '', firstName: '', lastName: '', password: '', locationId: '', role: '', status: 'active'
  });

  // Load company data
  useEffect(() => {
    if (!companyId) return;
    try {
      const unsubscribe = onSnapshot(
        doc(db, 'companies', companyId),
        (d) => {
          if (d.exists()) {
            setCompany({ id: d.id, ...d.data() });
          } else {
            navigate('/companies');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error loading company:', error);
          setLoading(false);
          navigate('/companies');
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing company listener:', error);
      setLoading(false);
      navigate('/companies');
    }
  }, [companyId, navigate]);

  // Load locations and users
  useEffect(() => {
    if (!companyId) return;

    let unsubscribeLocations = null;
    let unsubscribeUsers = [];

    const setupListeners = async () => {
      try {
        // Set up locations listener
        unsubscribeLocations = onSnapshot(
          collection(db, 'companies', companyId, 'locations'),
          async (locationsSnapshot) => {
            setLocations(locationsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

            // Clean up existing user listeners
            unsubscribeUsers.forEach(unsubscribe => unsubscribe());
            unsubscribeUsers = [];

            // Set up user listeners for each location
            for (const locationDoc of locationsSnapshot.docs) {
              const unsubscribeUser = onSnapshot(
                collection(db, 'companies', companyId, 'locations', locationDoc.id, 'users'),
                async (usersSnapshot) => {
                  // Reload all users when any user collection changes
                  const usersData = [];
                  const currentLocationsSnapshot = await getDocs(collection(db, 'companies', companyId, 'locations'));
                  for (const locDoc of currentLocationsSnapshot.docs) {
                    const usersSnap = await getDocs(collection(db, 'companies', companyId, 'locations', locDoc.id, 'users'));
                    usersSnap.docs.forEach(userDoc => {
                      usersData.push({
                        id: userDoc.id,
                        companyId,
                        locationId: locDoc.id,
                        location: locDoc.data(),
                        ...userDoc.data()
                      });
                    });
                  }
                  setUsers(usersData);
                },
                (error) => {
                  console.error('Error listening to users:', error);
                }
              );
              unsubscribeUsers.push(unsubscribeUser);
            }
          },
          (error) => {
            console.error('Error loading locations:', error);
            setLocations([]);
            setUsers([]);
          }
        );
      } catch (error) {
        console.error('Error initializing listeners:', error);
        setLocations([]);
        setUsers([]);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeLocations) unsubscribeLocations();
      unsubscribeUsers.forEach(unsubscribe => unsubscribe());
    };
  }, [companyId]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  // Manual refresh function for users (fallback if real-time listeners fail)
  const refreshUsers = async () => {
    try {
      const usersData = [];
      const locationsSnapshot = await getDocs(collection(db, 'companies', companyId, 'locations'));
      for (const locationDoc of locationsSnapshot.docs) {
        const usersSnapshot = await getDocs(collection(db, 'companies', companyId, 'locations', locationDoc.id, 'users'));
        usersSnapshot.docs.forEach(userDoc => {
          usersData.push({
            id: userDoc.id,
            companyId,
            locationId: locationDoc.id,
            location: locationDoc.data(),
            ...userDoc.data()
          });
        });
      }
      setUsers(usersData);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  // Generate next unique location ID
  const generateNextLocationId = async () => {
    try {
      const existingLocations = locations || [];
      const locationIds = existingLocations
        .map(loc => loc.locationId)
        .filter(id => id && id.startsWith('LOC-'))
        .map(id => parseInt(id.replace('LOC-', '')))
        .filter(num => !isNaN(num));

      const maxNumber = locationIds.length > 0 ? Math.max(...locationIds) : 0;
      const nextNumber = maxNumber + 1;
      return `LOC-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating location ID:', error);
      // Fallback to a timestamp-based ID if something goes wrong
      return `LOC-${Date.now().toString().slice(-6)}`;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openCompanyEdit = () => {
    setCompanyForm({
      name: company?.name || '',
      industry: company?.industry || '',
      email: company?.email || '',
      phone: company?.phone || ''
    });
    setCompanyOpen(true);
  };

  const handleCompanyClose = () => setCompanyOpen(false);

  const saveCompanyInfo = async () => {
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        ...companyForm,
        updatedAt: new Date()
      });
      setCompanyOpen(false);
      showAlert('Company information updated');
    } catch (e) {
      console.error('Error updating company:', e);
      showAlert('Error updating company', 'error');
    }
  };

  // Location handlers
  const handleLocationClickOpen = async (location = null) => {
    setEditingLocation(location);
    if (location) {
      // Editing existing location
      setLocationFormData({
        locationId: location.locationId || '',
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zipCode: location.zipCode || '',
        phone: location.phone || '',
        manager: location.manager || ''
      });
    } else {
      // Adding new location - generate next ID
      const nextLocationId = await generateNextLocationId();
      setLocationFormData({
        locationId: nextLocationId,
        name: '', address: '', city: '', state: '', zipCode: '', phone: '', manager: ''
      });
    }
    setLocationOpen(true);
  };

  const handleLocationClose = () => {
    setLocationOpen(false);
    setEditingLocation(null);
  };

  const handleLocationSubmit = async () => {
    try {
      // Validate required fields
      if (!locationFormData.name || !locationFormData.locationId) {
        showAlert('Location Name and Location ID are required', 'error');
        return;
      }

      // Check if locationId is unique (excluding current location when editing)
      const existingLocation = locations.find(loc =>
        loc.locationId === locationFormData.locationId &&
        (!editingLocation || !editingLocation.id || loc.id !== editingLocation.id)
      );

      if (existingLocation) {
        showAlert('Location ID already exists. Please choose a different ID.', 'error');
        return;
      }

      const locationData = { ...locationFormData, updatedAt: new Date() };
      if (editingLocation && editingLocation.id) {
        await updateDoc(doc(db, 'companies', companyId, 'locations', editingLocation.id), locationData);
        showAlert('Location updated successfully');
      } else {
        locationData.createdAt = new Date();
        locationData.createdBy = currentUser.uid;
        await addDoc(collection(db, 'companies', companyId, 'locations'), locationData);
        showAlert('Location added successfully');
      }
      handleLocationClose();
    } catch (error) {
      console.error('Error saving location:', error);
      showAlert('Error saving location', 'error');
    }
  };

  const handleLocationDelete = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId, 'locations', locationId));
        showAlert('Location deleted successfully');
      } catch (error) {
        console.error('Error deleting location:', error);
        showAlert('Error deleting location', 'error');
      }
    }
  };

  // User handlers
  const handleUserClickOpen = (user = null) => {
    setEditingUser(user);
    setUserFormData(user ? {
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '', // Don't populate password for editing
      locationId: user.locationId || '',
      role: user.role || '',
      status: user.status || 'pending'
    } : {
      email: '', firstName: '', lastName: '', password: '', locationId: '', role: '', status: 'active'
    });
    setUserOpen(true);
  };

  const handleUserClose = () => {
    setUserOpen(false);
    setEditingUser(null);
    setUserFormData({
      email: '', firstName: '', lastName: '', password: '', locationId: '', role: '', status: 'active'
    });
  };

  const handleUserSubmit = async () => {
    try {
      if (!userFormData.email || !userFormData.locationId || !userFormData.role) {
        showAlert('Please fill in all required fields', 'error');
        return;
      }

      // For new users, password is required
      if (!editingUser && !userFormData.password) {
        showAlert('Password is required for new users', 'error');
        return;
      }

      const existingUser = users.find(u => u.email === userFormData.email && (!editingUser || !editingUser.id || u.id !== editingUser.id));
      if (existingUser) {
        showAlert('A user with this email already exists', 'error');
        return;
      }

      const userData = {
        ...userFormData,
        displayName: `${userFormData.firstName} ${userFormData.lastName}`.trim(),
        createdAt: new Date(),
        createdBy: currentUser.uid,
        updatedAt: new Date()
      };

      // Remove password from userData as it shouldn't be stored in Firestore
      const { password, ...userDataWithoutPassword } = userData;

      if (editingUser && editingUser.id && editingUser.locationId) {
        if (editingUser.locationId !== userFormData.locationId) {
          await deleteDoc(doc(db, 'companies', companyId, 'locations', editingUser.locationId, 'users', editingUser.id));
          await addDoc(collection(db, 'companies', companyId, 'locations', userFormData.locationId, 'users'), userDataWithoutPassword);
        } else {
          await updateDoc(doc(db, 'companies', companyId, 'locations', userFormData.locationId, 'users', editingUser.id), userDataWithoutPassword);
        }

        // Update password if provided (note: this may require re-authentication)
        if (userFormData.password && userFormData.password.trim() !== '') {
          try {
            // This would require the user to be re-authenticated first
            // For now, we'll show a message that password updates need to be done differently
            showAlert('User profile updated successfully. Password changes require the user to reset their password through the login page.', 'warning');
          } catch (passwordError) {
            console.error('Error updating password:', passwordError);
            showAlert('User profile updated but password change failed. User may need to reset password.', 'warning');
          }
        } else {
          showAlert('User updated successfully');
        }
      } else {
        // Create user in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, userFormData.email, userFormData.password);

        // Update the display name in Firebase Auth
        await updateProfile(userCredential.user, {
          displayName: userData.displayName
        });

        // Store user profile in Firestore
        await addDoc(collection(db, 'companies', companyId, 'locations', userFormData.locationId, 'users'), {
          ...userDataWithoutPassword,
          uid: userCredential.user.uid // Store the Firebase Auth UID
        });

        showAlert('User created successfully and can now log in');
      }
      handleUserClose();
      // Refresh users list to ensure immediate update
      setTimeout(() => refreshUsers(), 500);
    } catch (error) {
      console.error('Error saving user:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        showAlert('A user with this email already exists in the system', 'error');
      } else if (error.code === 'auth/weak-password') {
        showAlert('Password should be at least 6 characters', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showAlert('Please enter a valid email address', 'error');
      } else {
        showAlert('Error saving user', 'error');
      }
    }
  };

  const handleUserDelete = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId, 'locations', user.locationId, 'users', user.id));
        showAlert('User deleted successfully');
        // Refresh users list to ensure immediate update
        setTimeout(() => refreshUsers(), 500);
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading company...</Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Company not found</Typography>
      </Box>
    );
  }

  const locationColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (v, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'primary.main' }}>
          {row.locationId || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'name',
      header: 'Location',
      render: (v, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (v, row) => (
        <Typography variant="body2" color="text.secondary">{row.phone || '-'}</Typography>
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (v, row) => (
        <Typography variant="body2" color="text.secondary">
          {row.address || ''}{row.city ? `, ${row.city}` : ''}{row.state ? `, ${row.state}` : ''}{row.zipCode ? ` ${row.zipCode}` : ''}
        </Typography>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (v, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleLocationClickOpen(row)}><EditIcon /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleLocationDelete(row.id)}><DeleteIcon /></IconButton>
        </Box>
      )
    }
  ];

  const usersColumns = [
    {
      key: 'user',
      header: 'User',
      render: (v, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.displayName || row.email}</Typography>
          <Typography variant="caption" color="text.secondary">{row.email}</Typography>
        </Box>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (v, row) => (
        <Typography variant="body2" color="text.secondary">{row.location?.name || '-'}</Typography>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (v, row) => {
        const r = ROLES.find(r => r.value === row.role);
        return <Chip size="small" label={r?.label || 'Unknown'} color={r?.color || 'default'} variant="outlined" />
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (v, row) => (
        <Chip size="small" label={row.status || 'pending'} color={row.status === 'active' ? 'success' : 'default'} />
      )
    },
    {
      key: 'userActions',
      header: 'Actions',
      render: (v, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleUserClickOpen(row)}><EditIcon /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleUserDelete(row)}><DeleteIcon /></IconButton>
        </Box>
      )
    }
  ];

  return (
    <>
    <Layout>
      <Box sx={{ p: 3 }}>
        <Panel sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Company Name" value={company?.name || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Industry" value={company?.industry || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={company?.email || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={company?.phone || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={openCompanyEdit}>Edit</Button>
            </Grid>
          </Grid>
        </Panel>

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="company tabs" sx={{ mb: 2,
          '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' },
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: '#fff' } }
        }}>
          <Tab label="Locations" />
          <Tab label="Users" />
          <Tab label="Settings" />
        </Tabs>

        {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

        {tabValue === 0 && (
          <DataTable
            title={undefined}
            actions={<Button variant="contained" startIcon={<AddIcon />} onClick={handleLocationClickOpen}>Add Location</Button>}
            columns={locationColumns}
            rows={locations}
            dense
            variant="embedded"
            square
          />
        )}
        {tabValue === 1 && (
          <DataTable
            title={undefined}
            actions={userPermissions?.canManageUsers ? <Button variant="contained" startIcon={<AddIcon />} onClick={handleUserClickOpen}>Add User</Button> : null}
            columns={usersColumns}
            rows={users}
            dense
            variant="embedded"
            square
          />
        )}
        {tabValue === 2 && <SettingsTab company={company} locations={locations} users={users} />}

        {/* Replaced FABs with header actions in tables */}
      </Box>
    </Layout>

      {/* Location Dialog */}
      <Dialog open={companyOpen} onClose={handleCompanyClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Name" value={companyForm.name} onChange={(e)=>setCompanyForm({...companyForm,name:e.target.value})} sx={{ mb: 2, mt: 1 }} />
          <TextField margin="dense" fullWidth label="Industry" value={companyForm.industry} onChange={(e)=>setCompanyForm({...companyForm,industry:e.target.value})} sx={{ mb: 2 }} />
          <TextField margin="dense" fullWidth label="Email" value={companyForm.email} onChange={(e)=>setCompanyForm({...companyForm,email:e.target.value})} sx={{ mb: 2 }} />
          <TextField margin="dense" fullWidth label="Phone" value={companyForm.phone} onChange={(e)=>setCompanyForm({...companyForm,phone:e.target.value})} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompanyClose}>Cancel</Button>
          <Button variant="contained" onClick={saveCompanyInfo}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={locationOpen} onClose={handleLocationClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location ID *"
            fullWidth
            variant="outlined"
            value={locationFormData.locationId}
            onChange={(e) => setLocationFormData({ ...locationFormData, locationId: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            required
            helperText="Unique identifier for this location (e.g., LOC-001)"
          />
          <TextField
            margin="dense"
            label="Location Name *"
            fullWidth
            variant="outlined"
            value={locationFormData.name}
            onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField margin="dense" label="Address" fullWidth variant="outlined" value={locationFormData.address} onChange={(e) => setLocationFormData({ ...locationFormData, address: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}><TextField margin="dense" label="City" fullWidth variant="outlined" value={locationFormData.city} onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField margin="dense" label="State" fullWidth variant="outlined" value={locationFormData.state} onChange={(e) => setLocationFormData({ ...locationFormData, state: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField margin="dense" label="ZIP Code" fullWidth variant="outlined" value={locationFormData.zipCode} onChange={(e) => setLocationFormData({ ...locationFormData, zipCode: e.target.value })} /></Grid>
          </Grid>
          <TextField margin="dense" label="Phone" fullWidth variant="outlined" value={locationFormData.phone} onChange={(e) => setLocationFormData({ ...locationFormData, phone: e.target.value })} sx={{ mb: 2 }} />
          <TextField margin="dense" label="Manager" fullWidth variant="outlined" value={locationFormData.manager} onChange={(e) => setLocationFormData({ ...locationFormData, manager: e.target.value })} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLocationClose}>Cancel</Button>
          <Button onClick={handleLocationSubmit} variant="contained">{editingLocation ? 'Update' : 'Add'} Location</Button>
        </DialogActions>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userOpen} onClose={handleUserClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Email *" type="email" fullWidth variant="outlined" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} sx={{ mb: 2, mt: 1 }} required />
          <TextField
            margin="dense"
            label={editingUser ? "Password (leave blank to keep current)" : "Password *"}
            type="password"
            fullWidth
            variant="outlined"
            value={userFormData.password}
            onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
            sx={{ mb: 2 }}
            required={!editingUser}
            helperText={editingUser ? "Enter a new password to change it" : "Password is required for new users"}
          />
          <TextField margin="dense" label="First Name" fullWidth variant="outlined" value={userFormData.firstName} onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })} sx={{ mb: 2 }} />
          <TextField margin="dense" label="Last Name" fullWidth variant="outlined" value={userFormData.lastName} onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Location *</InputLabel>
            <Select value={userFormData.locationId} label="Location *" onChange={(e) => setUserFormData({ ...userFormData, locationId: e.target.value })} required>
              {locations.map((location) => <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role *</InputLabel>
            <Select value={userFormData.role} label="Role *" onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} required>
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                return <MenuItem key={role.value} value={role.value}><Box sx={{ display: 'flex', alignItems: 'center' }}><IconComponent sx={{ mr: 1, fontSize: 18 }} />{role.label}</Box></MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={userFormData.status} label="Status" onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserClose}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">{editingUser ? 'Update' : 'Add'} User</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CompanyPortal;