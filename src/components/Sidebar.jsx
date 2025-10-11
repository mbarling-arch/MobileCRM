import React from 'react';
import {
  Drawer,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  RadioButtonUnchecked as CircleIcon,
  RadioButtonChecked as CircleFilledIcon
} from '@mui/icons-material';

const drawerWidth = 256;
const railWidth = 72;

function Sidebar({
  title,
  navigationItems = [],
  currentPath = '',
  isExpanded = true,
  pinned = false,
  onPinnedChange,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
  variant = 'permanent',
  open = true,
  onClose,
  ModalProps = { keepMounted: true }
}) {
  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={ModalProps}
      sx={{
        width: variant === 'permanent' ? (isExpanded ? drawerWidth : railWidth) : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: variant === 'permanent' ? (isExpanded ? drawerWidth : railWidth) : drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'customColors.sidebarBorder',
          boxShadow: '4px 0 12px rgba(0,0,0,0.35)',
          backgroundColor: 'customColors.sidebarBackground',
          color: 'rgba(255,255,255,0.85)',
          transition: 'width 200ms ease',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        },
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Toolbar sx={{ justifyContent: isExpanded ? 'space-between' : 'center' }}>
        {isExpanded && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        {variant === 'permanent' && (
          <IconButton color="inherit" onClick={() => onPinnedChange(!pinned)}>
            {pinned ? <CircleFilledIcon /> : <CircleIcon />}
          </IconButton>
        )}
      </Toolbar>
      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isSelected = currentPath === item.path ||
                           (item.id !== 'dashboard' && currentPath.startsWith(item.path));

          return (
            <ListItem key={item.id} disablePadding sx={{ mt: item.id === 'dashboard' ? 0 : 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onItemClick && onItemClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: isExpanded ? 1 : 0,
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  '& .MuiListItemIcon-root': { minWidth: isExpanded ? 40 : 0, justifyContent: 'center' },
                  '&.Mui-selected': isExpanded ? {
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    color: 'inherit',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
                    '& .MuiListItemIcon-root': { color: 'inherit' },
                  } : {
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    '& .MuiListItemIcon-root': { color: 'inherit' },
                  },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                {isExpanded && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
