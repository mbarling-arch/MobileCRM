import React from 'react';
import {
  Stack,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider
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

export const ApplicantInfoSection = ({ data, onChange }) => {
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
              <MenuItem value="Single">Single</MenuItem>
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cell Phone"
              value={data.applicantCellPhone || ''}
              onChange={onChange('applicantCellPhone')}
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
              <MenuItem value="Single">Single</MenuItem>
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cell Phone"
              value={data.coApplicantCellPhone || ''}
              onChange={onChange('coApplicantCellPhone')}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};

