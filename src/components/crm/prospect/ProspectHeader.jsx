import React, { useState } from 'react';
import { Paper, Stack, Typography, Button as MuiButton, Box, MenuItem, Select, FormControl, IconButton, Collapse } from '@mui/material';
import { Edit as EditIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { FormTextField, FormGrid, FormGridItem } from '../../FormField';
import { maskSSN } from '../../../utils/formatters';
import { US_STATES, RACE_OPTIONS, GENDER_OPTIONS } from '../../../constants/prospectConstants';

export const ProspectHeader = ({
  buyerInfo,
  setBuyerInfo,
  isEditing,
  setIsEditing,
  onSave,
  saving
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleSave = async () => {
    await onSave();
  };

  const handleSSNChange = (value) => {
    const digits = value.replace(/\D/g, '');
    setBuyerInfo({ ...buyerInfo, ssn: digits });
  };

  const notSet = <Typography component="span" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15 }}>Not specified</Typography>;
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : notSet;

  return (
    <Paper elevation={6} sx={{ backgroundColor: 'customColors.calendarHeaderBackground', p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 1.5 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <IconButton 
            onClick={() => setExpanded(!expanded)} 
            sx={{ 
              color: 'text.primary',
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.3s'
            }}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
            Buyer Information
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {!isEditing ? (
            <IconButton onClick={() => setIsEditing(true)} sx={{ color: 'text.primary' }} aria-label="edit buyer information">
              <EditIcon />
            </IconButton>
          ) : (
            <>
              <MuiButton onClick={handleSave} disabled={saving} size="small" variant="contained" color="success">Save</MuiButton>
              <MuiButton onClick={() => setIsEditing(false)} size="small" variant="outlined" sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}>Cancel</MuiButton>
            </>
          )}
        </Stack>
      </Box>

      <Collapse in={expanded} timeout="auto">
        <Box sx={{ pt: expanded ? 0 : 0 }}>

      {isEditing ? (
        <FormGrid spacing={2}>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="First Name"
              value={buyerInfo.firstName || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Middle Name"
              value={buyerInfo.middleName || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, middleName: e.target.value })}
              placeholder="Enter middle name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Last Name"
              value={buyerInfo.lastName || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Phone Number"
              type="tel"
              value={buyerInfo.phone || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="Email Address"
              type="email"
              value={buyerInfo.email || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
              placeholder="Enter email address"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="SSN (Last 4)"
              value={buyerInfo.ssn || ''}
              onChange={(e) => handleSSNChange(e.target.value)}
              placeholder="Enter full SSN"
              inputProps={{ maxLength: 9 }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="Date of Birth"
              type="date"
              value={buyerInfo.dob || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, dob: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>Gender</Typography>
              <Select
                value={buyerInfo.gender || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, gender: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {GENDER_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>Race</Typography>
              <Select
                value={buyerInfo.race || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, race: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {RACE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Driver License #"
              value={buyerInfo.licenseNumber || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, licenseNumber: e.target.value })}
              placeholder="Enter license number"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>License State</Typography>
              <Select
                value={buyerInfo.licenseState || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, licenseState: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={8}>
            <FormTextField
              label="Current Address"
              value={buyerInfo.streetAddress || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, streetAddress: e.target.value })}
              placeholder="Enter street address"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="City"
              value={buyerInfo.city || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, city: e.target.value })}
              placeholder="Enter city"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>State</Typography>
              <Select
                value={buyerInfo.state || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, state: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={3} md={2}>
            <FormTextField
              label="ZIP Code"
              value={buyerInfo.zip || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, zip: e.target.value })}
              placeholder="Enter ZIP code"
              inputProps={{ maxLength: 10 }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Home Phone"
              type="tel"
              value={buyerInfo.homePhone || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, homePhone: e.target.value })}
              placeholder="Enter home phone"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Work Phone"
              type="tel"
              value={buyerInfo.workPhone || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, workPhone: e.target.value })}
              placeholder="Enter work phone"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Annual Income"
              type="number"
              value={buyerInfo.annualIncome || ''}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, annualIncome: e.target.value })}
              placeholder="Enter annual income"
            />
          </FormGridItem>
        </FormGrid>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Contact Information Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contact Information
            </Typography>
            <Stack spacing={1.25}>
              <TopLabeled label="Full Name">{show([buyerInfo.firstName, buyerInfo.middleName, buyerInfo.lastName].filter(Boolean).join(' '))}</TopLabeled>
              <TopLabeled label="Phone">{show(buyerInfo.phone)}</TopLabeled>
              <TopLabeled label="Email">{show(buyerInfo.email)}</TopLabeled>
              <TopLabeled label="Date of Birth">{show(buyerInfo.dob)}</TopLabeled>
              <TopLabeled label="Gender">{show(buyerInfo.gender === 'M' ? 'Male' : buyerInfo.gender === 'F' ? 'Female' : '')}</TopLabeled>
            </Stack>
          </Box>

          {/* Address & Personal Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Address & Personal
            </Typography>
            <Stack spacing={1.25}>
              <TopLabeled label="Street Address">{show(buyerInfo.streetAddress)}</TopLabeled>
              <TopLabeled label="City, State, ZIP">{show([buyerInfo.city, buyerInfo.state, buyerInfo.zip].filter(Boolean).join(', '))}</TopLabeled>
              <TopLabeled label="SSN (Last 4)">{show(maskSSN(buyerInfo.ssn))}</TopLabeled>
              <TopLabeled label="Race">{show(buyerInfo.race)}</TopLabeled>
            </Stack>
          </Box>

          {/* Additional Details Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Additional Details
            </Typography>
            <Stack spacing={1.25}>
              <TopLabeled label="Driver License #">{show(buyerInfo.licenseNumber)}</TopLabeled>
              <TopLabeled label="License State">{show(buyerInfo.licenseState)}</TopLabeled>
              <TopLabeled label="Home Phone">{show(buyerInfo.homePhone)}</TopLabeled>
              <TopLabeled label="Work Phone">{show(buyerInfo.workPhone)}</TopLabeled>
              <TopLabeled label="Annual Income">{show(buyerInfo.annualIncome ? `$${Number(buyerInfo.annualIncome).toLocaleString()}` : '')}</TopLabeled>
            </Stack>
          </Box>
        </Box>
      )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// TopLabeled component matching Housing Needs style
function TopLabeled({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 17 }, '& .MuiSelect-select': { fontSize: 17 } }}>
        {children}
      </Box>
    </Stack>
  );
}
