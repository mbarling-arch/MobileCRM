import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import GlobalDataTable from './GlobalDataTable';

function ListContainer({
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  backButton,
  children,
  tableProps = {}
}) {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        {(title || subtitle || actions || backButton) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {title && (
                <Typography variant="h4" gutterBottom>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body1" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {backButton}
              {actions}
            </Box>
          </Box>
        )}

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => onTabChange && onTabChange(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Custom content or DataTable */}
        {children ? (
          children
        ) : (
          <GlobalDataTable {...tableProps} />
        )}
      </Stack>
    </Box>
  );
}

export default ListContainer;



