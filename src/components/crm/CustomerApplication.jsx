import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  Step,
  StepLabel,
  Stepper,
  Container,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { db } from '../../firebase';

function CustomerApplication() {
  const { prospectId } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationData, setApplicationData] = useState({});
  const [saving, setSaving] = useState(false);
  const [prospectData, setProspectData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application sections with all form fields
  const applicationSections = [
    {
      title: "Loan & Property Information",
      description: "Property details and loan requirements",
      fields: ['loanType', 'streetAddress', 'city', 'state', 'zip', 'county', 'purchasePrice', 'estimatedLandValue', 'dateAcquired', 'propertyWillBe', 'siteRentIncrease', 'siteRentExplanation', 'hoaFee', 'hoaFrequency', 'residentOwnedCommunity', 'coOpSecurityInterest']
    },
    {
      title: "Applicant & Co-Applicant Info", 
      description: "Personal information for both applicants",
      fields: ['applicantName', 'applicantBirthDate', 'applicantSSN', 'applicantMaritalStatus', 'applicantEmail', 'applicantCellPhone', 'applicantOtherPhone', 'coApplicantName', 'coApplicantBirthDate', 'coApplicantSSN', 'coApplicantMaritalStatus', 'coApplicantEmail', 'coApplicantCellPhone', 'coApplicantOtherPhone']
    },
    {
      title: "Residence & Employment",
      description: "Current and previous address and employment history",
      fields: ['residenceHistory', 'employmentHistory']
    },
    {
      title: "Income & Financial Details",
      description: "Income sources, debts, and assets",
      fields: ['incomeDetails', 'otherIncome', 'debtsAssets']
    },
    {
      title: "Expenses & Background",
      description: "Monthly expenses and background questions",
      fields: ['expenses', 'backgroundQuestions']
    },
    {
      title: "Demographics & Signatures",
      description: "Optional demographic information and required signatures",
      fields: ['demographics', 'signatures']
    }
  ];

  useEffect(() => {
    const loadProspectData = async () => {
      if (!companyId || !prospectId) return;
      
      try {
        const prospectDoc = await getDoc(doc(db, 'companies', companyId, 'prospects', prospectId));
        if (prospectDoc.exists()) {
          setProspectData(prospectDoc.data());
          // Pre-populate form with existing data if available
          setApplicationData(prev => ({
            ...prev,
            ...prospectDoc.data()
          }));
        }
      } catch (error) {
        console.error('Error loading prospect data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProspectData();
  }, [companyId, prospectId]);

  const handleFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'companies', companyId, 'prospects', prospectId, 'application'), {
        ...applicationData,
        updatedAt: serverTimestamp(),
        status: currentStep === applicationSections.length - 1 ? 'submitted' : 'in_progress',
        submittedAt: currentStep === applicationSections.length - 1 ? serverTimestamp() : null
      });
      
      if (currentStep === applicationSections.length - 1) {
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < applicationSections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#1a1625', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography sx={{ color: 'white', fontSize: 18 }}>Loading application...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1625', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: '#2a2746', 
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center'
        }}>
          <Typography sx={{ color: 'white', fontSize: 28, fontWeight: 700, mb: 1 }}>
            Customer Application
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
            Please complete all sections to submit your application
          </Typography>
        </Paper>

        {/* Progress Stepper */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: '#2a2746', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {applicationSections.map((section, index) => (
              <Step key={section.title}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': { 
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-active': { color: 'white' },
                      '&.Mui-completed': { color: 'rgba(255,255,255,0.9)' }
                    },
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255,255,255,0.3)',
                      '&.Mui-active': { color: '#1976d2' },
                      '&.Mui-completed': { color: '#4caf50' }
                    }
                  }}
                >
                  {section.title}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper sx={{ 
          p: 4, 
          mb: 3, 
          backgroundColor: '#2a2746', 
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: '500px'
        }}>
          <Typography sx={{ color: 'white', fontSize: 24, fontWeight: 600, mb: 1 }}>
            {applicationSections[currentStep]?.title}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
            {applicationSections[currentStep]?.description}
          </Typography>

          {/* Form fields based on current step */}
          {currentStep === 0 && <LoanPropertySection data={applicationData} onChange={handleFieldChange} />}
          {currentStep === 1 && <ApplicantInfoSection data={applicationData} onChange={handleFieldChange} />}
          {currentStep === 2 && <ResidenceEmploymentSection data={applicationData} onChange={handleFieldChange} />}
          {currentStep === 3 && <IncomeFinancialSection data={applicationData} onChange={handleFieldChange} />}
          {currentStep === 4 && <ExpensesBackgroundSection data={applicationData} onChange={handleFieldChange} />}
          {currentStep === 5 && <DemographicsSignaturesSection data={applicationData} onChange={handleFieldChange} />}
        </Paper>

        {/* Navigation */}
        <Paper sx={{ 
          p: 3, 
          backgroundColor: '#2a2746', 
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={currentStep === 0}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.4)' }
            }}
          >
            ← Previous
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={saving}
              sx={{ 
                color: '#ffd700', 
                borderColor: '#ffd700',
                '&:hover': { borderColor: '#ffed4e' }
              }}
            >
              {saving ? 'Saving...' : '💾 Save Draft'}
            </Button>
            
            {currentStep < applicationSections.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  backgroundColor: '#1976d2', 
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ 
                  backgroundColor: '#4caf50', 
                  '&:hover': { backgroundColor: '#45a049' }
                }}
              >
                {saving ? 'Submitting...' : '✅ Submit Application'}
              </Button>
            )}
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Need help? Contact us for assistance with your application.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

