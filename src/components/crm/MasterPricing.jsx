import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { Save as SaveIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useUser } from '../../hooks/useUser';

function MasterPricing() {
  const { userProfile, accessibleLocations } = useUser();
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locations, setLocations] = useState([]);
  const [activeTypeTab, setActiveTypeTab] = useState('single');
  const [pricing, setPricing] = useState({
    single: {
      basePrice: 0,
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0
    },
    double: {
      basePrice: 0,
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0
    },
    triple: {
      basePrice: 0,
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0
    },
    tiny: {
      basePrice: 0,
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0
    },
    used: {
      basePrice: 0,
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0
    }
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load locations from accessible locations
  useEffect(() => {
    if (accessibleLocations && accessibleLocations.length > 0) {
      setLocations(accessibleLocations);
      // Set default location to user's location or first accessible location
      if (userProfile?.locationId) {
        setSelectedLocationId(userProfile.locationId);
      } else if (accessibleLocations[0]?.id) {
        setSelectedLocationId(accessibleLocations[0].id);
      }
    }
  }, [accessibleLocations, userProfile?.locationId]);

  // Load pricing when location changes
  useEffect(() => {
    if (!userProfile?.companyId || !selectedLocationId) return;
    loadPricing();
  }, [userProfile?.companyId, selectedLocationId]);

  const loadPricing = async () => {
    try {
      const docRef = doc(db, 'companies', userProfile.companyId, 'locations', selectedLocationId, 'settings', 'masterPricing');
      const docSnap = await getDoc(docRef);

      const defaultPricing = {
        basePrice: 0,
        deliverySetup: 0,
        ac: 0,
        steps: 0,
        trimOut: 0,
        skirting: 0,
        pad: 0
      };

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPricing({
          single: data.single || defaultPricing,
          double: data.double || defaultPricing,
          triple: data.triple || defaultPricing,
          tiny: data.tiny || defaultPricing,
          used: data.used || defaultPricing
        });
      } else {
        // Reset to defaults if no pricing exists for this location
        setPricing({
          single: { ...defaultPricing },
          double: { ...defaultPricing },
          triple: { ...defaultPricing },
          tiny: { ...defaultPricing },
          used: { ...defaultPricing }
        });
      }
    } catch (error) {
      console.error('Error loading master pricing:', error);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.companyId || !selectedLocationId) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'companies', userProfile.companyId, 'locations', selectedLocationId, 'settings', 'masterPricing');
      await setDoc(docRef, {
        ...pricing,
        locationId: selectedLocationId,
        updatedAt: new Date(),
        updatedBy: userProfile.email
      });
      setSnackbar({ open: true, message: 'Master pricing saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving master pricing:', error);
      setSnackbar({ open: true, message: 'Error saving master pricing', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updatePricing = (type, field, value) => {
    setPricing(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const pricingItems = [
    { key: 'basePrice', label: 'Base Home Price' },
    { key: 'deliverySetup', label: 'Delivery & Setup' },
    { key: 'ac', label: 'A/C Installation' },
    { key: 'steps', label: 'Steps' },
    { key: 'trimOut', label: 'Trim Out' },
    { key: 'skirting', label: 'Skirting' },
    { key: 'pad', label: 'Pad/Site Prep' }
  ];

  const calculateTotal = (pricingData) => {
    const total = pricingItems.reduce((sum, item) => sum + (pricingData[item.key] || 0), 0);
    return total.toFixed(2);
  };

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Master Pricing
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !selectedLocationId}
            color="success"
          >
            {saving ? 'Saving...' : 'Save Pricing'}
          </Button>
        </Stack>

        {/* Location Tabs */}
        {locations.length > 0 && (
          <Paper sx={{ mb: 3, backgroundColor: 'customColors.calendarHeaderBackground' }}>
            <Tabs
              value={selectedLocationId}
              onChange={(e, newValue) => setSelectedLocationId(newValue)}
              sx={{
                '& .MuiTab-root': { color: 'text.secondary' },
                '& .MuiTab-root.Mui-selected': { color: 'text.primary' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
              }}
            >
              {locations.map((location) => (
                <Tab 
                  key={location.id} 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon sx={{ fontSize: 18 }} />
                      <span>{location.name}</span>
                      {location.id === userProfile?.locationId && (
                        <Chip label="Your Location" size="small" color="primary" sx={{ height: 20 }} />
                      )}
                    </Stack>
                  } 
                  value={location.id} 
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* Home Type Tabs and Pricing Card */}
        <Paper sx={{ mb: 3, backgroundColor: 'customColors.calendarHeaderBackground' }}>
          <Tabs
            value={activeTypeTab}
            onChange={(e, newValue) => setActiveTypeTab(newValue)}
            sx={{
              '& .MuiTab-root': { color: 'text.secondary' },
              '& .MuiTab-root.Mui-selected': { color: 'text.primary' },
              '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
            }}
          >
            <Tab label="Single-Wide" value="single" />
            <Tab label="Double-Wide" value="double" />
            <Tab label="Triple-Wide" value="triple" />
            <Tab label="Tiny Home" value="tiny" />
            <Tab label="Used" value="used" />
          </Tabs>
        </Paper>

        {/* Pricing Card */}
        <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600, textAlign: 'center' }}>
            {activeTypeTab === 'single' && 'Single-Wide Pricing'}
            {activeTypeTab === 'double' && 'Double-Wide Pricing'}
            {activeTypeTab === 'triple' && 'Triple-Wide Pricing'}
            {activeTypeTab === 'tiny' && 'Tiny Home Pricing'}
            {activeTypeTab === 'used' && 'Used Home Pricing'}
          </Typography>
          <Stack spacing={2}>
            {pricingItems.map((item) => (
              <Box key={item.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                <Typography sx={{ color: 'text.primary', fontWeight: 500, flex: 1 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>$</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={pricing[activeTypeTab][item.key]}
                    onChange={(e) => updatePricing(activeTypeTab, item.key, e.target.value)}
                    sx={{
                      width: 110,
                      '& .MuiInputBase-root': {
                        backgroundColor: 'background.paper',
                        color: 'text.primary'
                      },
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        display: 'none'
                      }
                    }}
                  />
                </Box>
              </Box>
            ))}
            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, mt: 2, borderTop: '2px solid', borderColor: 'primary.main' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>
                TOTAL MSRP
              </Typography>
              <Typography sx={{ color: 'success.main', fontWeight: 700, fontSize: 22 }}>
                ${calculateTotal(pricing[activeTypeTab])}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Instructions */}
        <Paper sx={{ mt: 3, p: 3, backgroundColor: 'customColors.tableRowBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            How Master Pricing Works
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • Set your base home price and add-on options pricing for each location
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • Each location maintains separate pricing for Single-Wide, Double-Wide, Triple-Wide, Tiny, and Used homes
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • Pricing set here is automatically applied when creating inventory (Invoice + Master Pricing + Markup %)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • The total MSRP is calculated by adding all the pricing items together
            </Typography>
          </Stack>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

export default MasterPricing;
