import React from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function BaseDrawer({
  open,
  onClose,
  title,
  children,
  actions,
  width = 420,
  anchor = 'right',
  zIndexOffset = 20,
  showCloseButton = true,
  ...drawerProps
}) {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{ zIndex: (t) => t.zIndex.modal + zIndexOffset }}
      PaperProps={{
        sx: {
          width,
          p: 2,
          backgroundColor: 'customColors.drawerBackground',
          borderLeft: anchor === 'right' ? '1px solid' : '1px solid',
          borderColor: 'customColors.drawerBorder'
        }
      }}
      {...drawerProps}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        {showCloseButton && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Stack spacing={2}>
        {children}

        {actions && (
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}

// Common action buttons component
export function DrawerActions({ onCancel, onSubmit, submitDisabled, submitLabel, cancelLabel = 'Cancel' }) {
  return (
    <>
      <Button variant="outlined" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="contained" onClick={onSubmit} disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </>
  );
}

export default BaseDrawer;

