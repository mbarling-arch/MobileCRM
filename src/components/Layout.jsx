import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  InputBase,
  Stack,
  Avatar,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  AccountBalance as CompaniesIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  RadioButtonUnchecked as CircleIcon,
  RadioButtonChecked as CircleFilledIcon
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import TopSearchBar from './TopSearchBar';

const drawerWidth = 256;
const railWidth = 72;

function Layout({ children }) {
  const { logout, currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isLgUp = useMediaQuery('(min-width:1200px)');
  const [open, setOpen] = useState(false); // mobile temporary drawer
  const [pinned, setPinned] = useState(false); // allow pinning
  const [hovered, setHovered] = useState(false); // expand on hover when not pinned
  const isExpanded = isLgUp ? (pinned || hovered) : true;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // When pinned on lg screens, shift the bar/content by full drawerWidth. Otherwise keep compact rail space.
  // Keep content aligned relative to the rail to avoid re-centering shifts when expanded/pinned
  const leftInset = isLgUp ? railWidth : 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#211e33', overflowX: 'hidden' }}>
      {/* Minimal header: just a mobile menu trigger and the independent top search bar */}
      <Box sx={{ position: 'fixed', top: 8, left: { xs: 8, lg: `${leftInset + 8}px` }, zIndex: (t) => t.zIndex.drawer + 3, display: { xs: 'block', lg: 'none' } }}>
        <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>
      <TopSearchBar onAvatarClick={handleLogout} />

      <Drawer
        variant={isLgUp ? 'permanent' : 'temporary'}
        open={isLgUp ? true : open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isLgUp ? (isExpanded ? drawerWidth : railWidth) : drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: isLgUp ? (isExpanded ? drawerWidth : railWidth) : drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '4px 0 12px rgba(0,0,0,0.35)',
            backgroundColor: '#211e33',
            color: 'rgba(255,255,255,0.85)',
            transition: 'width 200ms ease',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          },
        }}
        onMouseEnter={() => isLgUp && setHovered(true)}
        onMouseLeave={() => isLgUp && setHovered(false)}
      >
        <Toolbar sx={{ justifyContent: isExpanded ? 'space-between' : 'center' }}>
          {isExpanded && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              MobileCRM
            </Typography>
          )}
          {isLgUp && (
            <IconButton color="inherit" onClick={() => setPinned(v => !v)}>
              {pinned ? <CircleFilledIcon /> : <CircleIcon />}
            </IconButton>
          )}
        </Toolbar>
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List sx={{ pt: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === '/dashboard'}
                onClick={() => navigate('/dashboard')}
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
                  <DashboardIcon />
                </ListItemIcon>
                {isExpanded && <ListItemText primary="Dashboard" />}
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={location.pathname.startsWith('/companies')}
                onClick={() => navigate('/companies')}
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
                  <CompaniesIcon />
                </ListItemIcon>
                {isExpanded && <ListItemText primary="Companies" />}
              </ListItemButton>
            </ListItem>

            {/* Reports nav removed */}

            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                selected={location.pathname === '/settings'}
                onClick={() => navigate('/settings')}
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
                  <SettingsIcon />
                </ListItemIcon>
                {isExpanded && <ListItemText primary="Settings" />}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#211e33',
          width: { xs: '100%', lg: `calc(100% - ${leftInset}px)` },
          ml: { xs: 0, lg: `${leftInset}px` },
          color: 'rgba(255,255,255,0.9)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;


