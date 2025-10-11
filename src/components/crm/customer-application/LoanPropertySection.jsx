import React from 'react';
import {
  Stack,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControlLabel as MuiFormControlLabel
} from '@mui/material';

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
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
};

export const LoanPropertySection = ({ data, onChange }) => {
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
        <MuiFormControlLabel
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
        <MuiFormControlLabel
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
};

