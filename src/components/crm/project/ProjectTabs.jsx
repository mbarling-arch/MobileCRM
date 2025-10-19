import React from 'react';
import { Box, Typography } from '@mui/material';
import { PROJECT_TABS } from '../../../constants/projectConstants';

export const ProjectTabs = ({ activeTab, setActiveTab }) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, borderBottom: '2px solid', borderColor: 'divider' }}>
      {PROJECT_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              px: 3,
              py: 1.5,
              backgroundColor: isActive ? 'background.paper' : 'transparent',
              borderTop: '2px solid',
              borderLeft: '2px solid',
              borderRight: '2px solid',
              borderColor: isActive ? 'divider' : 'transparent',
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              marginBottom: isActive ? '-2px' : 0,
              zIndex: isActive ? 2 : 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: isActive ? 'background.paper' : 'action.hover'
              }
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'primary.main' : 'text.secondary',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

