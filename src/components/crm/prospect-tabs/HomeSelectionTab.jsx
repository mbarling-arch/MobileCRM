import React, { useState } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Stack } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Home as HomeIcon, Payment as PaymentIcon, Description as DescriptionIcon } from '@mui/icons-material';
import EMC from '../EMC';
import DepositTab from './DepositTab';
import ApplicationTab from './ApplicationTab';

const HomeSelectionTab = ({ prospectId, userProfile, isDeal, context }) => {
  const [expanded, setExpanded] = useState('emc');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const sections = [
    {
      id: 'emc',
      title: 'EMC Tool',
      icon: <HomeIcon />,
      status: 'in-progress',
      description: 'Estimate Monthly Cost - Configure and calculate home pricing'
    },
    {
      id: 'deposit',
      title: 'Deposits',
      icon: <PaymentIcon />,
      status: 'pending',
      description: 'Track customer deposits and payment history'
    },
    {
      id: 'application',
      title: 'Application',
      icon: <DescriptionIcon />,
      status: 'pending',
      description: 'Complete customer application process'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Not Started';
    }
  };

  const renderContent = (sectionId) => {
    switch (sectionId) {
      case 'emc':
        return (
          <EMC
            companyId={userProfile?.companyId}
            prospectId={prospectId}
            isDeal={isDeal}
          />
        );
      case 'deposit':
        return (
          <DepositTab
            prospectId={prospectId}
            isDeal={isDeal}
            context={context}
          />
        );
      case 'application':
        return (
          <ApplicationTab
            prospectId={prospectId}
            isDeal={isDeal}
            context={context}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {sections.map((section) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          sx={{
            mb: 1.5,
            backgroundColor: 'customColors.calendarHeaderBackground',
            border: '1px solid',
            borderColor: 'customColors.calendarBorder',
            '&:before': { display: 'none' },
            boxShadow: expanded === section.id ? 6 : 2,
            transition: 'all 0.3s ease'
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
            sx={{
              minHeight: 64,
              '&.Mui-expanded': {
                minHeight: 64,
                backgroundColor: 'action.hover'
              },
              '& .MuiAccordionSummary-content': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                my: 1.5
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                {section.icon}
              </Box>
              <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 16 }}>
                {section.title}
              </Typography>
            </Stack>
            <Chip
              label={getStatusLabel(section.status)}
              color={getStatusColor(section.status)}
              size="small"
              sx={{ mr: 1 }}
            />
          </AccordionSummary>
          
          <AccordionDetails sx={{ p: 3, borderTop: '1px solid', borderTopColor: 'customColors.calendarBorder' }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', mb: 3, fontStyle: 'italic', fontSize: 14 }}>
                {section.description}
              </Typography>
              
              {renderContent(section.id)}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default HomeSelectionTab;

