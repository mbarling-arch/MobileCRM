import React, { useState } from 'react';
import { Box, Paper, Typography, Stack, Divider, IconButton, Button, TextField, MenuItem } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { labelize } from '../../../utils/prospectHelpers';
import { CONTACT_PREFERENCES } from '../../../constants/prospectConstants';

const TopLabeled = ({ label, children }) => {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
      <Box>
        {children}
      </Box>
    </Stack>
  );
};

export const ProspectTopSection = ({ buyerInfo, coBuyerInfo, setBuyerInfo, setCoBuyerInfo, saveBuyerInfo, saveCoBuyerInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.disabled', fontSize: 14 }}>—</Typography>;

  const buyer = buyerInfo || {};
  const coBuyer = coBuyerInfo || {};

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBuyerInfo();
      await saveCoBuyerInfo();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper 
        elevation={6} 
        sx={{ 
          backgroundColor: 'customColors.calendarHeaderBackground',
          border: '1px solid',
          borderColor: 'customColors.calendarBorder',
          borderRadius: 4,
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Contact Information Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, position: 'relative' }}>
            {/* Edit Button - Absolute Top Right */}
            <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
              {!isEditing ? (
                <IconButton 
                  size="small" 
                  onClick={() => setIsEditing(true)}
                  sx={{ color: 'text.secondary' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Buyer Column */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: 13, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Buyer
              </Typography>
              {!isEditing ? (
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><TopLabeled label="First">{show(buyer.firstName)}</TopLabeled></Box>
                  <Box sx={{ flex: 1 }}><TopLabeled label="Middle">{show(buyer.middleName)}</TopLabeled></Box>
                  <Box sx={{ flex: 1 }}><TopLabeled label="Last">{show(buyer.lastName)}</TopLabeled></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><TopLabeled label="Phone">{show(buyer.phone)}</TopLabeled></Box>
                  <Box sx={{ flex: 1 }}><TopLabeled label="Email">{show(buyer.email)}</TopLabeled></Box>
                  <Box sx={{ flex: 1 }}><TopLabeled label="Preferred Contact">{show(labelize(buyer.preferredContact))}</TopLabeled></Box>
                </Box>
                <TopLabeled label="Address">{show(buyer.streetAddress ? `${buyer.streetAddress}, ${buyer.city || ''} ${buyer.state || ''} ${buyer.zip || ''}`.trim() : null)}</TopLabeled>
              </Stack>
              ) : (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="First" value={buyer.firstName || ''} onChange={(e) => setBuyerInfo({ ...buyer, firstName: e.target.value })} fullWidth />
                    <TextField size="small" label="Middle" value={buyer.middleName || ''} onChange={(e) => setBuyerInfo({ ...buyer, middleName: e.target.value })} fullWidth />
                    <TextField size="small" label="Last" value={buyer.lastName || ''} onChange={(e) => setBuyerInfo({ ...buyer, lastName: e.target.value })} fullWidth />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="Phone" value={buyer.phone || ''} onChange={(e) => setBuyerInfo({ ...buyer, phone: e.target.value })} fullWidth />
                    <TextField size="small" label="Email" value={buyer.email || ''} onChange={(e) => setBuyerInfo({ ...buyer, email: e.target.value })} fullWidth />
                    <TextField size="small" select label="Preferred Contact" value={buyer.preferredContact || ''} onChange={(e) => setBuyerInfo({ ...buyer, preferredContact: e.target.value })} fullWidth>
                      {CONTACT_PREFERENCES.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <TextField size="small" label="Street Address" value={buyer.streetAddress || ''} onChange={(e) => setBuyerInfo({ ...buyer, streetAddress: e.target.value })} fullWidth />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="City" value={buyer.city || ''} onChange={(e) => setBuyerInfo({ ...buyer, city: e.target.value })} fullWidth />
                    <TextField size="small" label="State" value={buyer.state || ''} onChange={(e) => setBuyerInfo({ ...buyer, state: e.target.value })} sx={{ width: 100 }} />
                    <TextField size="small" label="Zip" value={buyer.zip || ''} onChange={(e) => setBuyerInfo({ ...buyer, zip: e.target.value })} sx={{ width: 100 }} />
                  </Box>
                </Stack>
              )}
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Co-Buyer Column */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: 13, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Co-Buyer
              </Typography>
              {!isEditing ? (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}><TopLabeled label="First">{show(coBuyer.firstName)}</TopLabeled></Box>
                    <Box sx={{ flex: 1 }}><TopLabeled label="Middle">{show(coBuyer.middleName)}</TopLabeled></Box>
                    <Box sx={{ flex: 1 }}><TopLabeled label="Last">{show(coBuyer.lastName)}</TopLabeled></Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}><TopLabeled label="Phone">{show(coBuyer.phone)}</TopLabeled></Box>
                    <Box sx={{ flex: 1 }}><TopLabeled label="Email">{show(coBuyer.email)}</TopLabeled></Box>
                    <Box sx={{ flex: 1 }}><TopLabeled label="Preferred Contact">{show(labelize(coBuyer.preferredContact))}</TopLabeled></Box>
                  </Box>
                  <TopLabeled label="Address">{show(coBuyer.streetAddress ? `${coBuyer.streetAddress}, ${coBuyer.city || ''} ${coBuyer.state || ''} ${coBuyer.zip || ''}`.trim() : null)}</TopLabeled>
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="First" value={coBuyer.firstName || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, firstName: e.target.value })} fullWidth />
                    <TextField size="small" label="Middle" value={coBuyer.middleName || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, middleName: e.target.value })} fullWidth />
                    <TextField size="small" label="Last" value={coBuyer.lastName || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, lastName: e.target.value })} fullWidth />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="Phone" value={coBuyer.phone || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, phone: e.target.value })} fullWidth />
                    <TextField size="small" label="Email" value={coBuyer.email || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, email: e.target.value })} fullWidth />
                    <TextField size="small" select label="Preferred Contact" value={coBuyer.preferredContact || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, preferredContact: e.target.value })} fullWidth>
                      {CONTACT_PREFERENCES.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <TextField size="small" label="Street Address" value={coBuyer.streetAddress || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, streetAddress: e.target.value })} fullWidth />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="City" value={coBuyer.city || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, city: e.target.value })} fullWidth />
                    <TextField size="small" label="State" value={coBuyer.state || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, state: e.target.value })} sx={{ width: 100 }} />
                    <TextField size="small" label="Zip" value={coBuyer.zip || ''} onChange={(e) => setCoBuyerInfo({ ...coBuyer, zip: e.target.value })} sx={{ width: 100 }} />
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

