import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, TextField, Button, Grid, Chip, Tabs, Tab, Divider } from '@mui/material';
import { Save as SaveIcon, Home as HomeIcon } from '@mui/icons-material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';

const HomeLandInfoTab = ({ prospectId, userProfile, context, isDeal }) => {
  const { prospect } = context;
  const [emcData, setEmcData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Listen to real-time updates of the prospect/deal document
  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) return;

    console.log('HomeLandInfo - Setting up listener for prospect:', prospectId);
    const collectionName = isDeal ? 'deals' : 'prospects';
    const docRef = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('HomeLandInfo - Prospect updated, EMC data:', data.emc);
        if (data.emc) {
          setEmcData(data.emc);
        } else {
          setEmcData(null);
        }
      }
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, prospectId, isDeal]);

  const orderType = emcData?.orderType; // 'stock' or 'special'
  const homeDetails = emcData?.homeDetails;

  // If there's EMC data, show home information
  if (emcData && homeDetails) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* EMC Home Information */}
        <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <HomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
                Selected Home
              </Typography>
              <Chip 
                label={orderType === 'stock' ? 'Stock Pending' : 'Special Order'} 
                color={orderType === 'stock' ? 'warning' : 'info'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Stack>

          {orderType === 'stock' ? (
            // Full inventory data for Stock Pending
            <>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  mb: 3,
                  '& .MuiTab-root': { color: 'text.secondary' },
                  '& .MuiTab-root.Mui-selected': { color: 'text.primary' },
                  '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
                }}
              >
                <Tab label="Home Information" />
                <Tab label="Build Information" />
              </Tabs>

              {/* Home Information Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Factory"
                      value={homeDetails.factory || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={homeDetails.type || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Model"
                      value={homeDetails.model || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Size"
                      value={homeDetails.size || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Year"
                      value={homeDetails.year || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bedrooms"
                      value={homeDetails.bedrooms || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bathrooms"
                      value={homeDetails.bathrooms || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Square Feet"
                      value={homeDetails.squareFeet || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Invoice"
                      value={homeDetails.invoice ? `$${homeDetails.invoice}` : ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mark Up %"
                      value={homeDetails.markupPercent ? `${homeDetails.markupPercent}%` : ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Sales Price"
                      value={homeDetails.salesPrice ? `$${homeDetails.salesPrice}` : ''}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 600,
                          color: 'success.main'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Build Information Tab - Only show for Stock Pending */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Full build specifications are stored in inventory. View the selected home in Inventory Management for complete details.
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            // Limited data for Special Order
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Factory"
                  value={homeDetails.factory || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={homeDetails.model || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size"
                  value={homeDetails.size || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="B/B (Bed/Bath)"
                  value={homeDetails.bedBath || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Square Feet"
                  value={homeDetails.squareFeet || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* Land/Property Information Section */}
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
            Land/Property Details
          </Typography>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Property Address"
                value=""
              />
              <TextField
                fullWidth
                label="Lot Size (Acres)"
                type="number"
                value=""
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Zoning"
                value=""
              />
              <TextField
                fullWidth
                label="Property Taxes (Annual)"
                type="number"
                value=""
              />
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
          >
            Save Property Information
          </Button>
        </Box>
      </Box>
    );
  }

  // No EMC data - show basic form
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'customColors.cardBackground' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          No Home Selected
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Please select a home in the EMC tab to view home information here.
        </Typography>
      </Paper>

      {/* Land/Property Information Section */}
      <Paper sx={{ p: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
          Land/Property Details
        </Typography>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="Property Address"
              value=""
            />
            <TextField
              fullWidth
              label="Lot Size (Acres)"
              type="number"
              value=""
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="Zoning"
              value=""
            />
            <TextField
              fullWidth
              label="Property Taxes (Annual)"
              type="number"
              value=""
            />
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
        >
          Save Property Information
        </Button>
      </Box>
    </Box>
  );
};

export default HomeLandInfoTab;
