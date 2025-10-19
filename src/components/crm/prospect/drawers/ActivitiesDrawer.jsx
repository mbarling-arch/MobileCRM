import React from 'react';
import { Drawer, Box, Typography, Stack, IconButton, Button, Chip } from '@mui/material';
import { 
  Close as CloseIcon, 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  Event as EventIcon, 
  Home as HomeIcon 
} from '@mui/icons-material';

export const ActivitiesDrawer = ({
  open,
  onClose,
  activities,
  buyerName,
  getUserDisplayName,
  onCallClick,
  onEmailClick,
  onAppointmentClick,
  onVisitClick
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': 
        return <PhoneIcon sx={{ fontSize: 20, color: 'info.main' }} />;
      case 'email': 
        return <EmailIcon sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'appointment': 
        return <EventIcon sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'visit': 
        return <HomeIcon sx={{ fontSize: 20, color: 'secondary.main' }} />;
      default: 
        return <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Activity Timeline</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                {buyerName}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              onClick={onCallClick}
              size="small"
              variant="contained"
              color="primary"
              fullWidth
            >
              Call
            </Button>
            <Button
              onClick={onEmailClick}
              size="small"
              variant="contained"
              color="info"
              fullWidth
            >
              Email
            </Button>
            <Button
              onClick={onAppointmentClick}
              size="small"
              variant="contained"
              color="secondary"
              fullWidth
            >
              Appointment
            </Button>
            <Button
              onClick={onVisitClick}
              size="small"
              variant="contained"
              color="warning"
              fullWidth
            >
              Visit
            </Button>
          </Stack>
        </Box>

        {/* Activities List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={2}>
            {activities.map((item) => (
              <Box
                key={item.id}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ mt: 0.5 }}>
                    {getActivityIcon(item.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
                      {item.subtitle}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                        {item.createdAt?.toDate?.().toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) || 'Recently'}
                      </Typography>
                      <Chip 
                        size="small"
                        label={getUserDisplayName(item.createdBy)} 
                        sx={{ 
                          bgcolor: 'primary.lighterOpacity', 
                          color: 'primary.main',
                          height: 20,
                          fontSize: 11
                        }} 
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))}
            {activities.length === 0 && (
              <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                No activities yet.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

