import React, { useState } from 'react';
import { Dialog, Box, Typography, IconButton, Button, Paper, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { FormTextField, FormSelect } from '../../../FormField';

export const HousingNeedsModal = ({
  open,
  onClose,
  housingForm,
  handleHousingChange,
  handleNestedChange,
  saveHousingData,
  savingHousing
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = async () => {
    await saveHousingData();
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = async () => {
    await saveHousingData();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
        {/* Header with Close */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
            Home Needs - {currentStep === 0 ? 'Housing Information' : currentStep === 1 ? 'Home Placement' : 'Lender Information'}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
          {/* Page 1: Housing Information */}
          {currentStep === 0 && (
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                Housing Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Home Preferences Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Home Preferences
                    </Typography>
                  </Box>
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 2 }}>
                        <FormSelect
                          label="Home Type"
                          value={housingForm.homeType || ''}
                          onChange={handleHousingChange('homeType')}
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
                          value={housingForm.prefBed || ''}
                          onChange={handleHousingChange('prefBed')}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormTextField
                          label="Bath"
                          type="number"
                          value={housingForm.prefBath || ''}
                          onChange={handleHousingChange('prefBath')}
                        />
                      </Box>
                    </Box>
                    <FormTextField
                      label="Sq Footage"
                      type="number"
                      value={housingForm.prefSqft || ''}
                      onChange={handleHousingChange('prefSqft')}
                    />
                    <FormTextField
                      label="Desired Features"
                      value={housingForm.desiredFeatures || ''}
                      onChange={handleHousingChange('desiredFeatures')}
                      multiline
                      minRows={2}
                    />
                  </Stack>
                </Box>

                {/* Current Living Column */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Current Living
                    </Typography>
                  </Box>
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <FormSelect
                          label="Own/Rent"
                          value={housingForm.currentOwnRent || ''}
                          onChange={handleHousingChange('currentOwnRent')}
                          options={[
                            { value: 'own', label: 'Own' },
                            { value: 'rent', label: 'Rent' }
                          ]}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormSelect
                          label="Apt/Home"
                          value={housingForm.currentHomeType || ''}
                          onChange={handleHousingChange('currentHomeType')}
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
                          value={housingForm.currentHowLong || ''}
                          onChange={handleHousingChange('currentHowLong')}
                          placeholder="e.g., 2 years"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 2 }}>
                        <FormTextField
                          label="Current Payment"
                          type="number"
                          value={housingForm.currentMonthlyPayment || ''}
                          onChange={handleHousingChange('currentMonthlyPayment')}
                          InputProps={{ startAdornment: '$' }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormTextField
                          label="Bed"
                          type="number"
                          value={housingForm.currentBed || ''}
                          onChange={handleHousingChange('currentBed')}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormTextField
                          label="Bath"
                          type="number"
                          value={housingForm.currentBath || ''}
                          onChange={handleHousingChange('currentBath')}
                        />
                      </Box>
                    </Box>
                    <FormTextField
                      label="Likes"
                      value={housingForm.likes || ''}
                      onChange={handleHousingChange('likes')}
                      multiline
                      minRows={2}
                    />
                    <FormTextField
                      label="Dislikes"
                      value={housingForm.dislikes || ''}
                      onChange={handleHousingChange('dislikes')}
                      multiline
                      minRows={2}
                    />
                  </Stack>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Page 2: Home Placement */}
          {currentStep === 1 && (
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                Home Placement - Additional fields...
              </Typography>
            </Paper>
          )}

          {/* Page 3: Lender Information */}
          {currentStep === 2 && (
            <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 3 }}>
                Lender Information - Additional fields...
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentStep === 0 || savingHousing}
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
            {savingHousing ? 'Saving...' : 'Previous'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {[0, 1, 2].map((step) => (
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
            disabled={savingHousing}
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
            {savingHousing ? 'Saving...' : (currentStep === 2 ? 'Save & Close' : 'Next')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

