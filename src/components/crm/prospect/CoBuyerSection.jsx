import React, { useState } from 'react';
import { Paper, Stack, Typography, Button as MuiButton, Box, MenuItem, Select, FormControl, IconButton, Collapse } from '@mui/material';
import { Edit as EditIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { FormTextField, FormGrid, FormGridItem } from '../../FormField';
import { maskSSN } from '../../../utils/formatters';
import { US_STATES, RACE_OPTIONS, GENDER_OPTIONS } from '../../../constants/prospectConstants';

export const CoBuyerSection = ({
  coBuyerInfo,
  setCoBuyerInfo,
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
    setCoBuyerInfo({ ...coBuyerInfo, ssn: digits });
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
            Co-Buyer Information
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {!isEditing ? (
            <IconButton onClick={() => setIsEditing(true)} sx={{ color: 'text.primary' }} aria-label="edit co-buyer information">
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
              value={coBuyerInfo.firstName || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Middle Name"
              value={coBuyerInfo.middleName || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, middleName: e.target.value })}
              placeholder="Enter middle name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Last Name"
              value={coBuyerInfo.lastName || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Phone Number"
              type="tel"
              value={coBuyerInfo.phone || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="Email Address"
              type="email"
              value={coBuyerInfo.email || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, email: e.target.value })}
              placeholder="Enter email address"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="SSN (Last 4)"
              value={coBuyerInfo.ssn || ''}
              onChange={(e) => handleSSNChange(e.target.value)}
              placeholder="Enter full SSN"
              inputProps={{ maxLength: 9 }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="Date of Birth"
              type="date"
              value={coBuyerInfo.dob || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, dob: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>Gender</Typography>
              <Select
                value={coBuyerInfo.gender || ''}
                onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, gender: e.target.value })}
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
                value={coBuyerInfo.race || ''}
                onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, race: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {RACE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Driver License #"
              value={coBuyerInfo.licenseNumber || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, licenseNumber: e.target.value })}
              placeholder="Enter license number"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>License State</Typography>
              <Select
                value={coBuyerInfo.licenseState || ''}
                onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, licenseState: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={8}>
            <FormTextField
              label="Current Address"
              value={coBuyerInfo.streetAddress || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, streetAddress: e.target.value })}
              placeholder="Enter street address"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={4}>
            <FormTextField
              label="City"
              value={coBuyerInfo.city || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, city: e.target.value })}
              placeholder="Enter city"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, mb: 0.5 }}>State</Typography>
              <Select
                value={coBuyerInfo.state || ''}
                onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, state: e.target.value })}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </FormGridItem>
          <FormGridItem xs={12} sm={3} md={2}>
            <FormTextField
              label="Zip Code"
              value={coBuyerInfo.zip || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, zip: e.target.value })}
              placeholder="Enter zip code"
              inputProps={{ maxLength: 10 }}
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Home Phone"
              type="tel"
              value={coBuyerInfo.homePhone || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, homePhone: e.target.value })}
              placeholder="Enter home phone"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Work Phone"
              type="tel"
              value={coBuyerInfo.workPhone || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, workPhone: e.target.value })}
              placeholder="Enter work phone"
            />
          </FormGridItem>
          <FormGridItem xs={12} sm={6} md={3}>
            <FormTextField
              label="Annual Income"
              type="number"
              value={coBuyerInfo.annualIncome || ''}
              onChange={(e) => setCoBuyerInfo({ ...coBuyerInfo, annualIncome: e.target.value })}
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
              <TopLabeled label="Full Name">{show([coBuyerInfo.firstName, coBuyerInfo.middleName, coBuyerInfo.lastName].filter(Boolean).join(' '))}</TopLabeled>
              <TopLabeled label="Phone">{show(coBuyerInfo.phone)}</TopLabeled>
              <TopLabeled label="Email">{show(coBuyerInfo.email)}</TopLabeled>
              <TopLabeled label="Date of Birth">{show(coBuyerInfo.dob)}</TopLabeled>
              <TopLabeled label="Gender">{show(coBuyerInfo.gender === 'M' ? 'Male' : coBuyerInfo.gender === 'F' ? 'Female' : '')}</TopLabeled>
            </Stack>
          </Box>

          {/* Address & Personal Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Address & Personal
            </Typography>
            <Stack spacing={1.25}>
              <TopLabeled label="Street Address">{show(coBuyerInfo.streetAddress)}</TopLabeled>
              <TopLabeled label="City, State, ZIP">{show([coBuyerInfo.city, coBuyerInfo.state, coBuyerInfo.zip].filter(Boolean).join(', '))}</TopLabeled>
              <TopLabeled label="SSN (Last 4)">{show(maskSSN(coBuyerInfo.ssn))}</TopLabeled>
              <TopLabeled label="Race">{show(coBuyerInfo.race)}</TopLabeled>
            </Stack>
          </Box>

          {/* Additional Details Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Additional Details
            </Typography>
            <Stack spacing={1.25}>
              <TopLabeled label="Driver License #">{show(coBuyerInfo.licenseNumber)}</TopLabeled>
              <TopLabeled label="License State">{show(coBuyerInfo.licenseState)}</TopLabeled>
              <TopLabeled label="Home Phone">{show(coBuyerInfo.homePhone)}</TopLabeled>
              <TopLabeled label="Work Phone">{show(coBuyerInfo.workPhone)}</TopLabeled>
              <TopLabeled label="Annual Income">{show(coBuyerInfo.annualIncome ? `$${Number(coBuyerInfo.annualIncome).toLocaleString()}` : '')}</TopLabeled>
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



