import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  IconButton,
  Toolbar,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../ThemeContext';
import TopSearchBar from './TopSearchBar';
import Sidebar from './Sidebar';
import { ADMIN_NAV_ITEMS, CRM_NAV_ITEMS, getVisibleNavItems, LAYOUT_TITLES } from './navigationConfig';

// CRM-specific imports - conditionally loaded
const AddLeadDrawer = React.lazy(() =>
  import('./crm/AddLeadDrawer').catch(() => ({ default: () => null }))
);

const drawerWidth = 256;
const railWidth = 72;

function UnifiedLayout({ children, mode = 'crm' }) {
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

  // Get navigation items based on mode
  const getNavigationItems = () => {
    if (mode === 'admin') {
      return getVisibleNavItems(ADMIN_NAV_ITEMS, 'admin');
    } else {
      return getVisibleNavItems(CRM_NAV_ITEMS, userRole);
    }
  };

  const visibleNavItems = getNavigationItems();

  // When pinned on lg screens, shift the bar/content by full drawerWidth. Otherwise keep compact rail space.
  // Keep content aligned relative to the rail to avoid re-centering shifts when expanded/pinned
  const leftInset = isLgUp ? railWidth : 0;

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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'customColors.layoutBackground', overflowX: 'hidden' }}>
      {/* Minimal header: just a mobile menu trigger and the independent top search bar */}
      <Box sx={{ position: 'fixed', top: 8, left: { xs: 8, lg: `${leftInset + 8}px` }, zIndex: (t) => t.zIndex.drawer + 3, display: { xs: 'block', lg: 'none' } }}>
        <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>
      <TopSearchBar
        onAvatarClick={handleLogout}
        onQuickAddLead={mode === 'crm' ? () => setQuickAddOpen(true) : undefined}
      />

      <Sidebar
        title={LAYOUT_TITLES[mode] || LAYOUT_TITLES.crm}
        navigationItems={visibleNavItems}
        currentPath={location.pathname}
        isExpanded={isExpanded}
        pinned={pinned}
        onPinnedChange={setPinned}
        onMouseEnter={() => isLgUp && setHovered(true)}
        onMouseLeave={() => isLgUp && setHovered(false)}
        onItemClick={navigate}
        variant={isLgUp ? 'permanent' : 'temporary'}
        open={isLgUp ? true : open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'customColors.layoutBackground',
          width: { xs: '100%', lg: `calc(100% - ${leftInset}px)` },
          ml: { xs: 0, lg: `${leftInset}px` },
          mr: { xs: 0, lg: `${leftInset}px` },
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
