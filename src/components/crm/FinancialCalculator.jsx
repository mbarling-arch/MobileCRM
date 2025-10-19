import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Grid, TextField, Divider, Button, Paper, IconButton, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Upload as UploadIcon, ExpandMore as ExpandMoreIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { db } from '../../firebase';
import { doc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FormTextField } from '../FormField';
import { populateTemplate } from '../../utils/documentParser';

function FinancialCalculator({ companyId, prospectId, initial, context }) {
  const [data, setData] = useState(defaultCalculator());
  const [saving, setSaving] = useState(false);
  const [creditExpanded, setCreditExpanded] = useState(true);
  const [editingCredit, setEditingCredit] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [fairCreditForm, setFairCreditForm] = useState(null);

  const { creditData, setCreditData, saveCreditData, coBuyerInfo, buyerInfo, prospect } = context || {};
  

  useEffect(() => {
    setData({ ...defaultCalculator(), ...(initial || {}) });
  }, [initial]);

  // Load Fair Credit Auth form
  useEffect(() => {
    const loadFairCreditForm = async () => {
      if (!companyId) return;
      try {
        const formsRef = collection(db, 'companies', companyId, 'forms');
        const q = query(formsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fairCredit = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .find(form => form.subcategory === 'Fair Credit Auth');
        
        setFairCreditForm(fairCredit || null);
      } catch (error) {
        console.error('Error loading Fair Credit Auth form:', error);
      }
    };
    
    loadFairCreditForm();
  }, [companyId]);

  const setField = (path) => (e) => {
    const value = e?.target?.value ?? e;
    setData((d) => deepSet({ ...d }, path, value));
  };


  const handleSaveCredit = async () => {
    if (saveCreditData) {
      await saveCreditData();
    }
    setEditingCredit(false);
  };

  const handleGenerateFairCredit = async () => {
    try {
      if (!buyerInfo?.firstName && !buyerInfo?.lastName) {
        alert('Please add buyer information before generating the Fair Credit Auth form.');
        return;
      }

      if (!fairCreditForm) {
        alert('Fair Credit Auth form template not found. Please upload it in the Forms management page.');
        return;
      }

      setGeneratingDoc(true);
      
      // Populate and download the template as PDF
      const success = await populateTemplate(fairCreditForm, buyerInfo, coBuyerInfo, creditData, prospect, true);
      
      if (success) {
        alert('✅ Fair Credit Auth generated as PDF!\n\nThe document has been downloaded to your Downloads folder.');
      }
    } catch (error) {
      console.error('Error generating Fair Credit Auth:', error);
      alert(`Error generating document: ${error.message}`);
    } finally {
      setGeneratingDoc(false);
    }
  };

  const handleSoftPull = () => {
    alert('Soft Pull feature coming soon!');
  };

  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (!numScore || isNaN(numScore)) return 'text.disabled';
    if (numScore >= 720) return 'success.main';
    if (numScore >= 650) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Credit Snapshot Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: creditExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setCreditExpanded(!creditExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: creditExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Credit Snapshot
            </Typography>
            </Box>
          <Stack direction="row" spacing={1}>
            {!editingCredit ? (
              <IconButton onClick={() => setEditingCredit(true)} sx={{ color: 'text.primary' }}>
                <EditIcon />
              </IconButton>
            ) : (
              <>
                <Button onClick={handleSaveCredit} variant="contained" color="success" size="small" disabled={saving}>Save</Button>
                <Button onClick={() => setEditingCredit(false)} variant="outlined" size="small" sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}>Cancel</Button>
              </>
            )}
          </Stack>
          </Box>
        <Collapse in={creditExpanded} timeout="auto">
          {!editingCredit ? (
            <CreditSnapshotDisplay 
              creditData={creditData} 
              onGenerateFairCredit={handleGenerateFairCredit}
              onSoftPull={handleSoftPull}
              generatingDoc={generatingDoc}
            />
          ) : (
            <CreditSnapshotEdit 
              creditData={creditData} 
              setCreditData={setCreditData}
              onGenerateFairCredit={handleGenerateFairCredit}
              onSoftPull={handleSoftPull}
              generatingDoc={generatingDoc}
            />
          )}
        </Collapse>
      </Paper>
    </Box>
  );
}

