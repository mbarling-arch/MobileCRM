import React, { useState } from 'react';
import { Dialog, Box, Typography, IconButton, Button, Paper, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { FormTextField } from '../../../FormField';
import { formatCurrency } from '../../../../utils/formatters';

export const BudgetCalculatorModal = ({
  open,
  onClose,
  calculatorData,
  setCalculatorField,
  applicantMonthly,
  coappMonthly,
  grossMonthlyIncome,
  buyerDebtTotal,
  coBuyerDebtTotal,
  saveCalculatorData,
  savingCalculator
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = async () => {
    await saveCalculatorData();
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = async () => {
    await saveCalculatorData();
    setCurrentStep(0);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'customColors.layoutBackground',
          borderRadius: 2,
          minHeight: '80vh'
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Budget - {currentStep === 0 ? 'Income Calculator' : 'Debts'}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
          {currentStep === 0 && (
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                Income Calculator
              </Typography>
              
              {/* Income Form */}
              <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Buyer Income Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Buyer Income
                    </Typography>
                  </Box>
                  <Stack spacing={2.5}>
                    <FormTextField label="Hourly Rate" type="number" value={calculatorData.applicant.hourlyRate || ''} onChange={setCalculatorField('applicant.hourlyRate')} />
                    <FormTextField label="Overtime Hours (Weekly)" type="number" value={calculatorData.applicant.weeklyOvertimeHours || ''} onChange={setCalculatorField('applicant.weeklyOvertimeHours')} />
                    <FormTextField label="Annual Salary" type="number" value={calculatorData.applicant.annualSalary || ''} onChange={setCalculatorField('applicant.annualSalary')} />
                    <FormTextField label="Fixed Monthly" type="number" value={calculatorData.applicant.fixedMonthly || ''} onChange={setCalculatorField('applicant.fixedMonthly')} />
                    <FormTextField label="SSI/Disability" type="number" value={calculatorData.applicant.ssi || ''} onChange={setCalculatorField('applicant.ssi')} />
                    <FormTextField label="Child Support" type="number" value={calculatorData.applicant.childSupport || ''} onChange={setCalculatorField('applicant.childSupport')} />
                    <FormTextField label="Retirement" type="number" value={calculatorData.applicant.retirement || ''} onChange={setCalculatorField('applicant.retirement')} />
                    <FormTextField label="Other Income" type="number" value={calculatorData.applicant.other || ''} onChange={setCalculatorField('applicant.other')} />
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                      <Stack spacing={0.5}>
                        <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                        <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{formatCurrency(applicantMonthly)}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* Co-Buyer Income Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Co-Buyer Income
                    </Typography>
                  </Box>
                  <Stack spacing={2.5}>
                    <FormTextField label="Hourly Rate" type="number" value={calculatorData.coapplicant.hourlyRate || ''} onChange={setCalculatorField('coapplicant.hourlyRate')} />
                    <FormTextField label="Overtime Hours (Weekly)" type="number" value={calculatorData.coapplicant.weeklyOvertimeHours || ''} onChange={setCalculatorField('coapplicant.weeklyOvertimeHours')} />
                    <FormTextField label="Annual Salary" type="number" value={calculatorData.coapplicant.annualSalary || ''} onChange={setCalculatorField('coapplicant.annualSalary')} />
                    <FormTextField label="Fixed Monthly" type="number" value={calculatorData.coapplicant.fixedMonthly || ''} onChange={setCalculatorField('coapplicant.fixedMonthly')} />
                    <FormTextField label="SSI/Disability" type="number" value={calculatorData.coapplicant.ssi || ''} onChange={setCalculatorField('coapplicant.ssi')} />
                    <FormTextField label="Child Support" type="number" value={calculatorData.coapplicant.childSupport || ''} onChange={setCalculatorField('coapplicant.childSupport')} />
                    <FormTextField label="Retirement" type="number" value={calculatorData.coapplicant.retirement || ''} onChange={setCalculatorField('coapplicant.retirement')} />
                    <FormTextField label="Other Income" type="number" value={calculatorData.coapplicant.other || ''} onChange={setCalculatorField('coapplicant.other')} />
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                      <Stack spacing={0.5}>
                        <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                        <Typography sx={{ color: 'success.main', fontSize: 20, fontWeight: 700 }}>{formatCurrency(coappMonthly)}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {/* Combined Total */}
              <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid', borderTopColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'customColors.tableRowBackground', borderRadius: 1 }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>Combined Monthly Income</Typography>
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 22 }}>{formatCurrency(grossMonthlyIncome)}</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {currentStep === 1 && (
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                Monthly Debts & Obligations
              </Typography>
              
              {/* Debt Form */}
              <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Buyer Debts Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Buyer
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    {/* Payments */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                        Payments
                      </Typography>
                      <Stack spacing={2}>
                        <FormTextField label="Payment 1" type="number" value={calculatorData.buyerDebts?.payment1 || ''} onChange={setCalculatorField('buyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 2" type="number" value={calculatorData.buyerDebts?.payment2 || ''} onChange={setCalculatorField('buyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 3" type="number" value={calculatorData.buyerDebts?.payment3 || ''} onChange={setCalculatorField('buyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 4" type="number" value={calculatorData.buyerDebts?.payment4 || ''} onChange={setCalculatorField('buyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 5" type="number" value={calculatorData.buyerDebts?.payment5 || ''} onChange={setCalculatorField('buyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 6" type="number" value={calculatorData.buyerDebts?.payment6 || ''} onChange={setCalculatorField('buyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
                      </Stack>
                    </Box>

                    {/* Collections */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                        Other Obligations
                      </Typography>
                      <Stack spacing={2}>
                        <FormTextField label="Deferred Student Loans" type="number" value={calculatorData.buyerDebts?.deferredStudentLoans || ''} onChange={setCalculatorField('buyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 1 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection1 || ''} onChange={setCalculatorField('buyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 2 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection2 || ''} onChange={setCalculatorField('buyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 3 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection3 || ''} onChange={setCalculatorField('buyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 4 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection4 || ''} onChange={setCalculatorField('buyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 5 (Non-Medical)" type="number" value={calculatorData.buyerDebts?.collection5 || ''} onChange={setCalculatorField('buyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
                      </Stack>
                    </Box>
                  </Box>

                  {/* Monthly Total */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                      <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{formatCurrency(buyerDebtTotal)}</Typography>
                    </Stack>
                  </Box>
                </Box>

                {/* Co-Buyer Debts Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Co-Buyer
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    {/* Payments */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                        Payments
                      </Typography>
                      <Stack spacing={2}>
                        <FormTextField label="Payment 1" type="number" value={calculatorData.coBuyerDebts?.payment1 || ''} onChange={setCalculatorField('coBuyerDebts.payment1')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 2" type="number" value={calculatorData.coBuyerDebts?.payment2 || ''} onChange={setCalculatorField('coBuyerDebts.payment2')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 3" type="number" value={calculatorData.coBuyerDebts?.payment3 || ''} onChange={setCalculatorField('coBuyerDebts.payment3')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 4" type="number" value={calculatorData.coBuyerDebts?.payment4 || ''} onChange={setCalculatorField('coBuyerDebts.payment4')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 5" type="number" value={calculatorData.coBuyerDebts?.payment5 || ''} onChange={setCalculatorField('coBuyerDebts.payment5')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Payment 6" type="number" value={calculatorData.coBuyerDebts?.payment6 || ''} onChange={setCalculatorField('coBuyerDebts.payment6')} InputProps={{ startAdornment: '$' }} />
                      </Stack>
                    </Box>

                    {/* Collections */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13, mb: 2, textTransform: 'uppercase' }}>
                        Other Obligations
                      </Typography>
                      <Stack spacing={2}>
                        <FormTextField label="Deferred Student Loans" type="number" value={calculatorData.coBuyerDebts?.deferredStudentLoans || ''} onChange={setCalculatorField('coBuyerDebts.deferredStudentLoans')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 1 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection1 || ''} onChange={setCalculatorField('coBuyerDebts.collection1')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 2 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection2 || ''} onChange={setCalculatorField('coBuyerDebts.collection2')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 3 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection3 || ''} onChange={setCalculatorField('coBuyerDebts.collection3')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 4 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection4 || ''} onChange={setCalculatorField('coBuyerDebts.collection4')} InputProps={{ startAdornment: '$' }} />
                        <FormTextField label="Collection 5 (Non-Medical)" type="number" value={calculatorData.coBuyerDebts?.collection5 || ''} onChange={setCalculatorField('coBuyerDebts.collection5')} InputProps={{ startAdornment: '$' }} />
                      </Stack>
                    </Box>
                  </Box>

                  {/* Monthly Total */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>Monthly Total</Typography>
                      <Typography sx={{ color: 'error.main', fontSize: 20, fontWeight: 700 }}>{formatCurrency(coBuyerDebtTotal)}</Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentStep === 0 || savingCalculator}
            sx={{ 
              minWidth: 120,
              color: 'text.primary', 
              borderColor: 'customColors.calendarBorder',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              },
              '&.Mui-disabled': {
                opacity: 0.3
              }
            }}
          >
            {savingCalculator ? 'Saving...' : 'Previous'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {[0, 1].map((step) => (
              <Box
                key={step}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: currentStep === step ? 'primary.main' : 'customColors.calendarBorder',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={savingCalculator}
            sx={{ 
              minWidth: 120,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              },
              '&.Mui-disabled': {
                opacity: 0.7
              }
            }}
          >
            {savingCalculator ? 'Saving...' : (currentStep === 1 ? 'Save & Close' : 'Next')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

