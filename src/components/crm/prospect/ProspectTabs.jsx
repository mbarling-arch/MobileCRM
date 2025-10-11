import React, { useState } from 'react';
import { Box, Collapse, Typography, Stack, ButtonBase } from '@mui/material';

export const ProspectTabs = ({ activeTab, setActiveTab }) => {
  const [expandedSections, setExpandedSections] = useState({
    'buyer-information': false,
    'home-selection': false,
    'financing': false
  });

  // Navigation structure with nested items
  const navStructure = [
    {
      id: 'buyer-information',
      label: 'Buyer Information',
      children: [
        { id: 'contact-info', label: 'Contact Info', parent: 'buyer-information' },
        { id: 'housing-needs', label: 'Housing Needs', parent: 'buyer-information' },
        { id: 'home-placement', label: 'Home Placement', parent: 'buyer-information' },
        { id: 'lender-info', label: 'Lender Info', parent: 'buyer-information' }
      ]
    },
    {
      id: 'calculator',
      label: 'Financial Analysis',
      children: null
    },
    {
      id: 'home-selection',
      label: 'Home Selection',
      children: [
        { id: 'emc', label: 'EMC Tool', parent: 'home-selection' },
        { id: 'deposits', label: 'Deposits', parent: 'home-selection' },
        { id: 'application', label: 'Application', parent: 'home-selection' }
      ]
    },
    {
      id: 'home-land-info',
      label: 'Home/Land Info',
      children: null
    },
    {
      id: 'financing',
      label: 'Financing',
      children: [
        { id: 'fin-application', label: 'Application', parent: 'financing' },
        { id: 'pre-approval', label: 'Pre-Approval', parent: 'financing' },
        { id: 'approved', label: 'Approved', parent: 'financing' },
        { id: 'closing', label: 'Closing', parent: 'financing' },
        { id: 'funding', label: 'Funding', parent: 'financing' }
      ]
    },
    {
      id: 'deal-builder',
      label: 'Deal Builder',
      children: null
    },
    {
      id: 'project',
      label: 'Project',
      children: null
    }
  ];

  const handleMainItemClick = (item) => {
    setActiveTab(item.id);
    if (item.children) {
      setExpandedSections(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = false;
        });
        newState[item.id] = true;
        return newState;
      });
    } else {
      setExpandedSections(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = false;
        });
        return newState;
      });
    }
  };

  const handleSubItemClick = (subItem) => {
    setActiveTab(subItem.parent);
  };

  return (
    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'customColors.calendarBorder', borderRadius: 3 } }}>
      {/* Vertical Progress Line */}
      <Box sx={{ position: 'absolute', left: '50%', top: 55, bottom: 20, width: 3, backgroundColor: 'customColors.calendarBorder', transform: 'translateX(-50%)', zIndex: 0 }} />

      <Stack spacing={2.5}>
        {navStructure.map((item) => (
          <Box key={item.id} sx={{ position: 'relative', zIndex: 1 }}>
            {/* Main Pill Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: item.children && expandedSections[item.id] ? 1.5 : 0 }}>
              <ButtonBase
                onClick={() => handleMainItemClick(item)}
                sx={{
                  width: '92%',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: activeTab === item.id ? 'primary.main' : 'action.hover',
                  px: 3,
                  py: 1.75,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === item.id ? '0 4px 12px rgba(140, 87, 255, 0.4)' : '0 2px 6px rgba(0,0,0,0.08)',
                  '&:hover': {
                    backgroundColor: activeTab === item.id ? 'primary.dark' : 'action.selected',
                    transform: 'scale(1.03)',
                    boxShadow: activeTab === item.id ? '0 6px 16px rgba(140, 87, 255, 0.5)' : '0 3px 10px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Typography sx={{ fontSize: 15, fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? 'primary.contrastText' : 'text.primary', textAlign: 'center' }}>
                  {item.label}
                </Typography>
              </ButtonBase>
            </Box>

            {/* Sub Items */}
            {item.children && (
              <Collapse in={expandedSections[item.id]} timeout="auto" unmountOnExit>
                <Box sx={{ position: 'relative', px: 4, pb: 2 }}>
                  <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: 'customColors.calendarBorder', transform: 'translateX(-50%)' }} />
                  <Stack spacing={0.75}>
                    {item.children.map((subItem) => (
                      <Box key={subItem.id} sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: 'customColors.calendarBorder', zIndex: 0 }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'customColors.calendarBorder', position: 'absolute', left: 'calc(50% - 5px)', zIndex: 1 }} />
                        <ButtonBase
                          onClick={() => handleSubItemClick(subItem)}
                          sx={{ flex: 1, py: 1.25, px: 2, justifyContent: 'center', borderRadius: 2, zIndex: 2, backgroundColor: 'customColors.calendarHeaderBackground', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', textAlign: 'center' }}>
                            {subItem.label}
                          </Typography>
                        </ButtonBase>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