// Section 1: Loan & Property Information
function LoanPropertySection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Loan Type"
            value={data.loanType || ''}
            onChange={onChange('loanType')}
            sx={fieldSx}
          >
            <MenuItem value="Home Only">Home Only</MenuItem>
            <MenuItem value="Land and Home">Land and Home</MenuItem>
            <MenuItem value="Land Only">Land Only</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Purchase Price/Payoff"
            type="number"
            value={data.purchasePrice || ''}
            onChange={onChange('purchasePrice')}
            InputProps={{ startAdornment: '$' }}
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 18 }}>Property Address</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={data.streetAddress || ''}
            onChange={onChange('streetAddress')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="City"
            value={data.city || ''}
            onChange={onChange('city')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="State"
            value={data.state || ''}
            onChange={onChange('state')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Zip Code"
            value={data.zip || ''}
            onChange={onChange('zip')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="County"
            value={data.county || ''}
            onChange={onChange('county')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Estimated Land Value"
            type="number"
            value={data.estimatedLandValue || ''}
            onChange={onChange('estimatedLandValue')}
            InputProps={{ startAdornment: '$' }}
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 18 }}>Property Details</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date Acquired"
            type="date"
            value={data.dateAcquired || ''}
            onChange={onChange('dateAcquired')}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Property Will Be"
            value={data.propertyWillBe || ''}
            onChange={onChange('propertyWillBe')}
            sx={fieldSx}
          >
            <MenuItem value="Primary Residence">Primary Residence</MenuItem>
            <MenuItem value="Secondary Residence">Secondary Residence</MenuItem>
            <MenuItem value="Investment/Rental">Investment/Rental</MenuItem>
            <MenuItem value="Buy-For">Buy-For</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <FormControl component="fieldset">
          <FormLabel sx={{ color: 'white', mb: 2 }}>Site Rent Increase in 3 Years?</FormLabel>
          <RadioGroup
            value={data.siteRentIncrease || ''}
            onChange={onChange('siteRentIncrease')}
            row
          >
            <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
            <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
          </RadioGroup>
        </FormControl>
        {data.siteRentIncrease === 'Yes' && (
          <TextField
            fullWidth
            label="Explanation"
            multiline
            rows={3}
            value={data.siteRentExplanation || ''}
            onChange={onChange('siteRentExplanation')}
            sx={{ ...fieldSx, mt: 2 }}
          />
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="HOA Fee"
            type="number"
            value={data.hoaFee || ''}
            onChange={onChange('hoaFee')}
            InputProps={{ startAdornment: '$' }}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="HOA Frequency"
            value={data.hoaFrequency || ''}
            onChange={onChange('hoaFrequency')}
            sx={fieldSx}
          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Quarterly">Quarterly</MenuItem>
            <MenuItem value="Annually">Annually</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.residentOwnedCommunity || false}
              onChange={onChange('residentOwnedCommunity')}
              sx={{ color: 'white' }}
            />
          }
          label="Will Home Be in a Resident-Owned Community?"
          sx={{ color: 'white' }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={data.coOpSecurityInterest || false}
              onChange={onChange('coOpSecurityInterest')}
              sx={{ color: 'white' }}
            />
          }
          label="Co-Op Security Interest Pledged?"
          sx={{ color: 'white' }}
        />
      </Stack>
    </Stack>
  );
}

// Section 2: Applicant & Co-Applicant Info
function ApplicantInfoSection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      {/* Applicant Information */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Primary Applicant Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={data.applicantName || ''}
              onChange={onChange('applicantName')}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Birth Date"
              type="date"
              value={data.applicantBirthDate || ''}
              onChange={onChange('applicantBirthDate')}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Social Security Number"
              type="password"
              value={data.applicantSSN || ''}
              onChange={onChange('applicantSSN')}
              placeholder="XXX-XX-XXXX"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Marital Status"
              value={data.applicantMaritalStatus || ''}
              onChange={onChange('applicantMaritalStatus')}
              sx={fieldSx}
            >
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Unmarried">Unmarried</MenuItem>
              <MenuItem value="Separated">Separated</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={data.applicantEmail || ''}
              onChange={onChange('applicantEmail')}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Cell Phone"
              value={data.applicantCellPhone || ''}
              onChange={onChange('applicantCellPhone')}
              placeholder="(XXX) XXX-XXXX"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Other Phone"
              value={data.applicantOtherPhone || ''}
              onChange={onChange('applicantOtherPhone')}
              placeholder="(XXX) XXX-XXXX"
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Co-Applicant Information */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Co-Applicant Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={data.coApplicantName || ''}
              onChange={onChange('coApplicantName')}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Birth Date"
              type="date"
              value={data.coApplicantBirthDate || ''}
              onChange={onChange('coApplicantBirthDate')}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Social Security Number"
              type="password"
              value={data.coApplicantSSN || ''}
              onChange={onChange('coApplicantSSN')}
              placeholder="XXX-XX-XXXX"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Marital Status"
              value={data.coApplicantMaritalStatus || ''}
              onChange={onChange('coApplicantMaritalStatus')}
              sx={fieldSx}
            >
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Unmarried">Unmarried</MenuItem>
              <MenuItem value="Separated">Separated</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={data.coApplicantEmail || ''}
              onChange={onChange('coApplicantEmail')}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Cell Phone"
              value={data.coApplicantCellPhone || ''}
              onChange={onChange('coApplicantCellPhone')}
              placeholder="(XXX) XXX-XXXX"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Other Phone"
              value={data.coApplicantOtherPhone || ''}
              onChange={onChange('coApplicantOtherPhone')}
              placeholder="(XXX) XXX-XXXX"
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}

// Section 3: Residence & Employment
function ResidenceEmploymentSection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      {/* Applicant Residence */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Primary Applicant - Residence History
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Current Address</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={data.applicantCurrentAddress || ''}
                onChange={onChange('applicantCurrentAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={data.applicantCurrentCity || ''}
                onChange={onChange('applicantCurrentCity')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={data.applicantCurrentState || ''}
                onChange={onChange('applicantCurrentState')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip"
                value={data.applicantCurrentZip || ''}
                onChange={onChange('applicantCurrentZip')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="County"
                value={data.applicantCurrentCounty || ''}
                onChange={onChange('applicantCurrentCounty')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mailing Address (if different)"
                value={data.applicantMailingAddress || ''}
                onChange={onChange('applicantMailingAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Housing Status"
                value={data.applicantHousingStatus || ''}
                onChange={onChange('applicantHousingStatus')}
                sx={fieldSx}
              >
                <MenuItem value="Homeowner">Homeowner</MenuItem>
                <MenuItem value="Renter">Renter</MenuItem>
                <MenuItem value="Live with Family">Live with Family</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Monthly Mortgage/Rent"
                type="number"
                value={data.applicantMonthlyPayment || ''}
                onChange={onChange('applicantMonthlyPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Years at Address"
                type="number"
                value={data.applicantYearsAtAddress || ''}
                onChange={onChange('applicantYearsAtAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Months"
                type="number"
                value={data.applicantMonthsAtAddress || ''}
                onChange={onChange('applicantMonthsAtAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plans for Current Home"
                multiline
                rows={2}
                value={data.applicantHomePlans || ''}
                onChange={onChange('applicantHomePlans')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Previous Address (if < 3 years) */}
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Previous Address (if less than 3 years at current)</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Previous Address"
                value={data.applicantPreviousAddress || ''}
                onChange={onChange('applicantPreviousAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Years"
                type="number"
                value={data.applicantPreviousYears || ''}
                onChange={onChange('applicantPreviousYears')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Months"
                type="number"
                value={data.applicantPreviousMonths || ''}
                onChange={onChange('applicantPreviousMonths')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Previous Landlord/Mortgage Holder"
                value={data.applicantPreviousLandlord || ''}
                onChange={onChange('applicantPreviousLandlord')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Phone Number"
                value={data.applicantPreviousLandlordPhone || ''}
                onChange={onChange('applicantPreviousLandlordPhone')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Co-Applicant Residence */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Co-Applicant - Residence History
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Current Address</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={data.coApplicantCurrentAddress || ''}
                onChange={onChange('coApplicantCurrentAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={data.coApplicantCurrentCity || ''}
                onChange={onChange('coApplicantCurrentCity')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={data.coApplicantCurrentState || ''}
                onChange={onChange('coApplicantCurrentState')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip"
                value={data.coApplicantCurrentZip || ''}
                onChange={onChange('coApplicantCurrentZip')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Housing Status"
                value={data.coApplicantHousingStatus || ''}
                onChange={onChange('coApplicantHousingStatus')}
                sx={fieldSx}
              >
                <MenuItem value="Homeowner">Homeowner</MenuItem>
                <MenuItem value="Renter">Renter</MenuItem>
                <MenuItem value="Live with Family">Live with Family</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Monthly Mortgage/Rent"
                type="number"
                value={data.coApplicantMonthlyPayment || ''}
                onChange={onChange('coApplicantMonthlyPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Years"
                type="number"
                value={data.coApplicantYearsAtAddress || ''}
                onChange={onChange('coApplicantYearsAtAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Months"
                type="number"
                value={data.coApplicantMonthsAtAddress || ''}
                onChange={onChange('coApplicantMonthsAtAddress')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Employment History */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Employment History
        </Typography>
        
        {/* Applicant Employment */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Primary Applicant - Current Employer</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Employer"
                value={data.applicantCurrentEmployer || ''}
                onChange={onChange('applicantCurrentEmployer')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position/Title"
                value={data.applicantPosition || ''}
                onChange={onChange('applicantPosition')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date Started"
                type="date"
                value={data.applicantEmploymentStartDate || ''}
                onChange={onChange('applicantEmploymentStartDate')}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Income"
                type="number"
                value={data.applicantMonthlyIncome || ''}
                onChange={onChange('applicantMonthlyIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employer Address"
                value={data.applicantEmployerAddress || ''}
                onChange={onChange('applicantEmployerAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={data.applicantEmployerCity || ''}
                onChange={onChange('applicantEmployerCity')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={data.applicantEmployerState || ''}
                onChange={onChange('applicantEmployerState')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip"
                value={data.applicantEmployerZip || ''}
                onChange={onChange('applicantEmployerZip')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supervisor Name"
                value={data.applicantSupervisorName || ''}
                onChange={onChange('applicantSupervisorName')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supervisor Phone"
                value={data.applicantSupervisorPhone || ''}
                onChange={onChange('applicantSupervisorPhone')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.applicantSelfEmployed || false}
                    onChange={onChange('applicantSelfEmployed')}
                    sx={{ color: 'white' }}
                  />
                }
                label="Self-Employed?"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Co-Applicant Employment */}
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Co-Applicant - Current Employer</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Employer"
                value={data.coApplicantCurrentEmployer || ''}
                onChange={onChange('coApplicantCurrentEmployer')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position/Title"
                value={data.coApplicantPosition || ''}
                onChange={onChange('coApplicantPosition')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date Started"
                type="date"
                value={data.coApplicantEmploymentStartDate || ''}
                onChange={onChange('coApplicantEmploymentStartDate')}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Income"
                type="number"
                value={data.coApplicantMonthlyIncome || ''}
                onChange={onChange('coApplicantMonthlyIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employer Address"
                value={data.coApplicantEmployerAddress || ''}
                onChange={onChange('coApplicantEmployerAddress')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supervisor Name"
                value={data.coApplicantSupervisorName || ''}
                onChange={onChange('coApplicantSupervisorName')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supervisor Phone"
                value={data.coApplicantSupervisorPhone || ''}
                onChange={onChange('coApplicantSupervisorPhone')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.coApplicantSelfEmployed || false}
                    onChange={onChange('coApplicantSelfEmployed')}
                    sx={{ color: 'white' }}
                  />
                }
                label="Self-Employed?"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Previous Employment */}
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Previous Employment (if less than 3 years at current job)</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Previous Employer (Applicant)"
                value={data.applicantPreviousEmployer || ''}
                onChange={onChange('applicantPreviousEmployer')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Previous Employer (Co-Applicant)"
                value={data.coApplicantPreviousEmployer || ''}
                onChange={onChange('coApplicantPreviousEmployer')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Explanation for any job gaps greater than 30 days"
                multiline
                rows={3}
                value={data.jobGapExplanation || ''}
                onChange={onChange('jobGapExplanation')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Stack>
  );
}

// Section 4: Income & Financial Details
function IncomeFinancialSection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      {/* Primary Applicant Income */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Primary Applicant - Income Details
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Pay Rate"
                type="number"
                value={data.applicantBasePayRate || ''}
                onChange={onChange('applicantBasePayRate')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="How Are You Paid?"
                value={data.applicantPayFrequency || ''}
                onChange={onChange('applicantPayFrequency')}
                sx={fieldSx}
              >
                <MenuItem value="Hourly">Hourly</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                type="number"
                value={data.applicantHourlyRate || ''}
                onChange={onChange('applicantHourlyRate')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hours Per Week"
                type="number"
                value={data.applicantHoursPerWeek || ''}
                onChange={onChange('applicantHoursPerWeek')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Typography sx={{ color: 'white', fontWeight: 600, mt: 3, mb: 2 }}>Additional Income</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.applicantBonuses || false}
                    onChange={onChange('applicantBonuses')}
                    sx={{ color: 'white' }}
                  />
                }
                label="Bonuses?"
                sx={{ color: 'white' }}
              />
              {data.applicantBonuses && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Bonus Frequency"
                    value={data.applicantBonusFrequency || ''}
                    onChange={onChange('applicantBonusFrequency')}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Bonus Amount"
                    type="number"
                    value={data.applicantBonusAmount || ''}
                    onChange={onChange('applicantBonusAmount')}
                    InputProps={{ startAdornment: '$' }}
                    sx={fieldSx}
                  />
                </Stack>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.applicantCommissions || false}
                    onChange={onChange('applicantCommissions')}
                    sx={{ color: 'white' }}
                  />
                }
                label="Commissions?"
                sx={{ color: 'white' }}
              />
              {data.applicantCommissions && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Commission Frequency"
                    value={data.applicantCommissionFrequency || ''}
                    onChange={onChange('applicantCommissionFrequency')}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Commission Amount"
                    type="number"
                    value={data.applicantCommissionAmount || ''}
                    onChange={onChange('applicantCommissionAmount')}
                    InputProps={{ startAdornment: '$' }}
                    sx={fieldSx}
                  />
                </Stack>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.applicantOvertime || false}
                    onChange={onChange('applicantOvertime')}
                    sx={{ color: 'white' }}
                  />
                }
                label="Overtime?"
                sx={{ color: 'white' }}
              />
              {data.applicantOvertime && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Overtime Frequency"
                    value={data.applicantOvertimeFrequency || ''}
                    onChange={onChange('applicantOvertimeFrequency')}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Overtime Amount"
                    type="number"
                    value={data.applicantOvertimeAmount || ''}
                    onChange={onChange('applicantOvertimeAmount')}
                    InputProps={{ startAdornment: '$' }}
                    sx={fieldSx}
                  />
                </Stack>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Co-Applicant Income */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Co-Applicant - Income Details
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Pay Rate"
                type="number"
                value={data.coApplicantBasePayRate || ''}
                onChange={onChange('coApplicantBasePayRate')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="How Are You Paid?"
                value={data.coApplicantPayFrequency || ''}
                onChange={onChange('coApplicantPayFrequency')}
                sx={fieldSx}
              >
                <MenuItem value="Hourly">Hourly</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Other Income */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Other Income Sources
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SSI"
                type="number"
                value={data.ssiIncome || ''}
                onChange={onChange('ssiIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Retirement"
                type="number"
                value={data.retirementIncome || ''}
                onChange={onChange('retirementIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Disability"
                type="number"
                value={data.disabilityIncome || ''}
                onChange={onChange('disabilityIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alimony"
                type="number"
                value={data.alimonyIncome || ''}
                onChange={onChange('alimonyIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Child Support"
                type="number"
                value={data.childSupportIncome || ''}
                onChange={onChange('childSupportIncome')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Income Source"
                value={data.otherIncomeSource || ''}
                onChange={onChange('otherIncomeSource')}
                placeholder="Describe other income"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Other Income Amount"
                type="number"
                value={data.otherIncomeAmount || ''}
                onChange={onChange('otherIncomeAmount')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Debts & Assets */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Debts & Assets
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Monthly Debt Obligations</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Personal Loans (Monthly Payment)"
                type="number"
                value={data.personalLoansPayment || ''}
                onChange={onChange('personalLoansPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Car Loans (Monthly Payment)"
                type="number"
                value={data.carLoansPayment || ''}
                onChange={onChange('carLoansPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Credit Cards (Monthly Payment)"
                type="number"
                value={data.creditCardsPayment || ''}
                onChange={onChange('creditCardsPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Debts (Monthly Payment)"
                type="number"
                value={data.otherDebtsPayment || ''}
                onChange={onChange('otherDebtsPayment')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Typography sx={{ color: 'white', fontWeight: 600, mt: 3, mb: 2 }}>Assets</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Retirement Accounts Balance"
                type="number"
                value={data.retirementAccountsBalance || ''}
                onChange={onChange('retirementAccountsBalance')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Savings/CDs/Brokerage Balance"
                type="number"
                value={data.savingsBalance || ''}
                onChange={onChange('savingsBalance')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Assets"
                value={data.otherAssets || ''}
                onChange={onChange('otherAssets')}
                placeholder="Describe other assets"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Assets Value"
                type="number"
                value={data.otherAssetsValue || ''}
                onChange={onChange('otherAssetsValue')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Stack>
  );
}

// Section 5: Expenses & Background Questions
function ExpensesBackgroundSection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      {/* Monthly Expenses */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Monthly Expenses
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Fuel/Maintenance Expenses"
                type="number"
                value={data.fuelMaintenanceExpenses || ''}
                onChange={onChange('fuelMaintenanceExpenses')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Childcare Expenses"
                type="number"
                value={data.childcareExpenses || ''}
                onChange={onChange('childcareExpenses')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alimony/Maintenance Expenses"
                type="number"
                value={data.alimonyExpenses || ''}
                onChange={onChange('alimonyExpenses')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alimony Expiration Date"
                type="date"
                value={data.alimonyExpirationDate || ''}
                onChange={onChange('alimonyExpirationDate')}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Garnishment Expenses"
                type="number"
                value={data.garnishmentExpenses || ''}
                onChange={onChange('garnishmentExpenses')}
                InputProps={{ startAdornment: '$' }}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Background Questions */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Background Questions
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Government Assistance Programs (Optional)"
              multiline
              rows={3}
              value={data.governmentAssistance || ''}
              onChange={onChange('governmentAssistance')}
              placeholder="List any government assistance programs you participate in"
              sx={fieldSx}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel sx={{ color: 'white', mb: 1 }}>Are you a US Citizen?</FormLabel>
                  <RadioGroup
                    value={data.usCitizen || ''}
                    onChange={onChange('usCitizen')}
                    row
                  >
                    <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
                    <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel sx={{ color: 'white', mb: 1 }}>Are you a Permanent Resident Alien?</FormLabel>
                  <RadioGroup
                    value={data.permanentResident || ''}
                    onChange={onChange('permanentResident')}
                    row
                  >
                    <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
                    <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Have you filed for bankruptcy in the last 5 years?</FormLabel>
                <RadioGroup
                  value={data.bankruptcy || ''}
                  onChange={onChange('bankruptcy')}
                  row
                >
                  <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
                  <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
                </RadioGroup>
              </FormControl>
              {data.bankruptcy === 'Yes' && (
                <TextField
                  fullWidth
                  label="Bankruptcy Date"
                  type="date"
                  value={data.bankruptcyDate || ''}
                  onChange={onChange('bankruptcyDate')}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...fieldSx, mt: 2 }}
                />
              )}
            </Box>

            <Box>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Are you a co-signer on other debt?</FormLabel>
                <RadioGroup
                  value={data.coSignerOnDebt || ''}
                  onChange={onChange('coSignerOnDebt')}
                  row
                >
                  <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
                  <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
                </RadioGroup>
              </FormControl>
              {data.coSignerOnDebt === 'Yes' && (
                <TextField
                  fullWidth
                  label="Co-Signer Details"
                  multiline
                  rows={2}
                  value={data.coSignerDetails || ''}
                  onChange={onChange('coSignerDetails')}
                  sx={{ ...fieldSx, mt: 2 }}
                />
              )}
            </Box>

            <Box>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Have you paid off any debt in the last 60 days?</FormLabel>
                <RadioGroup
                  value={data.paidOffDebt || ''}
                  onChange={onChange('paidOffDebt')}
                  row
                >
                  <FormControlLabel value="Yes" control={<Radio sx={{ color: 'white' }} />} label="Yes" sx={{ color: 'white' }} />
                  <FormControlLabel value="No" control={<Radio sx={{ color: 'white' }} />} label="No" sx={{ color: 'white' }} />
                </RadioGroup>
              </FormControl>
              {data.paidOffDebt === 'Yes' && (
                <TextField
                  fullWidth
                  label="Paid Off Debt Details"
                  multiline
                  rows={2}
                  value={data.paidOffDebtDetails || ''}
                  onChange={onChange('paidOffDebtDetails')}
                  sx={{ ...fieldSx, mt: 2 }}
                />
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

// Section 6: Demographics & Signatures
function DemographicsSignaturesSection({ data, onChange }) {
  return (
    <Stack spacing={4}>
      {/* Demographics - Optional */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Demographic Information (Optional)
        </Typography>
        
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Primary Applicant</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Ethnicity</FormLabel>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Checkbox checked={data.applicantEthnicityHispanic || false} onChange={onChange('applicantEthnicityHispanic')} sx={{ color: 'white' }} />}
                    label="Hispanic or Latino"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={data.applicantEthnicityNotHispanic || false} onChange={onChange('applicantEthnicityNotHispanic')} sx={{ color: 'white' }} />}
                    label="Not Hispanic or Latino"
                    sx={{ color: 'white' }}
                  />
                </Stack>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Race</FormLabel>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Checkbox checked={data.applicantRaceWhite || false} onChange={onChange('applicantRaceWhite')} sx={{ color: 'white' }} />}
                    label="White"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={data.applicantRaceBlack || false} onChange={onChange('applicantRaceBlack')} sx={{ color: 'white' }} />}
                    label="Black or African American"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={data.applicantRaceAsian || false} onChange={onChange('applicantRaceAsian')} sx={{ color: 'white' }} />}
                    label="Asian"
                    sx={{ color: 'white' }}
                  />
                </Stack>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel sx={{ color: 'white', mb: 1 }}>Sex</FormLabel>
                <RadioGroup
                  value={data.applicantSex || ''}
                  onChange={onChange('applicantSex')}
                  row
                >
                  <FormControlLabel value="Male" control={<Radio sx={{ color: 'white' }} />} label="Male" sx={{ color: 'white' }} />
                  <FormControlLabel value="Female" control={<Radio sx={{ color: 'white' }} />} label="Female" sx={{ color: 'white' }} />
                  <FormControlLabel value="No Response" control={<Radio sx={{ color: 'white' }} />} label="I do not wish to provide" sx={{ color: 'white' }} />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Signatures */}
      <Box>
        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 20, mb: 3 }}>
          Required Signatures
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack spacing={4}>
            {/* Applicant Signature */}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Primary Applicant Signature</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Digital Signature (Type Full Name)"
                    value={data.applicantSignature || ''}
                    onChange={onChange('applicantSignature')}
                    placeholder="Type your full legal name"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={data.applicantSignatureDate || ''}
                    onChange={onChange('applicantSignatureDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Co-Applicant Signature */}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Co-Applicant Signature</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Digital Signature (Type Full Name)"
                    value={data.coApplicantSignature || ''}
                    onChange={onChange('coApplicantSignature')}
                    placeholder="Type your full legal name"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={data.coApplicantSignatureDate || ''}
                    onChange={onChange('coApplicantSignatureDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Disclosures */}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Important Disclosures</Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>
                  By submitting this application, I/we certify that the information provided is true and complete to the best of my/our knowledge. 
                  I/we authorize the lender to verify any information contained in this application and to order consumer credit reports.
                </Typography>
              </Paper>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.agreementAcknowledged || false}
                    onChange={onChange('agreementAcknowledged')}
                    sx={{ color: 'white' }}
                  />
                }
                label="I acknowledge that I have read and understand the above disclosures"
                sx={{ color: 'white', mt: 2 }}
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default CustomerApplication;

// Field styling
const fieldSx = {
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiInputBase-input': { color: 'white' },
  '& .MuiSelect-select': { color: 'white' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' }
};
