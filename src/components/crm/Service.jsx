import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';

function Service() {
  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Paper 
          elevation={6}
          sx={{ 
            p: 6, 
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'customColors.calendarHeaderBackground',
            border: '1px solid',
            borderColor: 'customColors.calendarBorder'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <ConstructionIcon 
              sx={{ 
                fontSize: 80, 
                color: 'warning.main',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }} 
            />
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 700 
              }}
            >
              Under Construction
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: 400
              }}
            >
              The Service module is currently being developed. Check back soon for updates!
            </Typography>

            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'action.hover', 
                borderRadius: 2,
                width: '100%'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                This page will include service tracking, warranty management, and customer support features.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </UnifiedLayout>
  );
}

export default Service;

