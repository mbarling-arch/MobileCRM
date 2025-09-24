import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as LeadsIcon,
  PersonAdd as ProspectsIcon,
  MonetizationOn as DealsIcon,
  Folder as ProjectsIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  Task as TasksIcon,
  Description as DocumentsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  RadioButtonUnchecked as CircleIcon,
  RadioButtonChecked as CircleFilledIcon
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useUser } from '../UserContext';
import { useTheme } from '../ThemeContext';
import TopSearchBar from './TopSearchBar';
import AddLeadDrawer from './crm/AddLeadDrawer';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const drawerWidth = 256;
const railWidth = 72;

// CRM Navigation Items
const CRM_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/crm/dashboard',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: LeadsIcon,
    path: '/crm/leads',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'prospects',
    label: 'Prospects',
    icon: ProspectsIcon,
    path: '/crm/prospects',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: DealsIcon,
    path: '/crm/deals',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: ProjectsIcon,
    path: '/crm/projects',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: InventoryIcon,
    path: '/crm/inventory',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarIcon,
    path: '/crm/calendar',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: TasksIcon,
    path: '/crm/tasks',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: DocumentsIcon,
    path: '/crm/documents',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: SettingsIcon,
    path: '/crm/setup',
    showForRoles: ['admin', 'leadership'] // Only admin and leadership can access setup
  }
];

function CRMLayout({ children }) {
  const { logout, currentUser } = useAuth();
  const { userProfile } = useUser();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const isLgUp = useMediaQuery('(min-width:1200px)');
  const [open, setOpen] = useState(false); // mobile temporary drawer
  const [pinned, setPinned] = useState(false); // allow pinning
  const [hovered, setHovered] = useState(false); // expand on hover when not pinned
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const isExpanded = isLgUp ? (pinned || hovered) : true;

  // Get user role from context
  const userRole = userProfile?.role || 'sales';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Filter navigation items based on user role
  const visibleNavItems = CRM_NAV_ITEMS.filter(item =>
    item.showForRoles.includes(userRole)
  );

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
      <TopSearchBar onAvatarClick={handleLogout} onQuickAddLead={() => setQuickAddOpen(true)} />

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
              CRM Portal
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
            {visibleNavItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = location.pathname === item.path ||
                               (item.id !== 'dashboard' && location.pathname.startsWith(item.path));

              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => navigate(item.path)}
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

      <AddLeadDrawer
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreate={async (payload) => {
          const companyIdToUse = userProfile?.companyId || 'demo-company';
          await addDoc(collection(db, 'companies', companyIdToUse, 'leads'), {
            companyId: companyIdToUse,
            locationId: userProfile?.locationId || 'demo-location',
            assignedTo: userProfile?.email || userProfile?.firebaseUser?.email || '',
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
          });
          setQuickAddOpen(false);
        }}
      />
    </Box>
  );
}

export default CRMLayout;
