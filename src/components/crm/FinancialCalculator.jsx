import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Grid, TextField, Divider, Button, Paper } from '@mui/material';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

function FinancialCalculator({ companyId, prospectId, initial }) {
  const [data, setData] = useState(defaultCalculator());
  const [saving, setSaving] = useState(false);

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
    } finally {
      setSaving(false);
    }
  };

  const cellInputSx = {
    '& .MuiInputBase-root': {
      height: 44,
      borderRadius: 1,
      border: '1px solid rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(0,0,0,0.15)',
      '&:hover': {
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.2)'
      },
      '&.Mui-focused': {
        borderColor: '#90caf9',
        backgroundColor: 'rgba(0,0,0,0.2)'
      }
    },
    '& .MuiInputBase-input': {
      fontSize: 14,
      textAlign: 'center',
      padding: '12px 8px',
      color: 'white',
      '&::placeholder': {
        color: 'rgba(255,255,255,0.5)',
        opacity: 1
      }
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      {/* Left Side: Combined Monthly Income */}
      <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
        <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 3 }}>
              Combined Monthly Income
            </Typography>

            {/* Income Table */}
            <Box sx={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 1, overflow: 'hidden' }}>
              {/* Table Header */}
              <Box sx={{
                display: 'flex',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                py: 1.5,
                px: 2
              }}>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Income Source</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 14 }}>Applicant</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 14 }}>Co-Applicant</Typography>
                </Box>
              </Box>

              {/* Income Rows */}
              <IncomeTableRow label="Hourly Rate" key="hourlyRate" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Overtime Hours" key="weeklyOvertimeHours" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Annual Salary" key="annualSalary" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Fixed Monthly" key="fixedMonthly" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="SSI/Disability" key="ssi" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Child Support" key="childSupport" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Retirement" key="retirement" data={data} setField={setField} inputSx={cellInputSx} />
              <IncomeTableRow label="Other Income" key="other" data={data} setField={setField} inputSx={cellInputSx} />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Right Side: Additional Information + Combined Total */}
      <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
        <Paper sx={{ p: 3, backgroundColor: '#2a2746', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 2 }}>Additional Information</Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 3 }} />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Additional Information Fields */}
            <Stack spacing={3} sx={{ flex: 1 }}>
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
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Combined Monthly Income</Typography>
                <CombinedBox value={currency(grossMonthlyIncome)} />
              </Box>
            </Box>

            {/* Save Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function IncomeTableRow({ label, key, data, setField, inputSx }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      py: 1.5,
      px: 2,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      '&:last-child': { borderBottom: 'none' }
    }}>
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <NumericField
          value={data.applicant[key] || ''}
          onChange={setField(`applicant.${key}`)}
          sx={inputSx}
        />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <NumericField
          value={data.coapplicant[key] || ''}
          onChange={setField(`coapplicant.${key}`)}
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
    <Stack spacing={0.5}>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>{label}</Typography>
      <Box sx={{ '& .MuiInputBase-input': { fontSize: 16 }, '& .MuiSelect-select': { fontSize: 16 } }}>
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

export default FinancialCalculator;


