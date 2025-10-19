import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Paper, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { CreditSnapshotDisplay } from './CreditSnapshotDisplay';
import { CreditSnapshotEdit } from './CreditSnapshotEdit';

export const CreditSnapshotModal = ({ 
  open, 
  onClose, 
  creditData, 
  setCreditData, 
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving credit snapshot:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          Credit Snapshot
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outlined" 
              size="small"
            >
              Edit
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave} 
                variant="contained" 
                color="success" 
                size="small"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outlined" 
                size="small"
              >
                Cancel
              </Button>
            </>
          )}
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Paper sx={{ 
          p: 3, 
          backgroundColor: 'customColors.calendarHeaderBackground', 
          borderRadius: 2, 
          border: '1px solid', 
          borderColor: 'customColors.calendarBorder' 
        }}>
          {!isEditing ? (
            <CreditSnapshotDisplay creditData={creditData} />
          ) : (
            <CreditSnapshotEdit creditData={creditData} setCreditData={setCreditData} />
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

