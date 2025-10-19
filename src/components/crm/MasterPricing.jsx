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
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Home as HomeIcon,
  HomeWork as HomeWorkIcon,
  Villa as VillaIcon,
  Cottage as CottageIcon
} from '@mui/icons-material';
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
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0,
      placementEquipment: 0,
      perimeterBlocking: 0,
      warranty: 0
    },
    double: {
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0,
      placementEquipment: 0,
      perimeterBlocking: 0,
      warranty: 0
    },
    triple: {
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0,
      placementEquipment: 0,
      perimeterBlocking: 0,
      warranty: 0
    },
    tiny: {
      deliverySetup: 0,
      ac: 0,
      steps: 0,
      trimOut: 0,
      skirting: 0,
      pad: 0,
      placementEquipment: 0,
      perimeterBlocking: 0,
      warranty: 0
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
        deliverySetup: 0,
        ac: 0,
        steps: 0,
        trimOut: 0,
        skirting: 0,
        pad: 0,
        placementEquipment: 0,
        perimeterBlocking: 0,
        warranty: 0
      };

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPricing({
          single: data.single || defaultPricing,
          double: data.double || defaultPricing,
          triple: data.triple || defaultPricing,
          tiny: data.tiny || defaultPricing
        });
      } else {
        // Reset to defaults if no pricing exists for this location
        setPricing({
          single: { ...defaultPricing },
          double: { ...defaultPricing },
          triple: { ...defaultPricing },
          tiny: { ...defaultPricing }
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
    { key: 'deliverySetup', label: 'Delivery & Setup' },
    { key: 'placementEquipment', label: 'Placement Equipment' },
    { key: 'ac', label: 'A/C Installation' },
    { key: 'steps', label: 'Steps' },
    { key: 'trimOut', label: 'Trim Out' },
    { key: 'skirting', label: 'Skirting' },
    { key: 'perimeterBlocking', label: 'Perimeter Blocking' },
    { key: 'pad', label: 'Pad/Site Prep' },
    { key: 'warranty', label: 'Warranty' }
  ];

  const calculateTotal = (pricingData) => {
    const total = pricingItems.reduce((sum, item) => sum + (pricingData[item.key] || 0), 0);
    return total.toFixed(2);
  };

  const homeTypeCards = [
    {
      label: 'Single Wide',
      icon: HomeIcon,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      tab: 'single'
    },
    {
      label: 'Double Wide',
      icon: HomeWorkIcon,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      tab: 'double'
    },
    {
      label: 'Triple Wide',
      icon: VillaIcon,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      tab: 'triple'
    },
    {
      label: 'Tiny Home',
      icon: CottageIcon,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      tab: 'tiny'
    }
  ];

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3, width: '100%' }}>
        {/* Location Tabs */}
        {locations.length > 0 && (
          <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Tabs 
                value={selectedLocationId} 
                onChange={(e, newValue) => setSelectedLocationId(newValue)} 
                textColor="primary" 
                indicatorColor="primary" 
                sx={{ 
                  '& .MuiTab-root': { 
                    fontWeight: 700, 
                    fontSize: 16, 
                    px: 4 
                  }, 
                  '& .MuiTabs-indicator': { 
                    height: 4 
                  } 
                }}
              >
                {locations.map((location) => (
                  <Tab 
                    key={location.id} 
                    label={location.name}
                    value={location.id} 
                  />
                ))}
              </Tabs>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving || !selectedLocationId}
                color="success"
                sx={{ mb: 1 }}
              >
                {saving ? 'Saving...' : 'Save Pricing'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Home Type Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {homeTypeCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeTypeTab === card.tab;
            
            return (
              <Paper
                key={card.tab}
                onClick={() => setActiveTypeTab(card.tab)}
                sx={{
                  flex: 1,
                  p: 4,
                  cursor: 'pointer',
                  background: isActive ? card.bgGradient : 'customColors.cardBackground',
                  border: '2px solid',
                  borderColor: isActive ? card.color : 'rgba(255,255,255,0.08)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 8px 32px ${card.color}40` : '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: card.color,
                    boxShadow: `0 12px 40px ${card.color}50`
                  }
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography 
                      sx={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${card.color}20`,
                        border: `2px solid ${card.color}60`
                      }}
                    >
                      <Icon sx={{ fontSize: 36, color: card.color }} />
                    </Box>
                  </Stack>
                  <Typography 
                    sx={{ 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: isActive ? card.color : 'text.primary',
                      lineHeight: 1,
                      mt: 1
                    }}
                  >
                    ${calculateTotal(pricing[card.tab])}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Box>

        {/* Pricing Form */}
        <Paper sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              {pricingItems.map((item, index) => (
                <Box 
                  key={item.key}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: 3,
                    py: 1.5,
                    px: 2,
                    borderRadius: 1.5,
                    backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  <Typography sx={{ 
                    color: 'text.primary', 
                    fontWeight: 500,
                    fontSize: 14
                  }}>
                    {item.label}
                  </Typography>
                  <TextField
                    type="number"
                    value={pricing[activeTypeTab][item.key]}
                    onChange={(e) => updatePricing(activeTypeTab, item.key, e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ color: 'text.secondary', mr: 0.5, fontSize: 14 }}>$</Typography>,
                    }}
                    sx={{
                      width: 150,
                      '& .MuiInputBase-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 1.5,
                        fontSize: 14,
                        fontWeight: 600
                      },
                      '& .MuiInputBase-input': {
                        py: 1
                      },
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        display: 'none'
                      }
                    }}
                  />
                </Box>
              ))}
              
              {/* Total */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 3,
                  pt: 2,
                  mt: 2,
                  borderTop: '3px solid',
                  borderColor: 'primary.main'
                }}
              >
                <Typography sx={{ 
                  color: 'text.primary', 
                  fontWeight: 700, 
                  fontSize: 18,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  Total MSRP
                </Typography>
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'success.main',
                    borderRadius: 2,
                    minWidth: 150,
                    textAlign: 'center'
                  }}
                >
                  <Typography sx={{ 
                    color: '#ffffff', 
                    fontWeight: 800, 
                    fontSize: 24,
                    letterSpacing: 0.5
                  }}>
                    ${calculateTotal(pricing[activeTypeTab])}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
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
