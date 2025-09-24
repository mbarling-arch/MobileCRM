import React, { useEffect, useState } from 'react';
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
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SaveListDialog from './SaveListDialog';
import AddInventoryDrawer from './AddInventoryDrawer';
import AddDocumentDialog from './AddDocumentDialog';
import CRMLayout from '../CRMLayout';
import { useUser } from '../../UserContext';
import { useAuth } from '../../AuthContext';
import { db, storage } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

function Setup() {
  const { userProfile } = useUser();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('locations');
  const [locations, setLocations] = useState([]);
  const [forms, setForms] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [inventoryTemplates, setInventoryTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const companyId = userProfile?.companyId || 'demo-company';

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

  // Load forms
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'forms');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setForms(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load contractors
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'contractors');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContractors(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load inventory templates
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'inventoryTemplates');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInventoryTemplates(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load documents
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'documents');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(data);
    });
    return () => unsub();
  }, [companyId]);

  const handleAdd = (type) => {
    setEditItem(null);
    setAddDialogOpen(type);
  };

  const handleEdit = (item, type) => {
    setEditItem(item);
    setAddDialogOpen(type);
  };

  const handleDelete = async (id, collectionName) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      // For forms, also delete associated file from storage
      if (collectionName === 'forms') {
        const formDoc = forms.find(f => f.id === id);
        if (formDoc?.file?.path) {
          try {
            const fileRef = ref(storage, formDoc.file.path);
            await deleteObject(fileRef);
          } catch (fileError) {
            console.error('Error deleting associated file:', fileError);
            // Continue with form deletion even if file deletion fails
          }
        }
      }

      await deleteDoc(doc(db, 'companies', companyId, collectionName, id));
      setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting:', error);
      setSnackbar({ open: true, message: 'Error deleting item', severity: 'error' });
    }
  };

  const handleSave = async (data, collectionName) => {
    try {
      if (editItem) {
        await updateDoc(doc(db, 'companies', companyId, collectionName, editItem.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Item updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'companies', companyId, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Item added successfully', severity: 'success' });
      }
      setAddDialogOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error('Error saving:', error);
      setSnackbar({ open: true, message: 'Error saving item', severity: 'error' });
    }
  };

  return (
    <CRMLayout>
      <Box sx={{ p: 3, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            CRM Setup & Administration
          </Typography>
        </Stack>

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
              <Tab label="Locations" value="locations" />
              <Tab label="Forms" value="forms" />
              <Tab label="Documents" value="documents" />
              <Tab label="Contractors" value="contractors" />
              <Tab label="Inventory Setup" value="inventory" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {activeTab === 'locations' && (
              <LocationsTab
                locations={locations}
                onAdd={() => handleAdd('location')}
                onEdit={(item) => handleEdit(item, 'location')}
                onDelete={(id) => handleDelete(id, 'locations')}
              />
            )}

            {activeTab === 'forms' && (
              <FormsTab
                forms={forms}
                onAdd={() => handleAdd('form')}
                onEdit={(item) => handleEdit(item, 'form')}
                onDelete={(id) => handleDelete(id, 'forms')}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab
                documents={documents}
                onAdd={() => handleAdd('document')}
                onEdit={(item) => handleEdit(item, 'document')}
                onDelete={(id) => handleDelete(id, 'documents')}
              />
            )}

            {activeTab === 'contractors' && (
              <ContractorsTab
                contractors={contractors}
                onAdd={() => handleAdd('contractor')}
                onEdit={(item) => handleEdit(item, 'contractor')}
                onDelete={(id) => handleDelete(id, 'contractors')}
              />
            )}

            {activeTab === 'inventory' && (
              <InventorySetupTab
                templates={inventoryTemplates}
                onAdd={() => handleAdd('inventoryTemplate')}
                onEdit={(item) => handleEdit(item, 'inventoryTemplate')}
                onDelete={(id) => handleDelete(id, 'inventoryTemplates')}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddLocationDialog
          open={addDialogOpen === 'location'}
          onClose={() => { setAddDialogOpen(false); setEditItem(null); }}
          onSave={(data) => handleSave(data, 'locations')}
          initial={editItem}
        />

        <AddFormDialog
          open={addDialogOpen === 'form'}
          onClose={() => { setAddDialogOpen(false); setEditItem(null); }}
          onSave={(data) => handleSave(data, 'forms')}
          initial={editItem}
        />

        <AddContractorDialog
          open={addDialogOpen === 'contractor'}
          onClose={() => { setAddDialogOpen(false); setEditItem(null); }}
          onSave={(data) => handleSave(data, 'contractors')}
          initial={editItem}
        />

        <AddInventoryTemplateDialog
          open={addDialogOpen === 'inventoryTemplate'}
          onClose={() => { setAddDialogOpen(false); setEditItem(null); }}
          onSave={(data) => handleSave(data, 'inventoryTemplates')}
          initial={editItem}
        />

        <AddDocumentDialog
          open={addDialogOpen === 'document'}
          onClose={() => { setAddDialogOpen(false); setEditItem(null); }}
          onSave={(data) => handleSave(data, 'documents')}
          initial={editItem}
        />

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </CRMLayout>
  );
}

// Tab Components
function LocationsTab({ locations, onAdd, onEdit, onDelete }) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Company Locations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Add Location
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Location ID</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Address</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Manager</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{location.locationId || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{location.name}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {location.address}
                  {location.city && `, ${location.city}`}
                  {location.state && `, ${location.state}`}
                  {location.zipCode && ` ${location.zipCode}`}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{location.phone || '-'}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{location.manager || '-'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
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
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No locations configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function FormsTab({ forms, onAdd, onEdit, onDelete }) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>CRM Forms</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Add Form
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Form Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>File</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{form.name}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{form.description || '-'}</TableCell>
                <TableCell>
                  {form.file ? (
                    <Button
                      size="small"
                      onClick={() => window.open(form.file.url, '_blank')}
                      sx={{ color: '#90caf9', textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      📄 {form.file.name}
                    </Button>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      No file
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={form.status || 'active'}
                    color={form.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => onEdit(form)} sx={{ color: '#90caf9' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(form.id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No forms configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function ContractorsTab({ contractors, onAdd, onEdit, onDelete }) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Contractors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Add Contractor
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Specialty</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contractors.map((contractor) => (
              <TableRow key={contractor.id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{contractor.name}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{contractor.company || '-'}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{contractor.phone || '-'}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{contractor.email || '-'}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{contractor.specialty || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={contractor.status || 'active'}
                    color={contractor.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => onEdit(contractor)} sx={{ color: '#90caf9' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(contractor.id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {contractors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No contractors added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function InventorySetupTab({ templates, onAdd, onEdit, onDelete }) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Inventory Templates & Pricing</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Add Template
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Template Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Base Price</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Options</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{template.name}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{template.type}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', textAlign: 'right' }}>
                  ${template.basePrice?.toLocaleString() || '0'}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {template.options?.length || 0} options
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={template.status || 'active'}
                    color={template.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => onEdit(template)} sx={{ color: '#90caf9' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(template.id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No inventory templates configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Dialog Components
function AddLocationDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    locationId: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    manager: ''
  });

  React.useEffect(() => {
    if (initial) {
      setForm({
        locationId: initial.locationId || '',
        name: initial.name || '',
        address: initial.address || '',
        city: initial.city || '',
        state: initial.state || '',
        zipCode: initial.zipCode || '',
        phone: initial.phone || '',
        manager: initial.manager || ''
      });
    } else {
      setForm({
        locationId: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        manager: ''
      });
    }
  }, [initial, open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {initial ? 'Edit Location' : 'Add Location'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Location ID"
              value={form.locationId}
              onChange={handleChange('locationId')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              required
              label="Location Name"
              value={form.name}
              onChange={handleChange('name')}
              sx={dialogFieldSx}
            />
          </Stack>

          <TextField
            fullWidth
            label="Address"
            value={form.address}
            onChange={handleChange('address')}
            sx={dialogFieldSx}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="City"
              value={form.city}
              onChange={handleChange('city')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="State"
              value={form.state}
              onChange={handleChange('state')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="ZIP Code"
              value={form.zipCode}
              onChange={handleChange('zipCode')}
              sx={dialogFieldSx}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Manager"
              value={form.manager}
              onChange={handleChange('manager')}
              sx={dialogFieldSx}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name.trim()}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          {initial ? 'Save Changes' : 'Add Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddFormDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef();

  React.useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        status: initial.status || 'active'
      });
      setUploadedFile(initial.file || null);
    } else {
      setForm({
        name: '',
        description: '',
        status: 'active'
      });
      setUploadedFile(null);
    }
    setUploading(false);
  }, [initial, open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (allow PDFs, docs, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid document file (PDF, DOC, DOCX, TXT, RTF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const companyId = userProfile?.companyId || 'demo-company';

      // If editing and there's an existing file, delete it first
      if (initial && uploadedFile && uploadedFile.path) {
        try {
          const oldFileRef = ref(storage, uploadedFile.path);
          await deleteObject(oldFileRef);
        } catch (deleteError) {
          console.error('Error deleting old file:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${companyId}/forms/${fileName}`);

      console.log('Uploading to:', storageRef.fullPath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      console.log('Upload successful, URL:', downloadURL);
      setUploadedFile({
        name: file.name,
        url: downloadURL,
        path: `companies/${companyId}/forms/${fileName}`,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = error.message;

      if (error.code === 'storage/unauthorized') {
        const isDev = import.meta.env.DEV;
        errorMessage = isDev
          ? 'Storage access denied. Please run "firebase emulators:start" to start the local Firebase emulators.'
          : 'Storage access denied. Please check Firebase Storage permissions.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Storage quota exceeded. Please contact support.';
      }

      alert(`Error uploading file: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (uploadedFile && uploadedFile.path) {
      try {
        const fileRef = ref(storage, uploadedFile.path);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    const formData = {
      ...form,
      file: uploadedFile
    };

    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {initial ? 'Edit Form' : 'Add Form'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            required
            label="Form Name"
            value={form.name}
            onChange={handleChange('name')}
            sx={dialogFieldSx}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            sx={dialogFieldSx}
          />

          <TextField
            fullWidth
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            select
            sx={dialogFieldSx}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
              Upload Form Document (Optional)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {!uploadedFile ? (
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  color: '#90caf9',
                  borderColor: 'rgba(144, 202, 249, 0.5)',
                  '&:hover': { borderColor: '#90caf9' }
                }}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography sx={{ color: 'white', flexGrow: 1 }}>
                  📄 {uploadedFile.name}
                  <br />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Typography>
                <Button
                  size="small"
                  onClick={() => window.open(uploadedFile.url, '_blank')}
                  sx={{ color: '#90caf9' }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  onClick={handleRemoveFile}
                  sx={{ color: '#f44336' }}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name.trim() || uploading}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          {initial ? 'Save Changes' : 'Add Form'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddContractorDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    specialty: '',
    status: 'active'
  });

  React.useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        company: initial.company || '',
        phone: initial.phone || '',
        email: initial.email || '',
        specialty: initial.specialty || '',
        status: initial.status || 'active'
      });
    } else {
      setForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        specialty: '',
        status: 'active'
      });
    }
  }, [initial, open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {initial ? 'Edit Contractor' : 'Add Contractor'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={form.name}
              onChange={handleChange('name')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Company"
              value={form.company}
              onChange={handleChange('company')}
              sx={dialogFieldSx}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange('email')}
              sx={dialogFieldSx}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Specialty"
              value={form.specialty}
              onChange={handleChange('specialty')}
              select
              sx={dialogFieldSx}
            >
              <MenuItem value="framing">Framing</MenuItem>
              <MenuItem value="electrical">Electrical</MenuItem>
              <MenuItem value="plumbing">Plumbing</MenuItem>
              <MenuItem value="roofing">Roofing</MenuItem>
              <MenuItem value="hvac">HVAC</MenuItem>
              <MenuItem value="drywall">Drywall</MenuItem>
              <MenuItem value="flooring">Flooring</MenuItem>
              <MenuItem value="painting">Painting</MenuItem>
              <MenuItem value="landscaping">Landscaping</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Status"
              value={form.status}
              onChange={handleChange('status')}
              select
              sx={dialogFieldSx}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name.trim()}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          {initial ? 'Save Changes' : 'Add Contractor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddInventoryTemplateDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: '',
    type: 'factory',
    basePrice: 0,
    options: [],
    status: 'active'
  });

  const [currentOption, setCurrentOption] = useState({ name: '', price: 0, type: 'single' });

  React.useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        type: initial.type || 'factory',
        basePrice: initial.basePrice || 0,
        options: initial.options || [],
        status: initial.status || 'active'
      });
    } else {
      setForm({
        name: '',
        type: 'factory',
        basePrice: 0,
        options: [],
        status: 'active'
      });
    }
    setCurrentOption({ name: '', price: 0, type: 'single' });
  }, [initial, open]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleNumberChange = (field) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleAddOption = () => {
    if (!currentOption.name.trim()) return;
    setForm(f => ({
      ...f,
      options: [...f.options, { ...currentOption, id: Date.now().toString() }]
    }));
    setCurrentOption({ name: '', price: 0, type: 'single' });
  };

  const handleRemoveOption = (optionId) => {
    setForm(f => ({
      ...f,
      options: f.options.filter(opt => opt.id !== optionId)
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {initial ? 'Edit Inventory Template' : 'Add Inventory Template'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Template Name"
              value={form.name}
              onChange={handleChange('name')}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Type"
              value={form.type}
              onChange={handleChange('type')}
              select
              sx={dialogFieldSx}
            >
              <MenuItem value="factory">Factory Home</MenuItem>
              <MenuItem value="core">Core Home</MenuItem>
              <MenuItem value="option">Pricing Option</MenuItem>
            </TextField>
          </Stack>

          <TextField
            fullWidth
            label="Base Price"
            type="number"
            value={form.basePrice}
            onChange={handleNumberChange('basePrice')}
            InputProps={{ startAdornment: '$' }}
            sx={dialogFieldSx}
          />

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
            Pricing Options
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              fullWidth
              label="Option Name"
              value={currentOption.name}
              onChange={(e) => setCurrentOption(o => ({ ...o, name: e.target.value }))}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={currentOption.price}
              onChange={(e) => setCurrentOption(o => ({ ...o, price: parseFloat(e.target.value) || 0 }))}
              InputProps={{ startAdornment: '$' }}
              sx={dialogFieldSx}
            />
            <TextField
              fullWidth
              label="Type"
              value={currentOption.type}
              onChange={(e) => setCurrentOption(o => ({ ...o, type: e.target.value }))}
              select
              sx={dialogFieldSx}
            >
              <MenuItem value="single">Single</MenuItem>
              <MenuItem value="double">Double</MenuItem>
              <MenuItem value="required">Required</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              onClick={handleAddOption}
              disabled={!currentOption.name.trim()}
              sx={{ color: '#4caf50', borderColor: '#4caf50', '&:hover': { borderColor: '#45a049' } }}
            >
              Add
            </Button>
          </Stack>

          {form.options.length > 0 && (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Option</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.options.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>{option.name}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.92)', textAlign: 'right' }}>
                        ${option.price?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={option.type} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveOption(option.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          <TextField
            fullWidth
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            select
            sx={dialogFieldSx}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name.trim()}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          {initial ? 'Save Changes' : 'Add Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DocumentsTab({ documents, onAdd, onEdit, onDelete }) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>CRM Documents</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Upload Document
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Document Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Size</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Uploaded</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                  {document.file ? (
                    <Button
                      size="small"
                      onClick={() => window.open(document.file.url, '_blank')}
                      sx={{ color: '#90caf9', textTransform: 'none', fontSize: '0.875rem', p: 0, minWidth: 'auto' }}
                    >
                      📄 {document.name}
                    </Button>
                  ) : (
                    document.name || 'Unnamed Document'
                  )}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {document.type || 'Document'}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {document.category || 'General'}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {document.file ? `${(document.file.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {document.createdAt ? new Date(document.createdAt.toDate()).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {document.file && (
                      <IconButton size="small" onClick={() => window.open(document.file.url, '_blank')} sx={{ color: '#90caf9' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => onDelete(document.id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No documents uploaded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}



const dialogFieldSx = {
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiInputBase-input': { color: 'white' },
  '& .MuiSelect-select': { color: 'white' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' }
};

export default Setup;