// Income Display View Component
function IncomeDisplayView({ data, applicantMonthly, coappMonthly, grossMonthlyIncome, hasIncomeData, onOpenBudget }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{currency(v)}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  const incomeFields = [
    { key: 'hourlyRate', label: 'Hourly Rate' },
    { key: 'weeklyOvertimeHours', label: 'Overtime Hours (Weekly)' },
    { key: 'annualSalary', label: 'Annual Salary' },
    { key: 'fixedMonthly', label: 'Fixed Monthly' },
    { key: 'ssi', label: 'SSI/Disability' },
    { key: 'childSupport', label: 'Child Support' },
    { key: 'retirement', label: 'Retirement' },
    { key: 'other', label: 'Other Income' }
  ];

  const buyerFilledFields = incomeFields.filter(field => data.applicant[field.key]);
  const coBuyerFilledFields = incomeFields.filter(field => data.coapplicant[field.key]);

  // If no data, just show the Start Budget button
  if (!hasIncomeData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <Button
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onOpenBudget}
          size="large"
        >
          Start Budget
                  </Button>
                </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Income Column */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Income
            </Typography>
              </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              {buyerFilledFields.length > 0 ? (
                buyerFilledFields.map(field => (
                  <TopLabeled key={field.key} label={field.label}>{show(data.applicant[field.key])}</TopLabeled>
                ))
              ) : (
                <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 2 }}>
                  No income data entered
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <TopLabeled label="Monthly Total">
                <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currency(applicantMonthly)}</Typography>
              </TopLabeled>
            </Box>
          </Box>
        </Box>

        {/* Co-Buyer Income Column */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Income
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              {coBuyerFilledFields.length > 0 ? (
                coBuyerFilledFields.map(field => (
                  <TopLabeled key={field.key} label={field.label}>{show(data.coapplicant[field.key])}</TopLabeled>
                ))
              ) : (
                <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center', py: 2 }}>
                  No income data entered
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <TopLabeled label="Monthly Total">
                <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currency(coappMonthly)}</Typography>
              </TopLabeled>
            </Box>
          </Box>
              </Box>
            </Box>

      {/* Combined Total */}
      <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid', borderTopColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>Combined Monthly Income</Typography>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 22 }}>{currency(grossMonthlyIncome)}</Typography>
          </Box>
      </Box>
    </Box>
  );
}

// Income Modal Form Component
function IncomeModalForm({ data, setField, hasCoBuyer, applicantMonthly, coappMonthly, grossMonthlyIncome }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Income Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Income
        </Typography>
      </Box>
          <Stack spacing={2.5}>
            <FormTextField 
              label="Hourly Rate" 
              type="number"
              value={data.applicant.hourlyRate || ''} 
              onChange={setField('applicant.hourlyRate')}
            />
            <FormTextField 
              label="Overtime Hours (Weekly)" 
              type="number"
              value={data.applicant.weeklyOvertimeHours || ''} 
              onChange={setField('applicant.weeklyOvertimeHours')}
            />
            <FormTextField 
              label="Annual Salary" 
              type="number"
              value={data.applicant.annualSalary || ''} 
              onChange={setField('applicant.annualSalary')}
            />
            <FormTextField 
              label="Fixed Monthly" 
              type="number"
              value={data.applicant.fixedMonthly || ''} 
              onChange={setField('applicant.fixedMonthly')}
            />
            <FormTextField 
              label="SSI/Disability" 
              type="number"
              value={data.applicant.ssi || ''} 
              onChange={setField('applicant.ssi')}
            />
            <FormTextField 
              label="Child Support" 
              type="number"
              value={data.applicant.childSupport || ''} 
              onChange={setField('applicant.childSupport')}
            />
            <FormTextField 
              label="Retirement" 
              type="number"
              value={data.applicant.retirement || ''} 
              onChange={setField('applicant.retirement')}
            />
            <FormTextField 
              label="Other Income" 
              type="number"
              value={data.applicant.other || ''} 
              onChange={setField('applicant.other')}
            />
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
              <TopLabeled label="Monthly Total">
                <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currency(applicantMonthly)}</Typography>
              </TopLabeled>
      </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Income Column */}
        {hasCoBuyer ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
              <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                Co-Buyer Income
              </Typography>
            </Box>
            <Stack spacing={2.5}>
              <FormTextField 
                label="Hourly Rate" 
                type="number"
                value={data.coapplicant.hourlyRate || ''} 
                onChange={setField('coapplicant.hourlyRate')}
              />
              <FormTextField 
                label="Overtime Hours (Weekly)" 
                type="number"
                value={data.coapplicant.weeklyOvertimeHours || ''} 
                onChange={setField('coapplicant.weeklyOvertimeHours')}
              />
              <FormTextField 
                label="Annual Salary" 
                type="number"
                value={data.coapplicant.annualSalary || ''} 
                onChange={setField('coapplicant.annualSalary')}
              />
              <FormTextField 
                label="Fixed Monthly" 
                type="number"
                value={data.coapplicant.fixedMonthly || ''} 
                onChange={setField('coapplicant.fixedMonthly')}
              />
              <FormTextField 
                label="SSI/Disability" 
                type="number"
                value={data.coapplicant.ssi || ''} 
                onChange={setField('coapplicant.ssi')}
              />
              <FormTextField 
                label="Child Support" 
                type="number"
                value={data.coapplicant.childSupport || ''} 
                onChange={setField('coapplicant.childSupport')}
              />
              <FormTextField 
                label="Retirement" 
                type="number"
                value={data.coapplicant.retirement || ''} 
                onChange={setField('coapplicant.retirement')}
              />
              <FormTextField 
                label="Other Income" 
                type="number"
                value={data.coapplicant.other || ''} 
                onChange={setField('coapplicant.other')}
              />
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                <TopLabeled label="Monthly Total">
                  <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{currency(coappMonthly)}</Typography>
                </TopLabeled>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 15, textAlign: 'center' }}>
              No Co-Buyer added
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Combined Total */}
      <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid', borderTopColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>Combined Monthly Income</Typography>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 22 }}>{currency(grossMonthlyIncome)}</Typography>
        </Box>
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

