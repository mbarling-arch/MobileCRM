import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, IconButton, Button, Grid, TextField, MenuItem, Chip, Divider, FormControlLabel, Checkbox, Paper, Collapse } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FormTextField, FormSelect, FormGrid, FormGridItem, FormSection } from '../FormField';
import { LEAD_SOURCES } from './LeadConstants';

function HousingNeeds({ companyId, prospectId, initial, context }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultHousing());
  const [saving, setSaving] = useState(false);

  const { buyerInfo, coBuyerInfo, setBuyerInfo, setCoBuyerInfo, saveBuyerInfo, saveCoBuyerInfo } = context || {};
  const prospectSource = context?.prospect?.source;

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
  const handleNested = (group) => (value) => setForm((f) => ({ ...f, [group]: value }));

  const handleSave = async () => {
    if (!companyId || !prospectId) return;
    setSaving(true);
    try {
    const ref = doc(db, 'companies', companyId, 'prospects', prospectId);
    await updateDoc(ref, { housing: form });
    setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CombinedHousingForm
        form={form}
        onChange={handleChange}
        onNested={handleNested}
        onSave={handleSave}
        saving={saving}
        buyerInfo={buyerInfo}
        coBuyerInfo={coBuyerInfo}
        setBuyerInfo={setBuyerInfo}
        setCoBuyerInfo={setCoBuyerInfo}
        saveBuyerInfo={saveBuyerInfo}
        saveCoBuyerInfo={saveCoBuyerInfo}
        prospectSource={prospectSource}
      />
    </Box>
  );
}

function CombinedHousingForm({ form, onChange, onNested, onSave, saving, buyerInfo, coBuyerInfo, setBuyerInfo, setCoBuyerInfo, saveBuyerInfo, saveCoBuyerInfo, prospectSource }) {
  const [editingHousing, setEditingHousing] = useState(false);
  const [editingLand, setEditingLand] = useState(false);
  const [editingFinancials, setEditingFinancials] = useState(false);
  
  // Collapse states
  const [housingExpanded, setHousingExpanded] = useState(true);
  const [landExpanded, setLandExpanded] = useState(true);
  const [financialsExpanded, setFinancialsExpanded] = useState(true);

  const saveHousing = async () => {
    await onSave();
    setEditingHousing(false);
  };

  const saveLand = async () => {
    await onSave();
    setEditingLand(false);
  };

  const saveFinancials = async () => {
    await onSave();
    setEditingFinancials(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Housing Information Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: housingExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setHousingExpanded(!housingExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: housingExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Housing Information
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!editingHousing ? (
              <IconButton onClick={() => setEditingHousing(true)} sx={{ color: 'text.primary' }}>
                <EditOutlinedIcon />
              </IconButton>
            ) : (
              <>
                <Button onClick={saveHousing} variant="contained" color="success" size="small" disabled={saving}>Save</Button>
                <Button onClick={() => setEditingHousing(false)} variant="outlined" size="small" sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}>Cancel</Button>
              </>
            )}
          </Stack>
        </Box>
        <Collapse in={housingExpanded} timeout="auto">
          {!editingHousing ? (
            <HousingInformationDisplay housing={form} />
          ) : (
            <HousingInformationEdit form={form} onChange={onChange} />
          )}
        </Collapse>
      </Paper>

      {/* Home Placement Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: landExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setLandExpanded(!landExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: landExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Home Placement
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!editingLand ? (
              <IconButton onClick={() => setEditingLand(true)} sx={{ color: 'text.primary' }}>
                <EditOutlinedIcon />
              </IconButton>
            ) : (
              <>
                <Button onClick={saveLand} variant="contained" color="success" size="small" disabled={saving}>Save</Button>
                <Button onClick={() => setEditingLand(false)} variant="outlined" size="small" sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}>Cancel</Button>
              </>
            )}
          </Stack>
        </Box>
        <Collapse in={landExpanded} timeout="auto">
          {!editingLand ? (
            <LandInformationDisplay housing={form} onNested={onNested} />
          ) : (
            <LandInformationEdit form={form} onChange={onChange} onNested={onNested} />
          )}
        </Collapse>
      </Paper>

      {/* Lender Information Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: financialsExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setFinancialsExpanded(!financialsExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: financialsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Lender Information
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!editingFinancials ? (
              <IconButton onClick={() => setEditingFinancials(true)} sx={{ color: 'text.primary' }}>
                <EditOutlinedIcon />
              </IconButton>
            ) : (
              <>
                <Button onClick={saveFinancials} variant="contained" color="success" size="small" disabled={saving}>Save</Button>
                <Button onClick={() => setEditingFinancials(false)} variant="outlined" size="small" sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}>Cancel</Button>
              </>
            )}
          </Stack>
        </Box>
        <Collapse in={financialsExpanded} timeout="auto">
          {!editingFinancials ? (
            <FinancialsDisplay housing={form} />
          ) : (
            <FinancialsEdit form={form} onChange={onChange} onNested={onNested} />
          )}
        </Collapse>
      </Paper>
    </Box>
  );
}

// Removed Contact Information - now in Overview container

// Housing Information components (Home Preferences + Current Living only)
function HousingInformationDisplay({ housing }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Home Preferences */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Home Preferences
          </Typography>
        </Box>
        <HomePreferencesDisplay housing={housing} />
      </Box>

      {/* Current Living */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Current Living
          </Typography>
        </Box>
        <CurrentLivingDisplay housing={housing} />
      </Box>
    </Box>
  );
}

function HousingInformationEdit({ form, onChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Home Preferences */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Home Preferences
          </Typography>
        </Box>
        <HomePreferencesEdit form={form} onChange={onChange} />
      </Box>

      {/* Current Living */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Current Living
          </Typography>
        </Box>
        <CurrentLivingEdit form={form} onChange={onChange} />
      </Box>
    </Box>
  );
}

// Individual section display components
function CurrentLivingDisplay({ housing }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}><TopLabeled label="Own/Rent">{show(labelize(housing.currentOwnRent))}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="Apt/Home">{show(labelize(housing.currentHomeType))}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="How Long?">{show(housing.currentHowLong)}</TopLabeled></Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 2 }}><TopLabeled label="Current Payment">{show(currency(housing.currentMonthlyPayment))}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="Bed">{show(housing.currentBed)}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="Bath">{show(housing.currentBath)}</TopLabeled></Box>
      </Box>
      <TopLabeled label="Likes">{show(housing.likes)}</TopLabeled>
      <TopLabeled label="Dislikes">{show(housing.dislikes)}</TopLabeled>
    </Stack>
  );
}

