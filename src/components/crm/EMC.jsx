import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Checkbox,
  FormControlLabel,
  Switch,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import { FormSelect } from '../FormField';

function EMC({ companyId: propCompanyId, prospectId, isDeal }) {
  const { userProfile } = useUser();
  const companyId = propCompanyId || userProfile?.companyId;
  const [inventory, setInventory] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [masterPricing, setMasterPricing] = useState({ single: {}, double: {}, triple: {}, tiny: {}, used: {} });
  const [selectedOptions, setSelectedOptions] = useState({
    deliverySetup: false,
    ac: false,
    steps: false,
    trimOut: false,
    skirting: false,
    pad: false
  });
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generating, setGenerating] = useState(false);
  const [emcGenerated, setEmcGenerated] = useState(false);
  const [orderType, setOrderType] = useState(null); // 'stock' or 'special'
  const [activeTab, setActiveTab] = useState(0); // For Options/Colors/Land Improvements tabs

  useEffect(() => {
    const effectiveCompanyId = companyId || userProfile?.companyId;
    const effectiveLocationId = userProfile?.locationId;

    if (!effectiveCompanyId || !effectiveLocationId) return;

    console.log('EMC - Loading inventory for company:', effectiveCompanyId, 'location:', effectiveLocationId);

    // Load inventory - filtered by user's location
    const inventoryQuery = query(collection(db, 'companies', effectiveCompanyId, 'inventory'));
    const unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('EMC - All inventory loaded:', inventoryData.length);
      // Filter by user's location and status
      const filteredInventory = inventoryData.filter(
        item => item.status === 'stock' && item.locationId === effectiveLocationId
      );
      console.log('EMC - Filtered inventory:', filteredInventory.length);
      setInventory(filteredInventory);
    });

    // Load master pricing - from user's location
    const loadMasterPricing = async () => {
      try {
        const docRef = doc(db, 'companies', effectiveCompanyId, 'locations', effectiveLocationId, 'settings', 'masterPricing');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMasterPricing(docSnap.data());
        } else {
          // Use default pricing if location pricing doesn't exist
          setMasterPricing({ single: {}, double: {}, triple: {}, tiny: {}, used: {} });
        }
      } catch (error) {
        console.error('Error loading master pricing:', error);
      }
    };

    loadMasterPricing();

    return () => unsubscribeInventory();
  }, [companyId, userProfile?.companyId, userProfile?.locationId]);

  // Load saved EMC data if in prospect portal - use real-time listener
  useEffect(() => {
    if (!prospectId || !companyId) {
      console.log('EMC - No prospectId or companyId, skipping EMC data load');
      return;
    }

    console.log('EMC - Setting up real-time listener for prospect:', prospectId);
    const collectionName = isDeal ? 'deals' : 'prospects';
    const docRef = doc(db, 'companies', companyId, collectionName, prospectId);
    
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('EMC - Prospect document loaded, emc data:', data.emc);
        
        if (data.emc) {
          // Load saved home if still available
          if (data.emc.homeId) {
            try {
              const homeRef = doc(db, 'companies', companyId, 'inventory', data.emc.homeId);
              const homeSnap = await getDoc(homeRef);
              if (homeSnap.exists()) {
                const homeData = { id: homeSnap.id, ...homeSnap.data() };
                console.log('EMC - Home loaded from inventory:', homeData);
                setSelectedHome(homeData);
              } else {
                console.log('EMC - Home not found in inventory');
              }
            } catch (error) {
              console.error('EMC - Error loading home:', error);
            }
          }
          // Load saved options
          if (data.emc.selectedOptions) {
            console.log('EMC - Loading saved options:', data.emc.selectedOptions);
            setSelectedOptions(data.emc.selectedOptions);
          }
          // Mark as generated if it exists
          setEmcGenerated(true);
          // Load order type
          if (data.emc.orderType) {
            console.log('EMC - Order type:', data.emc.orderType);
            setOrderType(data.emc.orderType);
          }
        } else {
          console.log('EMC - No EMC data in prospect document');
        }
      } else {
        console.log('EMC - Prospect document does not exist');
      }
    }, (error) => {
      console.error('EMC - Error in snapshot listener:', error);
    });

    return () => {
      console.log('EMC - Cleaning up listener');
      unsubscribe();
    };
  }, [prospectId, companyId, isDeal]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedHome) return 0;

    // Use 'type' field for pricing lookup (single, double, triple, tiny, used)
    const homeType = selectedHome.type || selectedHome.width || 'single';
    const pricing = masterPricing[homeType] || {};
    let total = selectedHome.invoice || 0;

    // Apply markup percentage to invoice
    const markupPercent = selectedHome.markupPercent || 0;
    total = total * (1 + (markupPercent / 100));

    // Add selected options
    Object.entries(selectedOptions).forEach(([option, selected]) => {
      if (selected && pricing[option]) {
        total += pricing[option];
      }
    });

    return Math.round(total);
  }, [selectedHome, selectedOptions, masterPricing]);

  const handleHomeSelect = (home) => {
    setSelectedHome(home);
    // Reset options when changing homes
    setSelectedOptions({
      deliverySetup: false,
      ac: false,
      steps: false,
      trimOut: false,
      skirting: false,
      pad: false
    });
  };

  const handleOptionChange = (option) => (event) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: event.target.checked
    }));
  };

  const handleGenerateEMC = async () => {
    if (!selectedHome || !prospectId) {
      setSnackbar({ open: true, message: 'Please select a home and ensure prospect is loaded', severity: 'error' });
      return;
    }
    
    setGenerating(true);
    try {
      console.log('Generate EMC - Starting...');
      console.log('Generate EMC - Selected home:', selectedHome);
      console.log('Generate EMC - Prospect ID:', prospectId);
      console.log('Generate EMC - Company ID:', companyId);
      
      const homeType = selectedHome.type || selectedHome.width || 'single';
      const collectionName = 'prospects'; // Always use prospects collection
      
      console.log('Generate EMC - Collection:', collectionName);
      console.log('Generate EMC - Home type:', homeType);
      
      // Save EMC data to prospect/deal document
      const prospectRef = doc(db, 'companies', companyId, collectionName, prospectId);
      console.log('Generate EMC - Saving to path:', `companies/${companyId}/${collectionName}/${prospectId}`);
      
      await updateDoc(prospectRef, {
        emc: {
          homeId: selectedHome.id,
          homeDetails: {
            factory: selectedHome.factory,
            model: selectedHome.model,
            serialNumber: selectedHome.serialNumber || selectedHome.serialNumber1,
            type: homeType,
            size: selectedHome.size,
            bedrooms: selectedHome.bedrooms,
            bathrooms: selectedHome.bathrooms,
            squareFeet: selectedHome.squareFeet,
            salesPrice: selectedHome.salesPrice,
            invoice: selectedHome.invoice,
            markupPercent: selectedHome.markupPercent,
            year: selectedHome.year
          },
          selectedOptions: selectedOptions,
          totalPrice: totalPrice,
          generatedAt: serverTimestamp(),
          generatedBy: userProfile?.email || 'system',
          isPending: false,
          orderType: null
        },
        updatedAt: serverTimestamp()
      });
      console.log('Generate EMC - Prospect document updated successfully');

      // Create document record
      console.log('Generate EMC - Creating document record...');
      await addDoc(collection(db, 'companies', companyId, collectionName, prospectId, 'documents'), {
        name: `EMC - ${selectedHome.factory} ${selectedHome.model}`,
        category: 'home-documents',
        type: 'emc',
        homeId: selectedHome.id,
        homeDetails: {
          factory: selectedHome.factory,
          model: selectedHome.model,
          serialNumber: selectedHome.serialNumber || selectedHome.serialNumber1,
          type: homeType,
          size: selectedHome.size,
          bedBath: selectedHome.bedBath,
          squareFeet: selectedHome.squareFeet,
          salesPrice: selectedHome.salesPrice,
          invoice: selectedHome.invoice,
          markupPercent: selectedHome.markupPercent
        },
        selectedOptions: selectedOptions,
        totalPrice: totalPrice,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system'
      });
      console.log('Generate EMC - Document record created successfully');
      console.log('Generate EMC - All operations complete, showing success message');

      setSnackbar({ open: true, message: 'Build saved successfully!', severity: 'success' });
      setEmcGenerated(true);
      console.log('Generate EMC - Complete! EMC generated flag set to true');
      console.log('==========================================');
    } catch (error) {
      console.error('Error generating EMC:', error);
      setSnackbar({ open: true, message: 'Error saving build: ' + error.message, severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPending = async (type) => {
    if (!selectedHome || !prospectId) {
      setSnackbar({ open: true, message: 'Please select a home and save build first', severity: 'error' });
      return;
    }
    
    try {
      console.log('Mark as pending - Type:', type);
      console.log('Mark as pending - Home ID:', selectedHome.id);
      console.log('Mark as pending - Prospect ID:', prospectId);
      console.log('Mark as pending - Company ID:', companyId);

      // Update inventory status to "pending"
      const inventoryRef = doc(db, 'companies', companyId, 'inventory', selectedHome.id);
      await updateDoc(inventoryRef, {
        availabilityStatus: 'pending',
        reservedFor: prospectId,
        reservedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Mark as pending - Inventory updated');

      // Update EMC data to mark as pending with order type
      const collectionName = isDeal ? 'deals' : 'prospects';
      const prospectRef = doc(db, 'companies', companyId, collectionName, prospectId);
      
      console.log('Mark as pending - Updating prospect at path:', `companies/${companyId}/${collectionName}/${prospectId}`);
      
      await updateDoc(prospectRef, {
        'emc.isPending': true,
        'emc.orderType': type,
        'emc.markedPendingAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Mark as pending - Prospect updated with orderType:', type);

      setOrderType(type);
      const message = type === 'stock' 
        ? 'Home marked as Stock Pending successfully!' 
        : 'Home marked as Special Order successfully!';
      setSnackbar({ open: true, message, severity: 'success' });
    } catch (error) {
      console.error('Error marking as pending:', error);
      setSnackbar({ open: true, message: 'Error marking as pending: ' + error.message, severity: 'error' });
    }
  };

  const handleClearHome = async () => {
    if (!prospectId || !confirm('Are you sure you want to clear the selected home? This will unmark it as pending.')) {
      return;
    }

    try {
      // If home was marked pending, unmark it
      if (selectedHome && selectedHome.availabilityStatus === 'pending') {
        const inventoryRef = doc(db, 'companies', companyId, 'inventory', selectedHome.id);
        await updateDoc(inventoryRef, {
          availabilityStatus: 'available',
          reservedFor: null,
          reservedAt: null,
          updatedAt: serverTimestamp()
        });
      }

      // Clear EMC data from prospect/deal
      const collectionName = isDeal ? 'deals' : 'prospects';
      const prospectRef = doc(db, 'companies', companyId, collectionName, prospectId);
      await updateDoc(prospectRef, {
        emc: null,
        updatedAt: serverTimestamp()
      });

      // Reset state
      setSelectedHome(null);
      setSelectedOptions({
        deliverySetup: false,
        ac: false,
        steps: false,
        trimOut: false,
        skirting: false,
        pad: false
      });
      setEmcGenerated(false);
      setOrderType(null);

      setSnackbar({ open: true, message: 'Home cleared and unmarked successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error clearing home:', error);
      setSnackbar({ open: true, message: 'Error clearing home: ' + error.message, severity: 'error' });
    }
  };

  const handlePrintContract = () => {
    setContractDialogOpen(true);
  };

  const generateContract = () => {
    const printWindow = window.open('', '_blank');
    const homeType = selectedHome.type || selectedHome.width || 'single';
    const pricing = masterPricing[homeType] || {};

    const selectedOptionsList = Object.entries(selectedOptions)
      .filter(([_, selected]) => selected)
      .map(([option, _]) => {
        const optionNames = {
          deliverySetup: 'Delivery & Setup',
          ac: 'A/C Installation',
          steps: 'Steps',
          trimOut: 'Trim Out',
          skirting: 'Skirting',
          pad: 'Pad/Site Prep'
        };
        return optionNames[option] || option;
      });

    const contractHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EMC - ${selectedHome.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .home-details { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .options-list { background: #f9f9f9; padding: 15px; border-left: 4px solid #1976d2; }
            .total { font-size: 18px; font-weight: bold; color: #1976d2; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; }
            .signature { margin-top: 50px; border-top: 1px solid #000; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EARnest Money Contract</h1>
            <h2>Manufactured Home Purchase Agreement</h2>
          </div>

          <div class="section">
            <h3>Home Details</h3>
            <div class="home-details">
              <p><strong>Home:</strong> ${selectedHome.name}</p>
              <p><strong>Model:</strong> ${selectedHome.model || 'N/A'}</p>
              <p><strong>Factory:</strong> ${selectedHome.factory || 'N/A'}</p>
              <p><strong>Size:</strong> ${selectedHome.widthLength || selectedHome.size || 'N/A'}</p>
              <p><strong>Bedrooms/Bathrooms:</strong> ${selectedHome.bedrooms || '-'}/${selectedHome.bathrooms || '-'}</p>
              <p><strong>Square Feet:</strong> ${selectedHome.squareFeet ? selectedHome.squareFeet.toLocaleString() : 'N/A'}</p>
              <p><strong>Type:</strong> ${homeType.charAt(0).toUpperCase() + homeType.slice(1)} ${homeType !== 'tiny' && homeType !== 'used' ? 'Wide' : ''}</p>
              <p><strong>Wall R-Value:</strong> ${selectedHome.wallRValue || 'N/A'}</p>
              <p><strong>Wall Thickness:</strong> ${selectedHome.wallThickness || 'N/A'}</p>
            </div>
          </div>

          <div class="section">
            <h3>Selected Options</h3>
            <div class="options-list">
              ${selectedOptionsList.length > 0
                ? selectedOptionsList.map(option => `<div>• ${option}</div>`).join('')
                : '<div>No additional options selected</div>'
              }
            </div>
          </div>

          <div class="section">
            <h3>MSRP Reference (For Review Only)</h3>
            <div class="options-list">
              <div><strong>MSRP:</strong> $${totalPrice.toFixed(2)} (Manufacturer's Suggested Retail Price)</div>
              <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 3px;">
                <strong>Note:</strong> The final discounted price should be written in below by the salesperson.
              </div>
            </div>
          </div>

          <div class="total">
            <div>Final Purchase Price: $____________________</div>
          </div>

          <div class="section">
            <h3>Terms & Conditions</h3>
            <div class="options-list">
              <div>• Earnest money deposit of $500.00 due upon signing</div>
              <div>• Balance due at closing</div>
              <div>• All sales are final - no returns</div>
              <div>• Delivery timeframe: 4-6 weeks from deposit</div>
              <div>• Setup included in delivery price</div>
            </div>
          </div>

          <div class="signature">
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
              <div style="width: 45%; text-align: center;">
                <div style="border-bottom: 1px solid #000; margin-bottom: 10px;"></div>
                <div>Buyer Signature</div>
                <div style="font-size: 12px; color: #666;">Date: _______________</div>
              </div>
              <div style="width: 45%; text-align: center;">
                <div style="border-bottom: 1px solid #000; margin-bottom: 10px;"></div>
                <div>Sales Representative</div>
                <div style="font-size: 12px; color: #666;">Date: _______________</div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #666;">
            This contract is binding upon signature. Please read all terms carefully.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(contractHTML);
    printWindow.document.close();
    printWindow.print();

    setContractDialogOpen(false);
    setSnackbar({ open: true, message: 'Contract opened for printing', severity: 'success' });
  };

  const availableOptions = [
    { key: 'deliverySetup', label: 'Delivery & Setup', description: 'Transportation and initial setup' },
    { key: 'ac', label: 'A/C Installation', description: 'Air conditioning installation' },
    { key: 'steps', label: 'Steps', description: 'Entry steps installation' },
    { key: 'trimOut', label: 'Trim Out', description: 'Interior trim and finishing' },
    { key: 'skirting', label: 'Skirting', description: 'Exterior skirting installation' },
    { key: 'pad', label: 'Pad/Site Prep', description: 'Site preparation and pad' }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Section: Dropdown & Selected Home Card */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: Home Selection */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <FormSelect
            label="Select Home from Inventory"
            value={selectedHome?.id || ''}
            onChange={(e) => {
              const homeId = e.target.value;
              const home = inventory.find(h => h.id === homeId);
              if (home) {
                handleHomeSelect(home);
              }
            }}
            options={inventory.map(home => {
              const homeType = home.type || home.width || 'single';
              const typeLabel = homeType.charAt(0).toUpperCase() + homeType.slice(1);
              const typeDisplay = homeType !== 'tiny' && homeType !== 'used' ? `${typeLabel}-Wide` : typeLabel;
              return {
                value: home.id,
                label: `${home.factory} ${home.model} - ${home.bedrooms || '-'}BR/${home.bathrooms || '-'}BA - ${typeDisplay}`
              };
            })}
          />
          {inventory.length === 0 && (
            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 14 }}>
              No homes available in inventory
            </Typography>
          )}
        </Box>

        {/* Right: Selected Home Card */}
        {selectedHome && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: 3, backgroundColor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 2, textAlign: 'center' }}>
                {selectedHome.factory} {selectedHome.model}
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Serial:</Typography>
                  <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{selectedHome.serialNumber || selectedHome.serialNumber1 || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Bed/Bath:</Typography>
                  <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{selectedHome.bedrooms || '-'}BR / {selectedHome.bathrooms || '-'}BA</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Square Feet:</Typography>
                  <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{selectedHome.squareFeet?.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: 'customColors.calendarBorder' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'text.primary', fontSize: 16, fontWeight: 600 }}>Total Price:</Typography>
                  <Typography sx={{ color: 'primary.main', fontSize: 20, fontWeight: 700 }}>${totalPrice.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>

      {/* Bottom Section: Tabs */}
      {selectedHome && (
        <Box>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              mb: 3,
              borderBottom: '1px solid',
              borderColor: 'customColors.calendarBorder',
              '& .MuiTab-root': { color: 'text.secondary', textTransform: 'none', fontSize: 15, fontWeight: 600 },
              '& .MuiTab-root.Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3 }
            }}
          >
            <Tab label="Options" />
            <Tab label="Colors" />
            <Tab label="Land Improvements" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ minHeight: 300 }}>
            {/* Options Tab */}
            {activeTab === 0 && (
              <Stack spacing={2}>
                {availableOptions.map((option) => (
                  <Box key={option.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: 15 }}>
                        {option.label}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {option.description}
                      </Typography>
                    </Box>
                    <Switch
                      checked={selectedOptions[option.key]}
                      onChange={handleOptionChange(option.key)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'success.main',
                          '& + .MuiSwitch-track': { backgroundColor: 'success.main' }
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            {/* Colors Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.disabled', fontSize: 16 }}>
                  Color selection coming soon
                </Typography>
              </Box>
            )}

            {/* Land Improvements Tab */}
            {activeTab === 2 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.disabled', fontSize: 16 }}>
                  Land improvements coming soon
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          {prospectId && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              {!emcGenerated ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleGenerateEMC}
                  disabled={generating}
                >
                  {generating ? 'Saving...' : 'Save Build'}
                </Button>
              ) : !orderType ? (
                <>
                  <Button variant="contained" color="warning" onClick={() => handleMarkAsPending('stock')}>
                    Mark Stock Pending
                  </Button>
                  <Button variant="contained" color="info" onClick={() => handleMarkAsPending('special')}>
                    Mark Special Order
                  </Button>
                </>
              ) : (
                <Chip
                  label={orderType === 'stock' ? 'Stock Pending ✓' : 'Special Order ✓'}
                  color="success"
                  sx={{ fontSize: 14, fontWeight: 600, py: 2.5, px: 2 }}
                />
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Contract Preview Dialog */}
      <Dialog
        open={contractDialogOpen}
        onClose={() => setContractDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Print Home Selection Agreement</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will generate an agreement showing the MSRP (Manufacturer's Suggested Retail Price) for review. You can then write in your discounted price when printing the final document.
          </Typography>
          <Stack spacing={1} sx={{ ml: 2 }}>
            <Typography variant="body2">• Home details and specifications</Typography>
            <Typography variant="body2">• Selected options</Typography>
            <Typography variant="body2">• MSRP pricing (for reference)</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialogOpen(false)}>Cancel</Button>
          <Button onClick={generateContract} variant="contained" startIcon={<PrintIcon />}>
            Generate & Review Agreement
          </Button>
        </DialogActions>
      </Dialog>

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
  );
}

export default EMC;
