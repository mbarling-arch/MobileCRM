import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, IconButton, Button, Grid, TextField, MenuItem, Chip, Divider, FormControlLabel, Checkbox, Paper } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function HousingNeeds({ companyId, prospectId, initial }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultHousing());

  useEffect(() => {
    const init = { ...defaultHousing(), ...(initial || {}) };
    // Normalize multi-selects to arrays
    init.types = Array.isArray(init.types)
      ? init.types
      : Object.keys(init.types || {}).filter((k) => !!init.types?.[k]);
    init.dealTypes = Array.isArray(init.dealTypes)
      ? init.dealTypes
      : Object.keys(init.dealTypes || {}).filter((k) => !!init.dealTypes?.[k]);
    setForm(init);
  }, [initial]);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const handleNested = (group) => (e) => setForm((f) => ({ ...f, [group]: e.target.value }));

  const handleSave = async () => {
    if (!companyId || !prospectId) return;
    const ref = doc(db, 'companies', companyId, 'prospects', prospectId);
    await updateDoc(ref, { housing: form });
    setEditing(false);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header with Edit/Save buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
          Housing Needs
        </Typography>
        <Stack direction="row" spacing={1}>
          {!editing ? (
            <IconButton onClick={() => setEditing(true)} sx={{ color: 'white' }} aria-label="edit housing needs">
              <EditOutlinedIcon />
            </IconButton>
          ) : (
            <>
              <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }} size="small">
                Save
              </Button>
              <Button
                onClick={() => {
                  const init = { ...defaultHousing(), ...(initial || {}) };
                  init.types = Array.isArray(init.types) ? init.types : Object.keys(init.types||{}).filter(k=>init.types[k]);
                  init.dealTypes = Array.isArray(init.dealTypes)? init.dealTypes : Object.keys(init.dealTypes||{}).filter(k=>init.dealTypes[k]);
                  setForm(init);
                  setEditing(false);
                }}
                variant="outlined"
                size="small"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Cancel
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {!editing ? (
        <Display housing={form} />
      ) : (
        <EditForm form={form} onChange={handleChange} onNested={handleNested} />
      )}
    </Box>
  );
}