function HomePreferencesDisplay({ housing }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 2 }}><TopLabeled label="Home Type">{show(labelize(housing.homeType))}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="Bed">{show(housing.prefBed)}</TopLabeled></Box>
        <Box sx={{ flex: 1 }}><TopLabeled label="Bath">{show(housing.prefBath)}</TopLabeled></Box>
      </Box>
      <TopLabeled label="Sq Footage">{show(housing.prefSqft)}</TopLabeled>
      <TopLabeled label="Desired Features">{show(housing.desiredFeatures)}</TopLabeled>
    </Stack>
  );
}

function LandInformationDisplay({ housing, onNested }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  const hasIdentifiedLocation = housing.hasIdentifiedLocation;

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Situation Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Situation
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          <TopLabeled label="Have you identified a location for our home?">{show(hasIdentifiedLocation ? 'Yes' : (hasIdentifiedLocation===false ? 'No' : ''))}</TopLabeled>
          <TopLabeled label="Timeframe for Move in?">{show(housing.moveInTimeframe)}</TopLabeled>
          <TopLabeled label="What would prevent you from moving sooner?">{show(housing.preventMovingSooner)}</TopLabeled>
        </Stack>
      </Box>

      {/* Land Info Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Land Info
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          {hasIdentifiedLocation === true && (
            <>
              <TopLabeled label="Location Type">{show(labelize(housing.locationType))}</TopLabeled>
              <Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                  Does your land have improvements?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ minHeight: '32px' }}>
                  {['electric','water','septic','drive','pad'].filter(k => housing.landImprovements?.[k]).map(k => (
                    <Chip key={k} label={labelize(k)} size="small" sx={{ bgcolor: 'rgba(0,255,127,0.15)', color: '#a6f3c0' }} />
                  ))}
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><TopLabeled label="Size">{show(housing.landSize)}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Payoff">{show(currency(housing.landPayoff))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Mo. Pay">{show(currency(housing.landMonthlyPayment))}</TopLabeled></Box>
              </Box>
            </>
          )}

          {hasIdentifiedLocation === false && (
            <>
              <TopLabeled label="What area do you want to live in?">{show(housing.desiredArea)}</TopLabeled>
              <TopLabeled label="How much land?">{show(housing.desiredLandSize)}</TopLabeled>
            </>
          )}

          {!hasIdentifiedLocation && hasIdentifiedLocation !== false && (
            <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
              Answer the location question to view land details
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function FinancialsDisplay({ housing }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  const isCash = housing.dealType === 'cash';
  const isFinancing = housing.dealType && housing.dealType !== 'cash';

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Pricing Needs Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Pricing Needs
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          <TopLabeled label="Cash/Financing">{show(labelize(housing.dealType))}</TopLabeled>
          
          {isCash && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><TopLabeled label="Ideal Price">{show(currency(housing.idealPrice))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Max Price">{show(currency(housing.maxPrice))}</TopLabeled></Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><TopLabeled label="Available">{show(currency(housing.cashAvailable))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Source">{show(labelize(housing.cashSource))}</TopLabeled></Box>
              </Box>
            </>
          )}

          {isFinancing && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><TopLabeled label="Ideal Payment">{show(currency(housing.idealMonthlyPayment))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Max Payment">{show(currency(housing.maxMonthlyPayment))}</TopLabeled></Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}><TopLabeled label="Down Payment">{show(currency(housing.downPayment))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Available">{show(currency(housing.availableToday))}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Source">{show(labelize(housing.fundsSource))}</TopLabeled></Box>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      {/* Employment Information Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Employment Information
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          {isFinancing ? (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 2 }}><TopLabeled label="Buyer Employer">{show(housing.buyerEmployer)}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Start Date">{show(housing.buyerStartDate)}</TopLabeled></Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 2 }}><TopLabeled label="Co-Buyer Employer">{show(housing.coBuyerEmployer)}</TopLabeled></Box>
                <Box sx={{ flex: 1 }}><TopLabeled label="Start Date">{show(housing.coBuyerStartDate)}</TopLabeled></Box>
              </Box>
            </>
          ) : (
            <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
              Only needed if financing
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

// Individual section edit components
function CurrentLivingEdit({ form, onChange }) {
  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FormSelect
            label="Own/Rent"
            value={form.currentOwnRent}
            onChange={onChange('currentOwnRent')}
            options={[
              { value: 'own', label: 'Own' },
              { value: 'rent', label: 'Rent' }
            ]}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormSelect
            label="Apt/Home"
            value={form.currentHomeType}
            onChange={onChange('currentHomeType')}
            options={[
              { value: 'apartment', label: 'Apartment' },
              { value: 'house', label: 'House' },
              { value: 'condo', label: 'Condo' },
              { value: 'mobile home', label: 'Mobile Home' }
            ]}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            label="How Long?"
            value={form.currentHowLong}
            onChange={onChange('currentHowLong')}
            placeholder="e.g., 2 years"
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 2 }}>
          <FormTextField
            label="Current Payment"
            type="number"
            value={form.currentMonthlyPayment}
            onChange={onChange('currentMonthlyPayment')}
            InputProps={{ startAdornment: '$' }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            label="Bed"
            type="number"
            value={form.currentBed}
            onChange={onChange('currentBed')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            label="Bath"
            type="number"
            value={form.currentBath}
            onChange={onChange('currentBath')}
          />
        </Box>
      </Box>
      <FormTextField
        label="Likes"
        value={form.likes}
        onChange={onChange('likes')}
        multiline
        minRows={2}
      />
      <FormTextField
        label="Dislikes"
        value={form.dislikes}
        onChange={onChange('dislikes')}
        multiline
        minRows={2}
      />
    </Stack>
  );
}

function HomePreferencesEdit({ form, onChange }) {
  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 2 }}>
          <FormSelect
            label="Home Type"
            value={form.homeType}
            onChange={onChange('homeType')}
            options={[
              { value: 'singlewide', label: 'Single Wide' },
              { value: 'doublewide', label: 'Double Wide' },
              { value: 'triplewide', label: 'Triple Wide' },
              { value: 'tiny home', label: 'Tiny Home' }
            ]}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            label="Bed"
            type="number"
            value={form.prefBed}
            onChange={onChange('prefBed')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            label="Bath"
            type="number"
            value={form.prefBath}
            onChange={onChange('prefBath')}
          />
        </Box>
      </Box>
      <FormTextField
        label="Sq Footage"
        type="number"
        value={form.prefSqft}
        onChange={onChange('prefSqft')}
      />
      <FormTextField
        label="Desired Features"
        value={form.desiredFeatures}
        onChange={onChange('desiredFeatures')}
        multiline
        minRows={2}
      />
    </Stack>
  );
}

function LandInformationEdit({ form, onChange, onNested }) {
  const hasIdentifiedLocation = form.hasIdentifiedLocation;

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Situation Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Situation
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          <FormSelect
            label="Have you identified a location for our home?"
            value={hasIdentifiedLocation ? 'yes' : (hasIdentifiedLocation === false ? 'no' : '')}
            onChange={(e) => onNested('hasIdentifiedLocation')(e.target.value === 'yes')}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
          />
          <FormTextField
            label="Timeframe for Move in?"
            value={form.moveInTimeframe}
            onChange={onChange('moveInTimeframe')}
            placeholder="e.g., 3-6 months"
          />
          <FormTextField
            label="What would prevent you from moving sooner?"
            value={form.preventMovingSooner}
            onChange={onChange('preventMovingSooner')}
            multiline
            minRows={2}
          />
        </Stack>
      </Box>

      {/* Land Info Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Land Info
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          {hasIdentifiedLocation === true && (
            <>
              <FormSelect
                label="Location Type"
                value={form.locationType}
                onChange={onChange('locationType')}
                options={[
                  { value: 'community', label: 'Community' },
                  { value: 'private property', label: 'Private Property' },
                  { value: 'family land', label: 'Family Land' }
                ]}
              />
              <Box>
                <Typography sx={{ color: 'text.primary', fontWeight: 500, mb: 1, fontSize: 14 }}>
                  Does your land have improvements?
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {['electric', 'water', 'septic', 'drive', 'pad'].map(key => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={!!form.landImprovements?.[key]}
                          onChange={(e) => onNested('landImprovements')({ ...(form.landImprovements || {}), [key]: e.target.checked })}
                        />
                      }
                      label={labelize(key)}
                    />
                  ))}
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Size"
                    value={form.landSize}
                    onChange={onChange('landSize')}
                    placeholder="e.g., 5 acres"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Payoff"
                    type="number"
                    value={form.landPayoff}
                    onChange={onChange('landPayoff')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Mo. Pay"
                    type="number"
                    value={form.landMonthlyPayment}
                    onChange={onChange('landMonthlyPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
              </Box>
            </>
          )}

          {hasIdentifiedLocation === false && (
            <>
              <FormTextField
                label="What area do you want to live in?"
                value={form.desiredArea}
                onChange={onChange('desiredArea')}
                placeholder="City, county, or general area"
              />
              <FormTextField
                label="How much land?"
                value={form.desiredLandSize}
                onChange={onChange('desiredLandSize')}
                placeholder="e.g., 1-5 acres"
              />
            </>
          )}

          {!hasIdentifiedLocation && hasIdentifiedLocation !== false && (
            <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
              Answer the location question to enter land details
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function FinancialsEdit({ form, onChange, onNested }) {
  const isCash = form.dealType === 'cash';
  const isFinancing = form.dealType && form.dealType !== 'cash';

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Pricing Needs Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Pricing Needs
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          <FormSelect
            label="Cash/Financing"
            value={form.dealType}
            onChange={onChange('dealType')}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'chattel', label: 'Chattel' },
              { value: 'land/home', label: 'Land/Home' },
              { value: 'lnl', label: 'LNL' }
            ]}
          />

          {isCash && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Ideal Price"
                    type="number"
                    value={form.idealPrice}
                    onChange={onChange('idealPrice')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Max Price"
                    type="number"
                    value={form.maxPrice}
                    onChange={onChange('maxPrice')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Available"
                    type="number"
                    value={form.cashAvailable}
                    onChange={onChange('cashAvailable')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormSelect
                    label="Source"
                    value={form.cashSource}
                    onChange={onChange('cashSource')}
                    options={[
                      { value: 'checking', label: 'Checking' },
                      { value: 'savings', label: 'Savings' },
                      { value: 'gift', label: 'Gift' },
                      { value: '401k', label: '401k' },
                      { value: 'sale', label: 'Sale' }
                    ]}
                  />
                </Box>
              </Box>
            </>
          )}

          {isFinancing && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Ideal Payment"
                    type="number"
                    value={form.idealMonthlyPayment}
                    onChange={onChange('idealMonthlyPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Max Payment"
                    type="number"
                    value={form.maxMonthlyPayment}
                    onChange={onChange('maxMonthlyPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Down Payment"
                    type="number"
                    value={form.downPayment}
                    onChange={onChange('downPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Available"
                    type="number"
                    value={form.availableToday}
                    onChange={onChange('availableToday')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormSelect
                    label="Source"
                    value={form.fundsSource}
                    onChange={onChange('fundsSource')}
                    options={[
                      { value: 'checking', label: 'Checking' },
                      { value: 'savings', label: 'Savings' },
                      { value: 'gift', label: 'Gift' },
                      { value: '401k', label: '401k' },
                      { value: 'land', label: 'Land' }
                    ]}
                  />
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      {/* Employment Information Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Employment Information
          </Typography>
        </Box>
        <Stack spacing={2.5}>
          {isFinancing ? (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 2 }}>
                  <FormTextField
                    label="Buyer Employer"
                    value={form.buyerEmployer}
                    onChange={onChange('buyerEmployer')}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Start Date"
                    type="date"
                    value={form.buyerStartDate}
                    onChange={onChange('buyerStartDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 2 }}>
                  <FormTextField
                    label="Co-Buyer Employer"
                    value={form.coBuyerEmployer}
                    onChange={onChange('coBuyerEmployer')}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormTextField
                    label="Start Date"
                    type="date"
                    value={form.coBuyerStartDate}
                    onChange={onChange('coBuyerStartDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </>
          ) : (
            <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 4 }}>
              Only needed if financing
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function Display({ housing }) {
  const notSet = <Typography component="span" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15 }}>Not specified</Typography>;
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : notSet;
  const yesNo = (b) => b ? <Chip size="small" label="Yes" sx={{ bgcolor: 'success.main', color: 'success.contrastText' }} /> : <Chip size="small" label="No" sx={{ bgcolor: 'customColors.tableRowBackground', color: 'text.primary' }} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Housing Information */}
      <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Current Living Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Current Living
        </Typography>
            <Stack spacing={2}>
              <TopLabeled label="Own/Rent">{show(labelize(housing.currentOwnRent))}</TopLabeled>
              <TopLabeled label="Current Payment">{show(currency(housing.currentMonthlyPayment))}</TopLabeled>
              <TopLabeled label="Bed">{show(housing.currentBed)}</TopLabeled>
              <TopLabeled label="Bath">{show(housing.currentBath)}</TopLabeled>
              <TopLabeled label="Likes/Dislikes">{show(housing.likesDislikes)}</TopLabeled>
              <TopLabeled label="Address">{show(housing.currentAddress)}</TopLabeled>
            </Stack>
          </Box>

          {/* Home Preferences Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Home Preferences
        </Typography>
            <Stack spacing={2}>
              <TopLabeled label="Home Type">{show(labelize(housing.homeType))}</TopLabeled>
              <TopLabeled label="Bed">{show(housing.prefBed)}</TopLabeled>
              <TopLabeled label="Bath">{show(housing.prefBath)}</TopLabeled>
              <TopLabeled label="Square Footage">{show(housing.prefSqft)}</TopLabeled>
              <TopLabeled label="Desired Features">{show(housing.desiredFeatures)}</TopLabeled>
              <TopLabeled label="Time Frame">{show(labelize(housing.timeFrame))}</TopLabeled>
            </Stack>
          </Box>

          {/* Land Information Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Land Information
        </Typography>
            <Stack spacing={2}>
              <TopLabeled label="Need Land">{show(housing.landNeed ? 'Yes' : (housing.landNeed===false ? 'No' : ''))}</TopLabeled>
              <TopLabeled label="Situation">{show(labelize(housing.landSituation))}</TopLabeled>
              <TopLabeled label="Lot Size">{show(labelize(housing.lotSize))}</TopLabeled>
          {housing.landNeed ? (
            <>
                  <TopLabeled label="Desired Location">{show(housing.desiredLocation)}</TopLabeled>
                  <TopLabeled label="Special Location Needs">{show(housing.specialLocationNeeds)}</TopLabeled>
            </>
          ) : null}
            <TopLabeled label="Needed Improvements">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['water','sewer','electric','driveway','pad'].filter(k => housing.landImprovements?.[k]).map(k => (
                  <Chip key={k} label={labelize(k)} size="small" sx={{ bgcolor: 'rgba(0,255,127,0.15)', color: '#a6f3c0' }} />
                ))}
                {!Object.values(housing.landImprovements||{}).some(Boolean) && <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontStyle:'italic' }}>Not specified</Typography>}
              </Stack>
            </TopLabeled>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Financials Section */}
      <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
          Financials
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
                Payment Information
              </Typography>
              <Stack spacing={2}>
                <TopLabeled label="Type of Deal">{show(labelize(housing.dealType))}</TopLabeled>
          {housing.dealType && housing.dealType !== 'cash' ? (
            <>
                    <TopLabeled label="Ideal Monthly Payment">{show(currency(housing.idealMonthlyPayment))}</TopLabeled>
                    <TopLabeled label="Max Monthly Payment">{show(currency(housing.maxMonthlyPayment))}</TopLabeled>
                    <TopLabeled label="Down Payment">{show(currency(housing.downPayment))}</TopLabeled>
                    <TopLabeled label="Available Today">{show(currency(housing.availableToday))}</TopLabeled>
                    <TopLabeled label="Source">{show(labelize(housing.fundsSource))}</TopLabeled>
            </>
          ) : null}
                <TopLabeled label="Ideal Payment">{show(currency(housing.idealPayment))}</TopLabeled>
                <TopLabeled label="Max Payment">{show(currency(housing.maxPayment))}</TopLabeled>
                <TopLabeled label="Price Range">{show(rangeText(housing.priceMin, housing.priceMax, '$'))}</TopLabeled>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
                Employment Information
              </Typography>
              <Stack spacing={2}>
                <TopLabeled label="Buyer Current Employer">{show(housing.buyerEmployer)}</TopLabeled>
                <TopLabeled label="How Long?">{show(housing.buyerEmploymentLength)}</TopLabeled>
                <TopLabeled label="How Paid?">{show(labelize(housing.buyerPayType))}</TopLabeled>
                <TopLabeled label="Co-Buyer Employer">{show(housing.coBuyerEmployer)}</TopLabeled>
                <TopLabeled label="How Long?">{show(housing.coBuyerEmploymentLength)}</TopLabeled>
                <TopLabeled label="How Paid?">{show(labelize(housing.coBuyerPayType))}</TopLabeled>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function EditForm({ form, onChange, onNested }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Current Living Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Current Living
            </Typography>
          <Stack spacing={2}>
            <FormSelect
              label="Own/Rent"
              value={form.currentOwnRent}
              onChange={onChange('currentOwnRent')}
              options={[
                { value: 'own', label: 'Own' },
                { value: 'rent', label: 'Rent' }
              ]}
            />
            <FormTextField
              label="Current Payment"
              type="number"
              value={form.currentMonthlyPayment}
              onChange={onChange('currentMonthlyPayment')}
              InputProps={{ startAdornment: '$' }}
            />
            <FormTextField
              label="Bed"
              type="number"
              value={form.currentBed}
              onChange={onChange('currentBed')}
            />
            <FormTextField
              label="Bath"
              type="number"
              value={form.currentBath}
              onChange={onChange('currentBath')}
            />
            <FormTextField
              label="Likes/Dislikes"
              value={form.likesDislikes}
              onChange={onChange('likesDislikes')}
              multiline
              minRows={2}
            />
            <FormTextField
              label="Address"
              value={form.currentAddress}
              onChange={onChange('currentAddress')}
              placeholder="Start typing address..."
            />
          </Stack>
          </Box>

          {/* Home Preferences Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Home Preferences
            </Typography>
          <Stack spacing={2}>
            <FormSelect
              label="Home Type"
              value={form.homeType}
              onChange={onChange('homeType')}
              options={[
                { value: 'singlewide', label: 'Single Wide' },
                { value: 'doublewide', label: 'Double Wide' },
                { value: 'triplewide', label: 'Triple Wide' },
                { value: 'tiny home', label: 'Tiny Home' }
              ]}
            />
            <FormTextField
              label="Bed"
              type="number"
              value={form.prefBed}
              onChange={onChange('prefBed')}
            />
            <FormTextField
              label="Bath"
              type="number"
              value={form.prefBath}
              onChange={onChange('prefBath')}
            />
            <FormTextField
              label="Square Footage"
              type="number"
              value={form.prefSqft}
              onChange={onChange('prefSqft')}
            />
            <FormTextField
              label="Desired Features"
              value={form.desiredFeatures}
              onChange={onChange('desiredFeatures')}
              multiline
              minRows={2}
            />
            <FormSelect
              label="Time Frame"
              value={form.timeFrame}
              onChange={onChange('timeFrame')}
              options={[
                { value: '0-3 months', label: '0-3 months' },
                { value: '3-6 months', label: '3-6 months' },
                { value: '6-12 months', label: '6-12 months' },
                { value: '1+ year', label: '1+ year' }
              ]}
            />
          </Stack>
          </Box>

          {/* Land Information Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Land Information
            </Typography>
    <Stack spacing={2}>
            <FormSelect
              label="Need Land?"
              value={form.landNeed ? 'yes' : (form.landNeed === false ? 'no' : '')}
              onChange={(e) => onNested('landNeed')(e.target.value === 'yes')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]}
            />
            <FormSelect
              label="Situation"
              value={form.landSituation}
              onChange={onChange('landSituation')}
              options={[
                { value: 'community', label: 'Community' },
                { value: 'owned free and clear', label: 'Owned Free and Clear' },
                { value: 'family land', label: 'Family Land' },
                { value: 'purchase', label: 'Purchase' }
              ]}
            />
            <FormSelect
              label="Lot Size"
              value={form.lotSize}
              onChange={onChange('lotSize')}
              options={[
                { value: '0-.5 acres', label: '0-.5 acres' },
                { value: '1-2 acres', label: '1-2 acres' },
                { value: '2-5 acres', label: '2-5 acres' },
                { value: '5+ acres', label: '5+ acres' }
              ]}
            />
          {form.landNeed ? (
            <>
                <FormTextField
                  label="Desired Location"
                  value={form.desiredLocation}
                  onChange={onChange('desiredLocation')}
                />
                <FormTextField
                  label="Special Location Needs"
                  value={form.specialLocationNeeds}
                  onChange={onChange('specialLocationNeeds')}
                  multiline
                  minRows={2}
                />
            </>
          ) : null}
            <Box>
              <Typography sx={{ color: 'text.primary', fontWeight: 500, mb: 1, fontSize: 14 }}>
                Needed Improvements
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {['water', 'sewer', 'electric', 'driveway', 'pad'].map(key => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={!!form.landImprovements?.[key]}
                        onChange={(e) => onNested('landImprovements')({ ...(form.landImprovements || {}), [key]: e.target.checked })}
                      />
                    }
                    label={labelize(key)}
                  />
              ))}
            </Stack>
            </Box>
          </Stack>
          </Box>
        </Box>
    </Paper>

    {/* Financials Section */}
    <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18, mb: 3 }}>
        Financials
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Payment Information
            </Typography>
            <Stack spacing={2}>
              <FormSelect
                label="Type of Deal"
                value={form.dealType}
                onChange={onChange('dealType')}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'chattel', label: 'Chattel' },
                  { value: 'land/home', label: 'Land/Home' },
                  { value: 'lnl', label: 'LNL' }
                ]}
              />
          {form.dealType && form.dealType !== 'cash' ? (
            <>
                  <FormTextField
                    label="Ideal Monthly Payment"
                    type="number"
                    value={form.idealMonthlyPayment}
                    onChange={onChange('idealMonthlyPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <FormTextField
                    label="Max Monthly Payment"
                    type="number"
                    value={form.maxMonthlyPayment}
                    onChange={onChange('maxMonthlyPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <FormTextField
                    label="Down Payment"
                    type="number"
                    value={form.downPayment}
                    onChange={onChange('downPayment')}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <FormTextField
                    label="Available Today"
                    type="number"
                    value={form.availableToday}
                    onChange={onChange('availableToday')}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <FormSelect
                    label="Source"
                    value={form.fundsSource}
                    onChange={onChange('fundsSource')}
                    options={[
                      { value: 'checking', label: 'Checking' },
                      { value: 'savings', label: 'Savings' },
                      { value: 'gift', label: 'Gift' },
                      { value: '401k', label: '401k' },
                      { value: 'land', label: 'Land' }
                    ]}
                  />
            </>
          ) : null}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormTextField
                  label="Ideal Payment"
                  type="number"
                  value={form.idealPayment}
                  onChange={onChange('idealPayment')}
                  InputProps={{ startAdornment: '$' }}
                />
                <FormTextField
                  label="Max Payment"
                  type="number"
                  value={form.maxPayment}
                  onChange={onChange('maxPayment')}
                  InputProps={{ startAdornment: '$' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormTextField
                  label="Price Min"
                  type="number"
                  value={form.priceMin}
                  onChange={onChange('priceMin')}
                  InputProps={{ startAdornment: '$' }}
                />
                <FormTextField
                  label="Price Max"
                  type="number"
                  value={form.priceMax}
                  onChange={onChange('priceMax')}
                  InputProps={{ startAdornment: '$' }}
                />
              </Box>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Employment Information
            </Typography>
            <Stack spacing={2}>
              <FormTextField
                label="Buyer Current Employer"
                value={form.buyerEmployer}
                onChange={onChange('buyerEmployer')}
              />
              <FormTextField
                label="How Long?"
                value={form.buyerEmploymentLength}
                onChange={onChange('buyerEmploymentLength')}
                placeholder="e.g., 2 years, 6 months"
              />
              <FormSelect
                label="How are you paid?"
                value={form.buyerPayType}
                onChange={onChange('buyerPayType')}
                options={[
                  { value: 'w2', label: 'W-2 Employee' },
                  { value: 'self_employed', label: 'Self Employed' }
                ]}
              />
              <FormTextField
                label="Co-Buyer Employer"
                value={form.coBuyerEmployer}
                onChange={onChange('coBuyerEmployer')}
              />
              <FormTextField
                label="How Long?"
                value={form.coBuyerEmploymentLength}
                onChange={onChange('coBuyerEmploymentLength')}
                placeholder="e.g., 2 years, 6 months"
              />
              <FormSelect
                label="How are you paid?"
                value={form.coBuyerPayType}
                onChange={onChange('coBuyerPayType')}
                options={[
                  { value: 'w2', label: 'W-2 Employee' },
                  { value: 'self_employed', label: 'Self Employed' }
                ]}
              />
    </Stack>
          </Box>
        </Box>
      </Box>
    </Paper>
    </Box>
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
    triplewide: 'Triple Wide',
    'tiny home': 'Tiny Home',
    modular: 'Modular',
    cash: 'Cash',
    chattel: 'Chattel',
    landHome: 'Land/Home',
    'land/home': 'Land/Home',
    lnl: 'LNL',
    phone: 'Phone',
    email: 'Email',
    text: 'Text',
    // Lead sources
    facebook: 'Facebook',
    phone_up: 'Phone Up',
    website: 'Website',
    google: 'Google',
    bandit: 'Bandit',
    referral: 'Referral',
    w2: 'W-2 Employee',
    self_employed: 'Self Employed',
    // Current living
    own: 'Own',
    rent: 'Rent',
    apartment: 'Apartment',
    house: 'House',
    condo: 'Condo',
    'mobile home': 'Mobile Home',
    // Land/Location
    community: 'Community',
    'private property': 'Private Property',
    'family land': 'Family Land',
    electric: 'Electric',
    water: 'Water',
    septic: 'Septic',
    drive: 'Drive',
    pad: 'Pad',
    sewer: 'Sewer',
    driveway: 'Driveway',
    // Funds source
    checking: 'Checking',
    savings: 'Savings',
    gift: 'Gift',
    '401k': '401k',
    land: 'Land',
    sale: 'Sale'
  };
  return map[key] || key;
}

function TopLabeled({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 17 }, '& .MuiSelect-select': { fontSize: 17 }, '& .MuiFormControlLabel-label': { fontSize: 17 } }}>
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


