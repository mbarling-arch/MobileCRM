import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DepositTab from './DepositTab';
import ApplicationTab from './ApplicationTab';

const HomeSelectionTab = ({ prospectId, userProfile, isDeal, context }) => {
  const [depositsExpanded, setDepositsExpanded] = useState(false);
  const [applicationExpanded, setApplicationExpanded] = useState(false);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Game Plan and EMC Tool moved to modal buttons in right panel */}
      
      {/* Deposits Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: depositsExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setDepositsExpanded(!depositsExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: depositsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Deposits
            </Typography>
          </Box>
        </Box>
        <Collapse in={depositsExpanded} timeout="auto">
          <DepositTab
            prospectId={prospectId}
            isDeal={isDeal}
            context={context}
          />
        </Collapse>
      </Paper>

      {/* Application Section */}
      <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', borderRadius: 2, border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: applicationExpanded ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton 
              onClick={() => setApplicationExpanded(!applicationExpanded)} 
              sx={{ 
                color: 'text.primary',
                transform: applicationExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.3s'
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20 }}>
              Application
            </Typography>
          </Box>
        </Box>
        <Collapse in={applicationExpanded} timeout="auto">
          <ApplicationTab
            prospectId={prospectId}
            userProfile={userProfile}
            context={context}
          />
        </Collapse>
      </Paper>
    </Box>
  );
};

export default HomeSelectionTab;
