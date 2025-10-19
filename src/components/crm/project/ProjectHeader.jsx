import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';

export const ProjectHeader = ({ project }) => {
  return (
    <Paper
      elevation={6}
      sx={{
        backgroundColor: 'customColors.calendarHeaderBackground',
        border: '1px solid',
        borderColor: 'customColors.calendarBorder',
        borderRadius: 4,
        p: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 2 }}>
        {project.address}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Lot Number
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.lotNumber || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Lot Size
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.lotSize ? `${project.lotSize} acres` : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Land Owner
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.landOwner || '—'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Home
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.homeDetails ? `${project.homeDetails.factory} ${project.homeDetails.model}` : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Offline Date
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.offlineDate || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Property Status
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                {project.propertyStatus ? project.propertyStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

