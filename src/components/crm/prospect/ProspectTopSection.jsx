import React from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';

export const ProspectTopSection = ({ buyerInfo, coBuyerInfo, activeTab, setActiveTab }) => {
  // Tabs that belong in this container
  const topTabs = ['overview', 'activity', 'task', 'documents', 'forms'];
  
  // Check if current tab is one of the top tabs
  const currentTopTab = topTabs.includes(activeTab) ? activeTab : 'overview';

  return (
    <Box>
      <Paper 
        elevation={6} 
        sx={{ 
          minHeight: 280,
          backgroundColor: 'customColors.calendarHeaderBackground',
          border: '1px solid',
          borderColor: 'customColors.calendarBorder',
          borderRadius: 4,
          p: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Content Area - Always shows Overview (buyer/co-buyer info) */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Buyer and Co-Buyer contact info will go here (Overview)
          </Typography>
        </Box>

        {/* Tabs at Bottom */}
        <Box sx={{ 
          borderTop: '1px solid', 
          borderTopColor: 'customColors.calendarBorder',
          backgroundColor: 'action.hover'
        }}>
          <Tabs
            value={(() => {
              const idx = topTabs.indexOf(currentTopTab);
              return idx >= 0 ? idx : 0;
            })()}
            onChange={(_, idx) => setActiveTab(topTabs[idx])}
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
            sx={{ 
              minHeight: 48,
              '& .MuiTab-root': { 
                color: 'text.secondary', 
                fontWeight: 500, 
                minHeight: 48,
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }, 
              '& .Mui-selected': { 
                color: 'primary.main',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Activity" />
            <Tab label="Task" />
            <Tab label="Documents" />
            <Tab label="Forms" />
          </Tabs>
        </Box>
      </Paper>
    </Box>
  );
};

