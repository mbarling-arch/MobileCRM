import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  IconButton,
  Toolbar,
  useMediaQuery,
  Typography,
  InputBase,
  Stack,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../ThemeContext';
import Sidebar from './Sidebar';
import { ADMIN_NAV_ITEMS, CRM_NAV_ITEMS, getVisibleNavItems, LAYOUT_TITLES } from './navigationConfig';

// CRM-specific imports - conditionally loaded
const AddLeadDrawer = React.lazy(() =>
  import('./crm/AddLeadDrawer').catch(() => ({ default: () => null }))
);

function UnifiedLayout({ children, mode = 'crm' }) {
  const { logout, currentUser } = useAuth();
  const { userProfile } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const isLgUp = useMediaQuery('(min-width:1200px)');
  const [open, setOpen] = useState(false); // mobile drawer
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Get user role from context
  const userRole = userProfile?.role || 'sales';

  // Load notifications for current user
  useEffect(() => {
    if (!currentUser?.email) return;

    const notificationsRef = collection(db, 'notifications');
    const unsub = onSnapshot(notificationsRef, (snapshot) => {
      const notifs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((notif) => notif.recipientEmail === currentUser.email && !notif.read)
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setNotifications(notifs);
    });

    return () => unsub();
  }, [currentUser?.email]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get navigation items based on mode
  const getNavigationItems = () => {
    if (mode === 'admin') {
      return getVisibleNavItems(ADMIN_NAV_ITEMS, 'admin');
    } else {
      return getVisibleNavItems(CRM_NAV_ITEMS, userRole);
    }
  };

  const visibleNavItems = getNavigationItems();

  // Find the current active tab
  const currentTabIndex = visibleNavItems.findIndex(
    (item) => location.pathname === item.path || (item.id !== 'dashboard' && location.pathname.startsWith(item.path))
  );
  const activeTab = currentTabIndex >= 0 ? currentTabIndex : 0;

  const handleQuickAddLead = async (payload) => {
    if (mode !== 'crm') return;

    try {
      // Dynamically import Firebase functions only when needed
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

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
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'customColors.layoutBackground' }}>
      {/* Main Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(100, 116, 139, 0.08)'
        }}
      >
        {/* Top Bar - Logo, Search, Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            gap: 3
          }}
        >
          {/* Left - Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: 20,
              whiteSpace: 'nowrap'
            }}
          >
            Mobile CRM
          </Typography>

          {/* Center - Search Bar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              maxWidth: 600,
              width: '100%',
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <InputBase
              placeholder="Search..."
              sx={{
                flex: 1,
                color: 'text.primary',
                fontSize: 14,
                '& input::placeholder': {
                  color: 'text.secondary',
                  opacity: 1
                }
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>

          {/* Right - Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {mode === 'crm' && (
              <Tooltip title="Quick Add Lead">
                <IconButton onClick={() => setQuickAddOpen(true)} sx={{ color: 'text.secondary' }}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Notifications">
              <IconButton onClick={(e) => setNotificationsAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'divider'
                }}
                onClick={handleLogout}
                src={currentUser?.photoURL || ''}
              />
            </Tooltip>
          </Stack>
        </Box>

        {/* Navigation Tabs */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => navigate(visibleNavItems[newValue].path)}
            centered
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: 14,
                color: 'text.secondary',
                px: 3,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {visibleNavItems.map((item) => (
              <Tab
                key={item.id}
                label={item.label}
                onClick={() => navigate(item.path)}
              />
            ))}
          </Tabs>
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
          <IconButton onClick={() => setOpen(true)} sx={{ color: 'text.primary' }}>
          <MenuIcon />
        </IconButton>
        </Box>
      </Box>

      {/* Mobile Sidebar */}
      <Sidebar
        title={LAYOUT_TITLES[mode] || LAYOUT_TITLES.crm}
        navigationItems={visibleNavItems}
        currentPath={location.pathname}
        isExpanded={true}
        pinned={false}
        onPinnedChange={() => {}}
        onItemClick={(path) => {
          navigate(path);
          setOpen(false);
        }}
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'customColors.layoutBackground',
          color: 'text.primary',
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: 3
        }}
      >
        {children}
      </Box>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationsAnchor)}
        anchorEl={notificationsAnchor}
        onClose={() => setNotificationsAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Notifications</Typography>
          <Divider />
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.disabled', fontSize: 14, fontStyle: 'italic' }}>
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notif, idx) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={async () => {
                    // Mark as read
                    try {
                      const notifRef = doc(db, 'notifications', notif.id);
                      await updateDoc(notifRef, { read: true });
                    } catch (err) {
                      console.error('Error marking notification as read:', err);
                    }
                  }}
                >
                  <ListItemText
                    primary={notif.message}
                    secondary={notif.createdAt?.toDate?.().toLocaleString() || 'Just now'}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
                {idx < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>


      {/* CRM-specific Quick Add Lead drawer */}
      {mode === 'crm' && (
        <React.Suspense fallback={null}>
          <AddLeadDrawer
            open={quickAddOpen}
            onClose={() => setQuickAddOpen(false)}
            onCreate={handleQuickAddLead}
          />
        </React.Suspense>
      )}
    </Box>
  );
}

export default UnifiedLayout;
