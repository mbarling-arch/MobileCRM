import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Radio, Chip } from '@mui/material';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FormTextField, FormSelect } from '../FormField';

function GamePlan({ prospectId, userProfile, isDeal }) {
  const [inventory, setInventory] = useState([]);
  const [selectedHomes, setSelectedHomes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    bedrooms: '',
    priceMin: '',
    priceMax: '',
    paymentMin: '',
    paymentMax: ''
  });

  // Load inventory
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
    
    loadInventory();
  }, [userProfile?.companyId]);

  // Load saved selected homes
  useEffect(() => {
    const loadSelectedHomes = async () => {
      if (!userProfile?.companyId || !prospectId) return;
      try {
        const collectionName = isDeal ? 'deals' : 'prospects';
        const docRef = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.gamePlan?.selectedHomes) {
            setSelectedHomes(data.gamePlan.selectedHomes);
          }
        }
      } catch (error) {
        console.error('Error loading selected homes:', error);
      }
    };
    
    loadSelectedHomes();
  }, [userProfile?.companyId, prospectId, isDeal]);

  const handleFilterChange = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleToggleHome = (homeId) => {
    setSelectedHomes(prev => 
      prev.includes(homeId) 
        ? prev.filter(id => id !== homeId)
        : [...prev, homeId]
    );
  };

  const handleSaveSelectedHomes = async () => {
    if (!userProfile?.companyId || !prospectId) return;
    setSaving(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const docRef = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
      await updateDoc(docRef, {
        'gamePlan.selectedHomes': selectedHomes
      });
      alert('✅ Selected homes saved successfully!');
    } catch (error) {
      console.error('Error saving selected homes:', error);
      alert('Error saving selected homes');
    } finally {
      setSaving(false);
    }
  };

  const filteredInventory = inventory.filter(home => {
    if (filters.bedrooms && home.bedrooms !== filters.bedrooms) return false;
    if (filters.priceMin && parseFloat(home.salesPrice || 0) < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax && parseFloat(home.salesPrice || 0) > parseFloat(filters.priceMax)) return false;
    if (filters.paymentMin && parseFloat(home.estimatedPayment || 0) < parseFloat(filters.paymentMin)) return false;
    if (filters.paymentMax && parseFloat(home.estimatedPayment || 0) > parseFloat(filters.paymentMax)) return false;
    return true;
  });

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'success.main';
      case 'pending': return 'warning.main';
      case 'sold': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const getAvailabilityLabel = (status) => {
    switch (status) {
      case 'available': return 'AVAILABLE';
      case 'pending': return 'PENDING';
      case 'sold': return 'SOLD';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Save Button */}
      {selectedHomes.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={`${selectedHomes.length} selected`} 
            size="medium" 
            color="primary"
          />
          <Button 
            onClick={handleSaveSelectedHomes} 
            variant="contained" 
            color="success"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Selection'}
          </Button>
        </Box>
      )}

      {/* Filter Bar */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ width: 150 }}>
            <FormSelect
              label="Bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange('bedrooms')}
              options={[
                { value: '', label: 'All' },
                { value: '1', label: '1 BR' },
                { value: '2', label: '2 BR' },
                { value: '3', label: '3 BR' },
                { value: '4', label: '4 BR' },
                { value: '5+', label: '5+ BR' }
              ]}
            />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormTextField
              label="Price Min"
              type="number"
              value={filters.priceMin}
              onChange={handleFilterChange('priceMin')}
              InputProps={{ startAdornment: '$' }}
            />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormTextField
              label="Price Max"
              type="number"
              value={filters.priceMax}
              onChange={handleFilterChange('priceMax')}
              InputProps={{ startAdornment: '$' }}
            />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormTextField
              label="Payment Min"
              type="number"
              value={filters.paymentMin}
              onChange={handleFilterChange('paymentMin')}
              InputProps={{ startAdornment: '$' }}
            />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormTextField
              label="Payment Max"
              type="number"
              value={filters.paymentMax}
              onChange={handleFilterChange('paymentMax')}
              InputProps={{ startAdornment: '$' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Inventory Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 2
      }}>
        {filteredInventory.length > 0 ? (
          filteredInventory.map(home => (
            <Card key={home.id} sx={{ position: 'relative', backgroundColor: 'customColors.cardBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              {/* Selection Circle */}
              <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
                <Radio
                  checked={selectedHomes.includes(home.id)}
                  onChange={() => handleToggleHome(home.id)}
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    '&.Mui-checked': { color: 'primary.main' },
                    p: 0
                  }}
                />
              </Box>
              <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                {/* Model Name */}
                <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24, mb: 2 }}>
                  {home.model || 'Model Not Set'}
                </Typography>
                
                {/* Bed/Bath and Sq Ft */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {home.bedrooms || '-'} BR / {home.bathrooms || '-'} BA
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {home.squareFeet || '-'} Sq FT
                  </Typography>
                </Box>

                {/* Price and Availability */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 18 }}>
                    {home.salesPrice ? `$${parseFloat(home.salesPrice).toLocaleString()}` : 'Price TBD'}
                  </Typography>
                  <Typography sx={{ color: getAvailabilityColor(home.availabilityStatus), fontWeight: 700, fontSize: 14 }}>
                    {getAvailabilityLabel(home.availabilityStatus)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.disabled', fontSize: 16 }}>
              {inventory.length === 0 ? 'No inventory available' : 'No homes match the current filters'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default GamePlan;



