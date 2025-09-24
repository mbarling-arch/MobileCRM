import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, Link } from '@mui/material';
import { Add as AddIcon, AccountBalance as CompaniesIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from './Layout';
import DataTable from './ui/DataTable';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';


function Companies() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    status: 'active'
  });


  // Fetch companies from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleClickOpen = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        industry: company.industry || '',
        status: company.status || 'active'
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        industry: '',
        status: 'active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      industry: '',
      status: 'active'
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCompany) {
        // Update existing company
        await updateDoc(doc(db, 'companies', editingCompany.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Add new company
        await addDoc(collection(db, 'companies'), {
          ...formData,
          createdAt: new Date(),
          createdBy: currentUser.uid
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId));
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };


  return (
    <>
    <Layout>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>

          <DataTable
            title={undefined}
            actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleClickOpen()}>Add Company</Button>}
            columns={[
              { key: 'company', header: 'Company', render: (v, row) => (
                <Link component="button" underline="hover" color="inherit" onClick={() => navigate(`/companies/${row.id}`)}>
                  <Typography variant="body1" className="font-medium">{row.name}</Typography>
                </Link>
              )},
              { key: 'contact', header: 'Contact', render: (v, row) => {
                const contactName = row.contactName || row.contact || (row.email ? row.email.split('@')[0] : '-');
                return <Typography variant="body2" className="text-gray-600">{contactName}</Typography>;
              }},
              { key: 'industry', header: 'Industry', render: (v, row) => (<Typography variant="body2" className="text-gray-600">{row.industry}</Typography>) },
              { key: 'status', header: 'Status', render: (v, row) => (<Chip label={row.status || 'active'} size="small" color={row.status === 'active' ? 'success' : 'default'} />) },
              { key: 'actions', header: 'Actions', render: (v, row) => (
                <div className="flex gap-1">
                  <IconButton size="small" onClick={() => handleClickOpen(row)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(row.id)} color="error"><DeleteIcon /></IconButton>
        </div>
              )},
            ]}
            rows={companies}
            dense
            variant="embedded"
            square
          />
      </Box>
    </Layout>

      {/* Add/Edit Company Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Industry"
            fullWidth
            variant="outlined"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCompany ? 'Update' : 'Add'} Company
          </Button>
        </DialogActions>
      </Dialog>


      {/* Floating Action Button */}
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
    </>
  );
}

export default Companies;
