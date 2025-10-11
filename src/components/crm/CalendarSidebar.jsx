import React from 'react';
import {
  Drawer,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Divider,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarSidebar = ({
  open,
  onClose,
  onAddEvent,
  users,
  selectedUserFilters,
  onFilterChange,
  onDateSelect,
  selectedDate
}) => {
  const mdAbove = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const allSelected = users.length > 0 && selectedUserFilters.length === users.length;

  const handleViewAllChange = (checked) => {
    if (checked) {
      onFilterChange(users.map(u => u.email));
    } else {
      onFilterChange([]);
    }
  };

  const handleUserToggle = (userEmail) => {
    if (selectedUserFilters.includes(userEmail)) {
      onFilterChange(selectedUserFilters.filter(f => f !== userEmail));
    } else {
      onFilterChange([...selectedUserFilters, userEmail]);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={mdAbove ? 'permanent' : 'temporary'}
      sx={{
        width: 280,
        flexShrink: 0,
        zIndex: mdAbove ? 2 : 1300,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          position: mdAbove ? 'relative' : 'fixed',
          borderRight: 'none'
        }
      }}
    >
      {/* Add Event Button */}
      <Box sx={{ p: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onAddEvent}
          startIcon={<AddIcon />}
          sx={{ py: 1.5, fontSize: 15, fontWeight: 600 }}
        >
          Add Event
        </Button>
      </Box>

      <Divider />

      {/* Inline Date Picker */}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, '& .react-datepicker': { border: 'none', boxShadow: 'none' } }}>
        <DatePicker
          inline
          selected={selectedDate}
          onChange={onDateSelect}
        />
      </Box>

      <Divider />

      {/* User Filters */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: 16, fontWeight: 600 }}>
          Team Members
        </Typography>

        {/* View All */}
        <FormControlLabel
          sx={{ mb: 1.5, display: 'flex' }}
          control={
            <Checkbox
              color="secondary"
              checked={allSelected}
              onChange={(e) => handleViewAllChange(e.target.checked)}
            />
          }
          label={<Typography sx={{ fontSize: 14, fontWeight: 500 }}>View All</Typography>}
        />

        {/* Individual User Filters */}
        {users.length > 0 ? (
          users.map((user) => (
            <FormControlLabel
              key={user.id}
              sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
              control={
                <Checkbox
                  checked={selectedUserFilters.includes(user.email)}
                  onChange={() => handleUserToggle(user.email)}
                  sx={{
                    color: user.color,
                    '&.Mui-checked': {
                      color: user.color
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: user.color 
                    }} 
                  />
                  <Typography sx={{ fontSize: 14 }}>{user.name}</Typography>
                </Box>
              }
            />
          ))
        ) : (
          <Typography sx={{ color: 'text.secondary', fontSize: 13, fontStyle: 'italic' }}>
            No team members at this location
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default CalendarSidebar;

