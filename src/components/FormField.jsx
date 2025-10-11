import React from 'react';
import {
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography
} from '@mui/material';

// Standard TextField wrapper with consistent styling
export function FormTextField({
  label,
  value,
  onChange,
  required = false,
  fullWidth = true,
  type = 'text',
  multiline = false,
  minRows = 1,
  InputLabelProps,
  inputProps,
  SelectProps,
  ...props
}) {
  // Hide number input arrows
  const finalInputProps = {
    ...inputProps,
    ...(type === 'number' && {
      sx: {
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        ...inputProps?.sx,
      },
    }),
  };

  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      multiline={multiline}
      minRows={minRows}
      InputLabelProps={{
        shrink: true, // Always show label at top
        ...InputLabelProps
      }}
      inputProps={finalInputProps}
      SelectProps={SelectProps}
      {...props}
    />
  );
}

// Select field with menu items
export function FormSelect({
  label,
  value,
  onChange,
  options = [],
  required = false,
  fullWidth = true,
  zIndexOffset = 50,
  InputLabelProps,
  ...props
}) {
  return (
    <TextField
      select
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      InputLabelProps={{
        shrink: true, // Always show label at top
        ...InputLabelProps
      }}
      SelectProps={{
        MenuProps: {
          sx: { zIndex: (t) => t.zIndex.modal + zIndexOffset }
        }
      }}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

// Grid layout for form fields
export function FormGrid({ children, spacing = 2, ...props }) {
  return (
    <Grid container spacing={spacing} {...props}>
      {children}
    </Grid>
  );
}

export function FormGridItem({ xs = 12, sm, md, lg, children }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      {children}
    </Grid>
  );
}

// Standard form structure
export function FormSection({ title, children, ...props }) {
  return (
    <Box {...props}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}
