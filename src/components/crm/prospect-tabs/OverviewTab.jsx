import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';

const OverviewTab = ({ prospectId, userProfile, isDeal, context }) => {
  const overviewData = context?.prospect?.overview || {};
  const prospect = context?.prospect || {};
  const buyerInfo = context?.buyerInfo || {};
  
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.disabled', fontSize: 15 }}>—</Typography>;
  
  const currencyShow = (v) => {
    if (!v) return <Typography component="span" sx={{ color: 'text.disabled', fontSize: 15 }}>—</Typography>;
    const num = Number(v);
    return <Typography component="span" sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500 }}>${num.toLocaleString()}</Typography>;
  };

  const labelize = (key) => {
    const map = {
      own_free_clear: 'Own Free and Clear',
      buying: 'Buying',
      family: 'Family',
      subdivide: 'Sub Divide',
      park: 'Park',
      cash: 'Cash',
      chattel: 'Chattel',
      land_lieu: 'Land/Lieu',
      land_home: 'Land/Home',
      va: 'VA',
      fha_usda: 'FHA/USDA',
      primary: 'Primary',
      secondary: 'Secondary',
      buy_for: 'Buy-For',
      investment: 'Investment',
      none: 'None',
      selling_mobile: 'Selling Mobile',
      selling_site: 'Selling Site Built',
      tear_down: 'Tear Down',
      renting: 'Renting',
      other: 'Other',
      // Lead sources
      facebook: 'Facebook',
      phone_up: 'Phone Up',
      website: 'Website',
      google: 'Google',
      bandit: 'Bandit',
      referral: 'Referral',
    };
    return map[key] || key;
  };

  const LabeledField = ({ label, children }) => (
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
      {children}
    </Stack>
  );

  return (
    <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
      <Stack spacing={4}>
        {/* Row 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Land
            </Typography>
            <LabeledField label="Land Type">
              {show(labelize(overviewData.landType))}
            </LabeledField>
          </Box>

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Property
            </Typography>
            <Stack spacing={2}>
              <LabeledField label="Lot/Land Payment">
                {currencyShow(overviewData.lotLandPayment)}
              </LabeledField>
              <LabeledField label="Price/Value">
                {currencyShow(overviewData.priceValue)}
              </LabeledField>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              New Home
            </Typography>
            <Stack spacing={2}>
              <LabeledField label="Manufacturer">
                {show(overviewData.manufacturer)}
              </LabeledField>
              <LabeledField label="Model">
                {show(overviewData.model)}
              </LabeledField>
              <LabeledField label="Display/RSO">
                {show(overviewData.displayRSO)}
              </LabeledField>
            </Stack>
          </Box>
        </Box>

        {/* Row 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Financing
            </Typography>
            <LabeledField label="Financing Type">
              {show(labelize(overviewData.financingType))}
            </LabeledField>
          </Box>

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              New Home Financing
            </Typography>
            <LabeledField label="New Home Financing">
              {show(labelize(overviewData.newHomeFinancing))}
            </LabeledField>
          </Box>

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Current Living Status
            </Typography>
            <LabeledField label="Current Living Status">
              {show(labelize(overviewData.currentLivingStatus))}
            </LabeledField>
          </Box>
        </Box>

        {/* Row 3 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Financial Details
            </Typography>
            <Stack spacing={2}>
              <LabeledField label="Down Payment">
                {currencyShow(overviewData.downPayment)}
              </LabeledField>
              <LabeledField label="Max PITI">
                {currencyShow(overviewData.maxPITI)}
              </LabeledField>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 16, mb: 2 }}>
              Project Estimate
            </Typography>
            <Stack spacing={2}>
              <LabeledField label="House">
                {currencyShow(overviewData.projectHouse)}
              </LabeledField>
              <LabeledField label="Improvements">
                {currencyShow(overviewData.projectImprovements)}
              </LabeledField>
              <LabeledField label="Total">
                {currencyShow(overviewData.projectTotal)}
              </LabeledField>
              <LabeledField label="Move In Date">
                {show(overviewData.moveInDate)}
              </LabeledField>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Info: Source and Created By */}
        <Box sx={{ pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            <strong>Source:</strong> {labelize(buyerInfo.source || prospect.source) || '—'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            <strong>Created by:</strong> {prospect.createdBy || '—'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default OverviewTab;

