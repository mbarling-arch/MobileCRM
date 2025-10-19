import React, { useState, useEffect } from 'react';
import { FormTextField, FormSelect } from '../FormField';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function AddProjectDrawer({ open, onClose }) {
  const { userProfile } = useUser();
  const [form, setForm] = useState({
    address: '',
    lotNumber: '',
    lotSize: '',
    selectedHomeId: '',
    offlineDate: '',
    landOwner: '',
    propertyStatus: ''
  });
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState([]);

  // Load inventory for dropdown
  useEffect(() => {
    const loadInventory = async () => {
      if (!userProfile?.companyId) return;
      try {
        const inventoryRef = collection(db, 'companies', userProfile.companyId, 'inventory');
        const q = query(inventoryRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventory(inventoryData);
      } catch (error) {
        console.error('Error loading inventory:', error);
      }
    };
    
    if (open) {
      loadInventory();
    }
  }, [open, userProfile?.companyId]);

  const isValid = form.address && form.propertyStatus;

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!isValid || !userProfile?.companyId) return;

    setSaving(true);
    try {
      const selectedHome = inventory.find(h => h.id === form.selectedHomeId);
      
      const projectData = {
        address: form.address,
        lotNumber: form.lotNumber,
        lotSize: form.lotSize ? parseFloat(form.lotSize) : null,
        selectedHomeId: form.selectedHomeId || null,
        homeDetails: selectedHome ? {
          factory: selectedHome.factory,
          model: selectedHome.model,
          type: selectedHome.type,
          bedrooms: selectedHome.bedrooms,
          bathrooms: selectedHome.bathrooms
        } : null,
        offlineDate: form.offlineDate || null,
        landOwner: form.landOwner,
        propertyStatus: form.propertyStatus,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system',
        locationId: userProfile?.locationId || null,
        archived: false
      };

      await addDoc(collection(db, 'companies', userProfile.companyId, 'projects'), projectData);

      // Reset form and close
      setForm({
        address: '',
        lotNumber: '',
        lotSize: '',
        selectedHomeId: '',
        offlineDate: '',
        landOwner: '',
        propertyStatus: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error adding project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setForm({
        address: '',
        lotNumber: '',
        lotSize: '',
        selectedHomeId: '',
        offlineDate: '',
        landOwner: '',
        propertyStatus: ''
      });
      onClose();
    }
  };

  const inventoryOptions = inventory.map(home => {
    const homeType = home.type || home.width || 'single';
    const typeLabel = homeType.charAt(0).toUpperCase() + homeType.slice(1);
    const typeDisplay = homeType !== 'tiny' && homeType !== 'used' ? `${typeLabel}-Wide` : typeLabel;
    return {
      value: home.id,
      label: `${home.factory} ${home.model} - ${home.bedrooms || '-'}BR/${home.bathrooms || '-'}BA - ${typeDisplay}`
    };
  });

  return (
    <BaseDrawer
      open={open}
      onClose={handleClose}
      title="Add New Project"
      actions={
        <DrawerActions
          onCancel={handleClose}
          onSubmit={handleSave}
          disabled={!isValid || saving}
          submitLabel={saving ? 'Adding...' : 'Add Project'}
        />
      }
    >
      <FormTextField
        label="Address"
        value={form.address}
        onChange={handleChange('address')}
        required
        placeholder="123 Main St, City, State"
      />

      <FormTextField
        label="Lot Number"
        value={form.lotNumber}
        onChange={handleChange('lotNumber')}
        placeholder="e.g., Lot 45"
      />

      <FormTextField
        label="Lot Size (Acres)"
        type="number"
        value={form.lotSize}
        onChange={handleChange('lotSize')}
        placeholder="e.g., 2.5"
      />

      <FormSelect
        label="Select Home from Inventory"
        value={form.selectedHomeId}
        onChange={handleChange('selectedHomeId')}
        options={[
          { value: '', label: 'Select a home (optional)' },
          ...inventoryOptions
        ]}
      />

      <FormTextField
        label="Offline Date"
        type="date"
        value={form.offlineDate}
        onChange={handleChange('offlineDate')}
        InputLabelProps={{ shrink: true }}
      />

      <FormTextField
        label="Land Owner"
        value={form.landOwner}
        onChange={handleChange('landOwner')}
        placeholder="Owner name"
      />

      <FormSelect
        label="Property Status"
        value={form.propertyStatus}
        onChange={handleChange('propertyStatus')}
        required
        options={[
          { value: '', label: 'Select Status' },
          { value: 'not_started', label: 'Not Started' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'on_market', label: 'On Market' },
          { value: 'under_contract', label: 'Under Contract' },
          { value: 'sold', label: 'Sold' }
        ]}
      />
    </BaseDrawer>
  );
}

export default AddProjectDrawer;