function Display({ housing }) {
  const notSet = <Typography component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: 16 }}>Not specified</Typography>;
  const show = (v) => v ? <Typography component="span" sx={{ color: 'white', fontSize: 16 }}>{v}</Typography> : notSet;
  const yesNo = (b) => b ? <Chip size="small" label="Yes" sx={{ bgcolor: 'rgba(0,255,127,0.15)', color: '#a6f3c0' }} /> : <Chip size="small" label="No" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Current Living Section */}
      <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Current Living
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Own/Rent">{show(labelize(housing.currentOwnRent))}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Current Payment">{show(currency(housing.currentMonthlyPayment))}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bed">{show(housing.currentBed)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bath">{show(housing.currentBath)}</TopLabeled></Grid>
          <Grid item xs={12}><TopLabeled label="Likes/Dislikes">{show(housing.likesDislikes)}</TopLabeled></Grid>
          <Grid item xs={12}><TopLabeled label="Address">{show(housing.currentAddress)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="City">{show(housing.addressCity)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="State">{show(housing.addressState)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Zip">{show(housing.addressZip)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="County">{show(housing.addressCounty)}</TopLabeled></Grid>
        </Grid>
      </Paper>

      {/* Home Preferences Section */}
      <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Home Preferences
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Home Type">{show(labelize(housing.homeType))}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bed">{show(housing.prefBed)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bath">{show(housing.prefBath)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Square Footage">{show(housing.prefSqft)}</TopLabeled></Grid>
          <Grid item xs={12}><TopLabeled label="Desired Features">{show(housing.desiredFeatures)}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Time Frame">{show(labelize(housing.timeFrame))}</TopLabeled></Grid>
        </Grid>
      </Paper>

      {/* Land Section */}
      <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Land
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Need Land">{show(housing.landNeed ? 'Yes' : (housing.landNeed===false ? 'No' : ''))}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Situation">{show(labelize(housing.landSituation))}</TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Lot Size">{show(labelize(housing.lotSize))}</TopLabeled></Grid>
          {housing.landNeed ? (
            <>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Desired Location">{show(housing.desiredLocation)}</TopLabeled></Grid>
              <Grid item xs={12}><TopLabeled label="Special Location Needs">{show(housing.specialLocationNeeds)}</TopLabeled></Grid>
            </>
          ) : null}
          <Grid item xs={12}>
            <TopLabeled label="Needed Improvements">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['water','sewer','electric','driveway','pad'].filter(k => housing.landImprovements?.[k]).map(k => (
                  <Chip key={k} label={labelize(k)} size="small" sx={{ bgcolor: 'rgba(0,255,127,0.15)', color: '#a6f3c0' }} />
                ))}
                {!Object.values(housing.landImprovements||{}).some(Boolean) && <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontStyle:'italic' }}>Not specified</Typography>}
              </Stack>
            </TopLabeled>
          </Grid>
        </Grid>
      </Paper>

      {/* Financials Section */}
      <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Financials
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Type of Deal">{show(labelize(housing.dealType))}</TopLabeled></Grid>
          {housing.dealType && housing.dealType !== 'cash' ? (
            <>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Ideal Monthly Payment">{show(currency(housing.idealMonthlyPayment))}</TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Max Monthly Payment">{show(currency(housing.maxMonthlyPayment))}</TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Down Payment">{show(currency(housing.downPayment))}</TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Down Payment Source">{show(labelize(housing.downPaymentSource === 'other' ? housing.downPaymentSourceOther || 'Other' : housing.downPaymentSource))}</TopLabeled></Grid>
            </>
          ) : null}
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Price Range">{show(rangeText(housing.priceMin, housing.priceMax, '$'))}</TopLabeled></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

function EditForm({ form, onChange, onNested }) {
  return (
    <Stack spacing={2}>
      <Section title="Current Living">
        <Grid container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Own/Rent">
              <TextField select value={form.currentOwnRent} onChange={onChange('currentOwnRent')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['own','rent']) }}>
              {['own','rent'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Current Payment"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.currentMonthlyPayment} onChange={onChange('currentMonthlyPayment')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bed"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.currentBed} onChange={onChange('currentBed')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bath"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.currentBath} onChange={onChange('currentBath')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12}><TopLabeled label="Address"><TextField value={form.currentAddress} onChange={onChange('currentAddress')} fullWidth size="medium" placeholder="Start typing address..." sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="City"><TextField value={form.addressCity || ''} onChange={onChange('addressCity')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="State"><TextField value={form.addressState || ''} onChange={onChange('addressState')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Zip"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.addressZip || ''} onChange={onChange('addressZip')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="County"><TextField value={form.addressCounty || ''} onChange={onChange('addressCounty')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
        </Grid>
      </Section>
      <Section title="Home Preferences">
        <Grid container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Home Type">
              <TextField select value={form.homeType} onChange={onChange('homeType')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['singlewide','doublewide','triplewide','tiny home']) }}>
              {['singlewide','doublewide','triplewide','tiny home'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bed"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.prefBed} onChange={onChange('prefBed')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Bath"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.prefBath} onChange={onChange('prefBath')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}><TopLabeled label="Square Footage"><TextField type="text" inputProps={{ inputMode: 'numeric' }} value={form.prefSqft} onChange={onChange('prefSqft')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Time Frame">
              <TextField select value={form.timeFrame} onChange={onChange('timeFrame')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['0-3 months','3-6 months','6-12 months','1+ year']) }}>
              {['0-3 months','3-6 months','6-12 months','1+ year'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{opt}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
        </Grid>
      </Section>
      <Section title="Land">
        <Grid container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Need Land?">
              <TextField select value={form.landNeed ? 'yes' : (form.landNeed===false ? 'no' : '')} onChange={(e)=>setForm(f=>({...f, landNeed: e.target.value==='yes'}))} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['yes','no']) }}>
              {['yes','no'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Situation">
              <TextField select value={form.landSituation} onChange={onChange('landSituation')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['community','owned free and clear','family land','purchase']) }}>
              {['community','owned free and clear','family land','purchase'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Lot Size">
              <TextField select value={form.lotSize} onChange={onChange('lotSize')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['0-.5 acres','1-2 acres','2-5 acres','5+ acres']) }}>
              {['0-.5 acres','1-2 acres','2-5 acres','5+ acres'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{opt}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          {form.landNeed ? (
            <>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Desired Location"><TextField value={form.desiredLocation} onChange={onChange('desiredLocation')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
              <Grid item xs={12}><TopLabeled label="Special Location Needs"><TextField value={form.specialLocationNeeds} onChange={onChange('specialLocationNeeds')} fullWidth multiline minRows={2} size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
            </>
          ) : null}
          <Grid item xs={12}>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              {['water','sewer','electric','driveway','pad'].map(key => (
                <FormControlLabel key={key} control={<Checkbox checked={!!form.landImprovements?.[key]} onChange={(e)=>setForm(f=>({...f, landImprovements:{...(f.landImprovements||{}), [key]: e.target.checked}}))} />} label={labelize(key)} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Section>
      <Section title="Financials">
        <Grid container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TopLabeled label="Type of Deal">
              <TextField select value={form.dealType} onChange={onChange('dealType')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['cash','chattel','land/home','lnl']) }}>
              {['cash','chattel','land/home','lnl'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
              </TextField>
            </TopLabeled>
          </Grid>
          {form.dealType && form.dealType !== 'cash' ? (
            <>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Ideal Monthly Payment"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.idealMonthlyPayment} onChange={onChange('idealMonthlyPayment')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Max Monthly Payment"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.maxMonthlyPayment} onChange={onChange('maxMonthlyPayment')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}><TopLabeled label="Down Payment"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.downPayment} onChange={onChange('downPayment')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TopLabeled label="Down Payment Source">
                  <TextField select value={form.downPaymentSource} onChange={onChange('downPaymentSource')} fullWidth size="medium" sx={{ minWidth: minWidthForOptions(['checking','savings','cash','gift','401k','other']) }}>
                  {['checking','savings','cash','gift','401k','other'].map(opt => (<MenuItem key={opt} value={opt} sx={{ fontSize: 16 }}>{labelize(opt)}</MenuItem>))}
                  </TextField>
                </TopLabeled>
              </Grid>
              {form.downPaymentSource === 'other' && (
                <Grid item xs={12} sm={6} md={3}><TopLabeled label="Other Source"><TextField value={form.downPaymentSourceOther || ''} onChange={onChange('downPaymentSourceOther')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
              )}
            </>
          ) : null}
          <Grid item xs={12} sm={6} md={4}><TopLabeled label="Price Min"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.priceMin} onChange={onChange('priceMin')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
          <Grid item xs={12} sm={6} md={4}><TopLabeled label="Price Max"><TextField type="text" inputProps={{ inputMode: 'decimal' }} value={form.priceMax} onChange={onChange('priceMax')} fullWidth size="medium" sx={{ fontSize: 16 }} /></TopLabeled></Grid>
        </Grid>
      </Section>
    </Stack>
  );
}

function Section({ title, children }) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{title}</Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      {children}
    </Stack>
  );
}

function Field({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>{label}</Typography>
      {value}
    </Stack>
  );
}

function defaultHousing() {
  return {
    bedrooms: '',
    bathrooms: '',
    sqftMin: '',
    sqftMax: '',
    lotSize: '',
    amenities: '',
    maxMonthlyPayment: '',
    priceMin: '',
    priceMax: '',
    downPaymentAmount: '',
    downPaymentSource: '',
    moveInTimeline: '',
    types: {},
    dealTypes: {}
  };
}

function rangeText(min, max, suffix) {
  if (!min && !max) return '';
  if (min && max) return `${min}${suffix ? ' ' + suffix : ''} - ${max}${suffix ? ' ' + suffix : ''}`;
  if (min) return `${min}${suffix ? ' ' + suffix : ''} +`;
  return `Up to ${max}${suffix ? ' ' + suffix : ''}`;
}

function currency(val) {
  if (!val && val !== 0) return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function chipStyle(active) {
  return { bgcolor: active ? 'rgba(0,255,127,0.15)' : 'rgba(255,255,255,0.08)', color: active ? '#a6f3c0' : 'white' };
}

function labelize(key) {
  const map = {
    singlewide: 'Singlewide',
    doublewide: 'Doublewide',
    tinyHome: 'Tiny Home',
    tripleWide: 'Triple Wide',
    modular: 'Modular',
    cash: 'Cash',
    chattel: 'Chattel',
    landHome: 'Land/Home',
    lnl: 'LnL'
  };
  return map[key] || key;
}

function TopLabeled({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 16 }, '& .MuiSelect-select': { fontSize: 16 }, '& .MuiFormControlLabel-label': { fontSize: 16 } }}>
        {children}
      </Box>
    </Stack>
  );
}

function minWidthForOptions(options) {
  const max = Math.max(...options.map((o) => String(o).length), 0);
  const ch = Math.min(Math.max(max + 6, 18), 40); // clamp
  return `${ch}ch`;
}

export default HousingNeeds;


