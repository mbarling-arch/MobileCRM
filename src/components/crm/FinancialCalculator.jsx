import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Grid, TextField, Divider, Button, Paper, IconButton } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

function FinancialCalculator({ companyId, prospectId, initial, context }) {
  const [data, setData] = useState(defaultCalculator());
  const [saving, setSaving] = useState(false);

  const { creditData, setCreditData, saveCreditData } = context || {};

  useEffect(() => {
    setData({ ...defaultCalculator(), ...(initial || {}) });
  }, [initial]);

  const setField = (path) => (e) => {
    const value = e?.target?.value ?? e;
    setData((d) => deepSet({ ...d }, path, value));
  };

  const applicantMonthly = useMemo(() => computeApplicantMonthly('applicant', data), [data]);
  const coappMonthly = useMemo(() => computeApplicantMonthly('coapplicant', data), [data]);
  const grossMonthlyIncome = applicantMonthly + coappMonthly;
  const totalMonthlyDebt = useMemo(() => computeTotalDebt(data), [data]);
  const dti = useMemo(() => (grossMonthlyIncome > 0 ? (totalMonthlyDebt / grossMonthlyIncome) * 100 : 0), [grossMonthlyIncome, totalMonthlyDebt]);

  const handleSave = async () => {
    if (!companyId || !prospectId) return;
    setSaving(true);
    try {
      const ref = doc(db, 'companies', companyId, 'prospects', prospectId);
      await updateDoc(ref, { calculator: data });
      // Also save credit data if context is provided
      if (saveCreditData) {
        await saveCreditData();
      }
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (!numScore || isNaN(numScore)) return 'text.disabled';
    if (numScore >= 720) return 'success.main';
    if (numScore >= 650) return 'warning.main';
    return 'error.main';
  };

  const cellInputSx = {
    '& .MuiInputBase-root': {
      height: 44,
      borderRadius: 2,
      backgroundColor: 'action.hover',
      '&:hover': {
        backgroundColor: 'action.selected'
      },
      '&.Mui-focused': {
        backgroundColor: 'action.selected',
        boxShadow: '0 0 0 2px rgba(140, 87, 255, 0.2)'
      }
    },
    '& .MuiInputBase-input': {
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      padding: '12px 8px',
      color: 'text.primary',
      '&::placeholder': {
        color: 'text.disabled',
        opacity: 1
      }
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      {/* Left Side: Combined Monthly Income */}
      <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
        <Paper sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>
              Combined Monthly Income
            </Typography>

            {/* Income Table */}
            <Box sx={{ overflow: 'hidden' }}>
              {/* Table Header */}
              <Box sx={{
                display: 'flex',
                backgroundColor: 'action.hover',
                py: 2,
                px: 2,
                mb: 1
              }}>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Income Source</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicant</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Co-Applicant</Typography>
                </Box>
              </Box>

              {/* Income Rows */}
              <IncomeTableRow label="Hourly Rate" dataKey="hourlyRate" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Overtime Hours" dataKey="weeklyOvertimeHours" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Annual Salary" dataKey="annualSalary" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Fixed Monthly" dataKey="fixedMonthly" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="SSI/Disability" dataKey="ssi" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Child Support" dataKey="childSupport" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Retirement" dataKey="retirement" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Other Income" dataKey="other" data={data} setField={setField} inputSx={cellInputSx} />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Right Side: Additional Information + Combined Total */}
      <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
        <Paper sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3, textAlign: 'center' }}>Financial Analysis</Typography>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Credit Scores Section */}
            {creditData && (
              <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid', borderBottomColor: 'customColors.calendarBorder' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600, mb: 2, textTransform: 'uppercase' }}>Credit Scores</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {/* Primary Applicant */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 600, mb: 1.5 }}>PRIMARY APPLICANT</Typography>
                    <Stack spacing={1.5}>
                      <CreditScoreInput
                        label="TransUnion"
                        value={creditData.applicantTransUnion}
                        onChange={(val) => setCreditData({ ...creditData, applicantTransUnion: val })}
                        getScoreColor={getScoreColor}
                      />
                      <CreditScoreInput
                        label="Equifax"
                        value={creditData.applicantEquifax}
                        onChange={(val) => setCreditData({ ...creditData, applicantEquifax: val })}
                        getScoreColor={getScoreColor}
                      />
                      <CreditScoreInput
                        label="Experian"
                        value={creditData.applicantExperian}
                        onChange={(val) => setCreditData({ ...creditData, applicantExperian: val })}
                        getScoreColor={getScoreColor}
                      />
                    </Stack>
                  </Box>

                  {/* Co-Applicant */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 600, mb: 1.5 }}>CO-APPLICANT</Typography>
                    <Stack spacing={1.5}>
                      <CreditScoreInput
                        label="TransUnion"
                        value={creditData.coApplicantTransUnion}
                        onChange={(val) => setCreditData({ ...creditData, coApplicantTransUnion: val })}
                        getScoreColor={getScoreColor}
                      />
                      <CreditScoreInput
                        label="Equifax"
                        value={creditData.coApplicantEquifax}
                        onChange={(val) => setCreditData({ ...creditData, coApplicantEquifax: val })}
                        getScoreColor={getScoreColor}
                      />
                      <CreditScoreInput
                        label="Experian"
                        value={creditData.coApplicantExperian}
                        onChange={(val) => setCreditData({ ...creditData, coApplicantExperian: val })}
                        getScoreColor={getScoreColor}
                      />
                    </Stack>
                  </Box>
                </Box>

                {/* Credit Report Upload */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    size="small"
                  >
                    Upload Credit Report
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                    />
                  </Button>
                </Box>
              </Box>
            )}

            {/* Additional Information Fields */}
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <TopLabeled label="Lowest Credit Applicant Midscore">
                <TextField type="text" inputProps={{ inputMode: 'numeric' }} value={data.additional.midscore || ''} onChange={setField('additional.midscore')} fullWidth size="medium" sx={cellInputSx} />
              </TopLabeled>
              <TopLabeled label="Highest Credit Applicant Transunion">
                <TextField type="text" inputProps={{ inputMode: 'numeric' }} value={data.additional.transunionHigh || ''} onChange={setField('additional.transunionHigh')} fullWidth size="medium" sx={cellInputSx} />
              </TopLabeled>
              <TopLabeled label="Lowest Credit Applicant Equifax Score">
                <TextField type="text" inputProps={{ inputMode: 'numeric' }} value={data.additional.equifaxLow || ''} onChange={setField('additional.equifaxLow')} fullWidth size="medium" sx={cellInputSx} />
              </TopLabeled>
              <TopLabeled label="How Many People Living in Home">
                <TextField type="text" inputProps={{ inputMode: 'numeric' }} value={data.expenses.householdSize || ''} onChange={setField('expenses.householdSize')} fullWidth size="medium" sx={cellInputSx} />
              </TopLabeled>
              <TopLabeled label="Tax Rate">
                <TextField type="text" inputProps={{ inputMode: 'decimal' }} value={data.additional.taxRate || ''} onChange={setField('additional.taxRate')} fullWidth size="medium" sx={cellInputSx} />
              </TopLabeled>
            </Stack>

            {/* Combined Total - Moved here from left side */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
                <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>Combined Monthly Income</Typography>
                <CombinedBox value={currency(grossMonthlyIncome)} />
              </Box>
            </Box>

            {/* Save Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function IncomeTableRow({ label, dataKey, data, setField, inputSx }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      py: 1.5,
      px: 2,
      '&:hover': { backgroundColor: 'action.hover' },
      transition: 'background-color 0.2s ease'
    }}>
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <NumericField
          value={data.applicant[dataKey] || ''}
          onChange={setField(`applicant.${dataKey}`)}
          sx={inputSx}
        />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <NumericField
          value={data.coapplicant[dataKey] || ''}
          onChange={setField(`coapplicant.${dataKey}`)}
          sx={inputSx}
        />
      </Box>
    </Box>
  );
}

function Subheading({ children }) {
  return <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 16 }}>{children}</Typography>;
}

function Section({ title, children }) {
  return (
    <Stack spacing={1.25} sx={{ mb: 2 }}>
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{title}</Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      {children}
    </Stack>
  );
}

function TopLabeled({ label, children }) {
  return (
    <Stack spacing={0.75}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 17, fontWeight: 500 }, '& .MuiSelect-select': { fontSize: 17, fontWeight: 500 } }}>
        {children}
      </Box>
    </Stack>
  );
}

function Metric({ label, value }) {
  return (
    <Stack>
      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{value}</Typography>
    </Stack>
  );
}

function computeApplicantMonthly(key, d) {
  const a = d[key] || {};
  const hourlyRate = toNumber(a.hourlyRate);
  const weeklyOvertimeHours = toNumber(a.weeklyOvertimeHours);
  const fixedMonthly = toNumber(a.fixedMonthly);
  const annualSalary = toNumber(a.annualSalary);
  const ssi = toNumber(a.ssi);
  const childSupport = toNumber(a.childSupport);
  const retirement = toNumber(a.retirement);
  const other = toNumber(a.other);

  const base = hourlyRate * 40 * 4.33;
  const overtime = hourlyRate * 1.5 * weeklyOvertimeHours * 4.33;
  const salaryMonthly = annualSalary / 12;
  const ssiAdj = ssi * 1.25;
  const childAdj = childSupport * 1.25;

  return base + overtime + fixedMonthly + salaryMonthly + ssiAdj + childAdj + retirement + other;
}

function computeTotalDebt(d) {
  const e = d.expenses || {};
  return ['housing','auto','creditCards','studentLoans','personalLoans','other']
    .map((f) => parseFloat(e[f] || 0) || 0)
    .reduce((a,b)=>a+b,0);
}

function currency(val) {
  const num = Number(val || 0);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function deepSet(obj, path, value) {
  const keys = path.split('.');
  let curr = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    curr[k] = curr[k] || {};
    curr = curr[k];
  }
  curr[keys[keys.length - 1]] = value;
  return obj;
}

function defaultCalculator() {
  return {
    applicant: { hourlyRate: '', weeklyOvertimeHours: '', fixedMonthly: '', annualSalary: '', ssi: '', childSupport: '', retirement: '', other: '' },
    coapplicant: { hourlyRate: '', weeklyOvertimeHours: '', fixedMonthly: '', annualSalary: '', ssi: '', childSupport: '', retirement: '', other: '' },
    additional: { midscore: '', transunionHigh: '', equifaxLow: '', taxRate: '' },
    expenses: { householdSize: '', housing: '', auto: '', creditCards: '', studentLoans: '', personalLoans: '', other: '' }
  };
}

function NumericField({ value, onChange, sx }) {
  return <TextField type="text" inputProps={{ inputMode: 'decimal' }} value={value} onChange={onChange} fullWidth size="medium" sx={sx} />;
}

function TotalBox({ value }) {
  return (
    <Box sx={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 1,
      p: 1,
      minHeight: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography sx={{
        color: 'white',
        fontWeight: 700,
        fontSize: 16,
        textAlign: 'center'
      }}>
        {value}
      </Typography>
    </Box>
  );
}

function CombinedBox({ value }) {
  return (
    <Typography sx={{
      color: '#90caf9',
      fontWeight: 700,
      fontSize: 18,
      textAlign: 'center',
      minWidth: 120
    }}>
      {value}
    </Typography>
  );
}

function toNumber(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; }

function CreditScoreInput({ label, value, onChange, getScoreColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <TextField
        size="small"
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Score"
        sx={{
          width: 80,
          '& .MuiInputBase-input': {
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
            color: getScoreColor(value),
            padding: '6px 8px'
          }
        }}
      />
    </Box>
  );
}

export default FinancialCalculator;


