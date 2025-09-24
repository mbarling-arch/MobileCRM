import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';

function SaveListDialog({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setFavorite(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Save List View</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="View Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <FormControlLabel control={<Checkbox checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />} label="Add to favorites" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave({ name: name.trim(), favorite })} disabled={!name.trim()}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveListDialog;