function computeDebtTotal(key, d) {
  const debts = d[key] || {};
  return ['payment1', 'payment2', 'payment3', 'payment4', 'payment5', 'payment6', 'deferredStudentLoans', 'collection1', 'collection2', 'collection3', 'collection4', 'collection5']
    .map((f) => parseFloat(debts[f] || 0) || 0)
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
    expenses: { householdSize: '', housing: '', auto: '', creditCards: '', studentLoans: '', personalLoans: '', other: '' },
    buyerDebts: { 
      payment1: '', payment2: '', payment3: '', payment4: '', payment5: '', payment6: '',
      deferredStudentLoans: '',
      collection1: '', collection2: '', collection3: '', collection4: '', collection5: ''
    },
    coBuyerDebts: { 
      payment1: '', payment2: '', payment3: '', payment4: '', payment5: '', payment6: '',
      deferredStudentLoans: '',
      collection1: '', collection2: '', collection3: '', collection4: '', collection5: ''
    }
  };
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

// Credit Snapshot Display Component
function CreditSnapshotDisplay({ creditData, onGenerateFairCredit, onSoftPull, generatingDoc }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{v}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  const buyer = creditData || {};
  const coBuyer = creditData || {};

  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (!numScore || isNaN(numScore)) return 'text.disabled';
    if (numScore >= 720) return 'success.main';
    if (numScore >= 650) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><TopLabeled label="Date of Birth">{show(buyer.buyerDOB)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="DL">{show(buyer.buyerDL)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="State">{show(buyer.buyerDLState)}</TopLabeled></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><TopLabeled label="SSN">{show(buyer.buyerSSN)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="Gender">{show(buyer.buyerGender)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="Race">{show(buyer.buyerRace)}</TopLabeled></Box>
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><TopLabeled label="Date of Birth">{show(coBuyer.coBuyerDOB)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="DL">{show(coBuyer.coBuyerDL)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="State">{show(coBuyer.coBuyerDLState)}</TopLabeled></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}><TopLabeled label="SSN">{show(coBuyer.coBuyerSSN)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="Gender">{show(coBuyer.coBuyerGender)}</TopLabeled></Box>
              <Box sx={{ flex: 1 }}><TopLabeled label="Race">{show(coBuyer.coBuyerRace)}</TopLabeled></Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Fair Credit Auth Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
        <Button 
          variant="outlined" 
          size="large" 
          sx={{ px: 4 }}
          onClick={onGenerateFairCredit}
          disabled={generatingDoc}
          startIcon={generatingDoc ? <CircularProgress size={16} /> : null}
        >
          {generatingDoc ? 'Generating...' : 'Fair Credit Auth'}
        </Button>
      </Box>

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TopLabeled label="TransUnion">
              <Typography sx={{ color: getScoreColor(buyer.buyerTransUnion), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerTransUnion || '-'}
              </Typography>
            </TopLabeled>
            <TopLabeled label="Equifax">
              <Typography sx={{ color: getScoreColor(buyer.buyerEquifax), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerEquifax || '-'}
              </Typography>
            </TopLabeled>
            <TopLabeled label="Experian">
              <Typography sx={{ color: getScoreColor(buyer.buyerExperian), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerExperian || '-'}
              </Typography>
            </TopLabeled>
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <TopLabeled label="TransUnion">
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerTransUnion), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerTransUnion || '-'}
              </Typography>
            </TopLabeled>
            <TopLabeled label="Equifax">
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerEquifax), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerEquifax || '-'}
              </Typography>
            </TopLabeled>
            <TopLabeled label="Experian">
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerExperian), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerExperian || '-'}
              </Typography>
            </TopLabeled>
          </Stack>
        </Box>
      </Box>

      {/* Soft Pull Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          size="large" 
          sx={{ px: 4 }}
          onClick={onSoftPull}
        >
          Soft Pull
        </Button>
      </Box>
    </Box>
  );
}

// Credit Snapshot Edit Component
function CreditSnapshotEdit({ creditData, setCreditData, onGenerateFairCredit, onSoftPull, generatingDoc }) {
  const credit = creditData || {};

  const handleChange = (field) => (e) => {
    setCreditData({ ...credit, [field]: e.target.value });
  };

  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (!numScore || isNaN(numScore)) return 'text.disabled';
    if (numScore >= 720) return 'success.main';
    if (numScore >= 650) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Date of Birth" 
                  type="date"
                  value={credit.buyerDOB || ''} 
                  onChange={handleChange('buyerDOB')}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="DL" 
                  value={credit.buyerDL || ''} 
                  onChange={handleChange('buyerDL')}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="State" 
                  value={credit.buyerDLState || ''} 
                  onChange={handleChange('buyerDLState')}
                  placeholder="e.g., TX"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="SSN" 
                  value={credit.buyerSSN || ''} 
                  onChange={handleChange('buyerSSN')}
                  placeholder="XXX-XX-XXXX"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Gender" 
                  value={credit.buyerGender || ''} 
                  onChange={handleChange('buyerGender')}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Race" 
                  value={credit.buyerRace || ''} 
                  onChange={handleChange('buyerRace')}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Date of Birth" 
                  type="date"
                  value={credit.coBuyerDOB || ''} 
                  onChange={handleChange('coBuyerDOB')}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="DL" 
                  value={credit.coBuyerDL || ''} 
                  onChange={handleChange('coBuyerDL')}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="State" 
                  value={credit.coBuyerDLState || ''} 
                  onChange={handleChange('coBuyerDLState')}
                  placeholder="e.g., TX"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="SSN" 
                  value={credit.coBuyerSSN || ''} 
                  onChange={handleChange('coBuyerSSN')}
                  placeholder="XXX-XX-XXXX"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Gender" 
                  value={credit.coBuyerGender || ''} 
                  onChange={handleChange('coBuyerGender')}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormTextField 
                  label="Race" 
                  value={credit.coBuyerRace || ''} 
                  onChange={handleChange('coBuyerRace')}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Fair Credit Auth Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
        <Button 
          variant="outlined" 
          size="large" 
          sx={{ px: 4 }}
          onClick={onGenerateFairCredit}
          disabled={generatingDoc}
          startIcon={generatingDoc ? <CircularProgress size={16} /> : null}
        >
          {generatingDoc ? 'Generating...' : 'Fair Credit Auth'}
        </Button>
      </Box>

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <FormTextField 
              label="TransUnion" 
              type="number"
              value={credit.buyerTransUnion || ''} 
              onChange={handleChange('buyerTransUnion')}
              placeholder="Enter score"
            />
            <FormTextField 
              label="Equifax" 
              type="number"
              value={credit.buyerEquifax || ''} 
              onChange={handleChange('buyerEquifax')}
              placeholder="Enter score"
            />
            <FormTextField 
              label="Experian" 
              type="number"
              value={credit.buyerExperian || ''} 
              onChange={handleChange('buyerExperian')}
              placeholder="Enter score"
            />
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <FormTextField 
              label="TransUnion" 
              type="number"
              value={credit.coBuyerTransUnion || ''} 
              onChange={handleChange('coBuyerTransUnion')}
              placeholder="Enter score"
            />
            <FormTextField 
              label="Equifax" 
              type="number"
              value={credit.coBuyerEquifax || ''} 
              onChange={handleChange('coBuyerEquifax')}
              placeholder="Enter score"
            />
            <FormTextField 
              label="Experian" 
              type="number"
              value={credit.coBuyerExperian || ''} 
              onChange={handleChange('coBuyerExperian')}
              placeholder="Enter score"
            />
          </Stack>
        </Box>
      </Box>

      {/* Soft Pull Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          size="large" 
          sx={{ px: 4 }}
          onClick={onSoftPull}
        >
          Soft Pull
        </Button>
      </Box>
    </Box>
  );
}

// Obligation Display View Component
function ObligationDisplayView({ data, hasDebtData, onOpenDebts, buyerDebtTotal, coBuyerDebtTotal }) {
  const show = (v) => v ? <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>{currency(v)}</Typography> : <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>&nbsp;</Typography>;

  const paymentFields = [
    { key: 'payment1', label: 'Payment 1' },
    { key: 'payment2', label: 'Payment 2' },
    { key: 'payment3', label: 'Payment 3' },
    { key: 'payment4', label: 'Payment 4' },
    { key: 'payment5', label: 'Payment 5' },
    { key: 'payment6', label: 'Payment 6' }
  ];

  const otherDebtFields = [
    { key: 'deferredStudentLoans', label: 'Deferred Student Loans' },
    { key: 'collection1', label: 'Collection 1 (Non-Medical)' },
    { key: 'collection2', label: 'Collection 2 (Non-Medical)' },
    { key: 'collection3', label: 'Collection 3 (Non-Medical)' },
    { key: 'collection4', label: 'Collection 4 (Non-Medical)' },
    { key: 'collection5', label: 'Collection 5 (Non-Medical)' }
  ];

  const buyerDebts = data.buyerDebts || {};
  const coBuyerDebts = data.coBuyerDebts || {};
  
  const buyerFilledPayments = paymentFields.filter(field => buyerDebts[field.key]);
  const buyerFilledOther = otherDebtFields.filter(field => buyerDebts[field.key]);
  const coBuyerFilledPayments = paymentFields.filter(field => coBuyerDebts[field.key]);
  const coBuyerFilledOther = otherDebtFields.filter(field => coBuyerDebts[field.key]);

  // If no data, just show the Enter Debts button
  if (!hasDebtData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onOpenDebts}
          size="large"
        >
          Enter Debts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Buyer Column */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Buyer
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
            {/* Payments - Left Half */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                Payments
              </Typography>
              <Stack spacing={2}>
                {buyerFilledPayments.length > 0 ? (
                  buyerFilledPayments.map(field => (
                    <TopLabeled key={field.key} label={field.label}>{show(buyerDebts[field.key])}</TopLabeled>
                  ))
                ) : (
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 14, textAlign: 'center', py: 1 }}>
                    No payments
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Other Obligations - Right Half */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                Other Obligations
              </Typography>
              <Stack spacing={2}>
                {buyerFilledOther.length > 0 ? (
                  buyerFilledOther.map(field => (
                    <TopLabeled key={field.key} label={field.label}>{show(buyerDebts[field.key])}</TopLabeled>
                  ))
                ) : (
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 14, textAlign: 'center', py: 1 }}>
                    No obligations
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
          
          {/* Monthly Total */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
            <TopLabeled label="Monthly Total">
              <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currency(buyerDebtTotal)}</Typography>
            </TopLabeled>
          </Box>
        </Box>
      </Box>

      {/* Co-Buyer Column */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Co-Buyer
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
            {/* Payments - Left Half */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                Payments
              </Typography>
              <Stack spacing={2}>
                {coBuyerFilledPayments.length > 0 ? (
                  coBuyerFilledPayments.map(field => (
                    <TopLabeled key={field.key} label={field.label}>{show(coBuyerDebts[field.key])}</TopLabeled>
                  ))
                ) : (
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 14, textAlign: 'center', py: 1 }}>
                    No payments
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Other Obligations - Right Half */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                Other Obligations
              </Typography>
              <Stack spacing={2}>
                {coBuyerFilledOther.length > 0 ? (
                  coBuyerFilledOther.map(field => (
                    <TopLabeled key={field.key} label={field.label}>{show(coBuyerDebts[field.key])}</TopLabeled>
                  ))
                ) : (
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 14, textAlign: 'center', py: 1 }}>
                    No obligations
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
          
          {/* Monthly Total */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
            <TopLabeled label="Monthly Total">
              <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currency(coBuyerDebtTotal)}</Typography>
            </TopLabeled>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Debt Modal Form Component
function DebtModalForm({ data, setField, buyerDebtTotal, coBuyerDebtTotal }) {
  const buyerDebts = data.buyerDebts || {};
  const coBuyerDebts = data.coBuyerDebts || {};

  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Buyer Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Buyer
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Payments - Left Half */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
              Payments
            </Typography>
            <Stack spacing={2}>
              <FormTextField label="Payment 1" type="number" value={buyerDebts.payment1 || ''} onChange={setField('buyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 2" type="number" value={buyerDebts.payment2 || ''} onChange={setField('buyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 3" type="number" value={buyerDebts.payment3 || ''} onChange={setField('buyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 4" type="number" value={buyerDebts.payment4 || ''} onChange={setField('buyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 5" type="number" value={buyerDebts.payment5 || ''} onChange={setField('buyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 6" type="number" value={buyerDebts.payment6 || ''} onChange={setField('buyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
            </Stack>
          </Box>

          {/* Other Obligations - Right Half */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
              Other Obligations
            </Typography>
            <Stack spacing={2}>
              <FormTextField label="Deferred Student Loans" type="number" value={buyerDebts.deferredStudentLoans || ''} onChange={setField('buyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 1 (Non-Medical)" type="number" value={buyerDebts.collection1 || ''} onChange={setField('buyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 2 (Non-Medical)" type="number" value={buyerDebts.collection2 || ''} onChange={setField('buyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 3 (Non-Medical)" type="number" value={buyerDebts.collection3 || ''} onChange={setField('buyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 4 (Non-Medical)" type="number" value={buyerDebts.collection4 || ''} onChange={setField('buyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 5 (Non-Medical)" type="number" value={buyerDebts.collection5 || ''} onChange={setField('buyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
            </Stack>
          </Box>
        </Box>

        {/* Monthly Total */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
          <TopLabeled label="Monthly Total">
            <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currency(buyerDebtTotal)}</Typography>
          </TopLabeled>
        </Box>
      </Box>

      {/* Co-Buyer Column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Co-Buyer
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Payments - Left Half */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
              Payments
            </Typography>
            <Stack spacing={2}>
              <FormTextField label="Payment 1" type="number" value={coBuyerDebts.payment1 || ''} onChange={setField('coBuyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 2" type="number" value={coBuyerDebts.payment2 || ''} onChange={setField('coBuyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 3" type="number" value={coBuyerDebts.payment3 || ''} onChange={setField('coBuyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 4" type="number" value={coBuyerDebts.payment4 || ''} onChange={setField('coBuyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 5" type="number" value={coBuyerDebts.payment5 || ''} onChange={setField('coBuyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Payment 6" type="number" value={coBuyerDebts.payment6 || ''} onChange={setField('coBuyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
            </Stack>
          </Box>

          {/* Other Obligations - Right Half */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
              Other Obligations
            </Typography>
            <Stack spacing={2}>
              <FormTextField label="Deferred Student Loans" type="number" value={coBuyerDebts.deferredStudentLoans || ''} onChange={setField('coBuyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 1 (Non-Medical)" type="number" value={coBuyerDebts.collection1 || ''} onChange={setField('coBuyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 2 (Non-Medical)" type="number" value={coBuyerDebts.collection2 || ''} onChange={setField('coBuyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 3 (Non-Medical)" type="number" value={coBuyerDebts.collection3 || ''} onChange={setField('coBuyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 4 (Non-Medical)" type="number" value={coBuyerDebts.collection4 || ''} onChange={setField('coBuyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
              <FormTextField label="Collection 5 (Non-Medical)" type="number" value={coBuyerDebts.collection5 || ''} onChange={setField('coBuyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
            </Stack>
          </Box>
        </Box>

        {/* Monthly Total */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
          <TopLabeled label="Monthly Total">
            <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{currency(coBuyerDebtTotal)}</Typography>
          </TopLabeled>
        </Box>
      </Box>
    </Box>
  );
}

export default FinancialCalculator;


