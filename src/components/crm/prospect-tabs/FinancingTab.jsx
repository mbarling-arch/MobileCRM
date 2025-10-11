import React, { useState } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Stack } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Description as DocumentIcon, CheckCircle as CheckIcon, PendingActions as PendingIcon } from '@mui/icons-material';

const FinancingTab = ({ context }) => {
  const {
    financingData,
    saveFinancingData
  } = context;

  const [expanded, setExpanded] = useState('application');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const sections = [
    {
      id: 'application',
      title: 'Application',
      icon: <DocumentIcon />,
      status: 'in-progress',
      description: 'Customer application status and documentation'
    },
    {
      id: 'pre-approval',
      title: 'Pre-Approval',
      icon: <PendingIcon />,
      status: 'pending',
      description: 'Pre-approval process and requirements'
    },
    {
      id: 'approved',
      title: 'Approved',
      icon: <CheckIcon />,
      status: 'pending',
      description: 'Final approval documentation and details'
    },
    {
      id: 'closing',
      title: 'Closing',
      icon: <DocumentIcon />,
      status: 'pending',
      description: 'Closing documents, schedules, and requirements'
    },
    {
      id: 'funding',
      title: 'Funding',
      icon: <DocumentIcon />,
      status: 'pending',
      description: 'Funding details, disbursement, and tracking'
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
              <Typography sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}>
                {section.description}
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: 'action.hover', border: '1px dashed', borderColor: 'customColors.calendarBorder' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, textAlign: 'center' }}>
                  Content for {section.title} section will be implemented here.
                </Typography>
              </Paper>

              {/* Placeholder for future content */}
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 600, mb: 1 }}>
                  Coming Soon:
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                  • Document upload and management<br />
                  • Status tracking and updates<br />
                  • Timeline and milestone tracking<br />
                  • Notes and communication history
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FinancingTab;
