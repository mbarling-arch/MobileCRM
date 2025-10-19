import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Tabs, Tab, Paper, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useDispatch, useSelector } from 'react-redux';
import UnifiedLayout from '../UnifiedLayout';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import { setAssets, selectAllAssets, selectAssetsByStatus } from '../../redux-store/slices/landAssetSlice';
import BuyingList from './land-asset/BuyingList';
import AvailableList from './land-asset/AvailableList';
import PendingList from './land-asset/PendingList';
import SoldList from './land-asset/SoldList';
import SubdivisionList from './land-asset/SubdivisionList';

function LandAsset() {
  const { userProfile } = useUser();
  const dispatch = useDispatch();
  const allAssets = useSelector(selectAllAssets);
  const [topTab, setTopTab] = useState('spec-properties');
  const [mainTab, setMainTab] = useState('buying');
  const [buyingSubTab, setBuyingSubTab] = useState('offers-out');
  const [contextMenu, setContextMenu] = useState(null);

  const companyId = userProfile?.companyId || 'demo-company';

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleOpenInNewWindow = () => {
    const url = `/crm/available-properties?companyId=${companyId}`;
    window.open(url, '_blank', 'width=1400,height=900');
    handleCloseContextMenu();
  };

  // Load assets from Firestore and sync to Redux
  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'landAssets');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const assets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      dispatch(setAssets(assets));
    });
    return () => unsub();
  }, [companyId, dispatch]);

  const handleAddRow = async () => {
    if (!companyId) return;

    try {
      const newAsset = {
        buyer: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        lotSize: '',
        contractDate: '',
        contractPrice: '',
        optionAmount: '',
        optionEndDate: '',
        earnestMoney: '',
        scheduleCloseDate: '',
        titleCompany: '',
        mlsNumber: '',
        status: 'offer',
        hasOptionPeriod: false,
        offerResponse: '',
        notes: '',
        // Available fields
        listPrice: '',
        currentPrice: '',
        dom: 0,
        ownership: '',
        home: '',
        bedBath: '',
        frontDeck: '',
        backDeck: '',
        listDate: '',
        // Pending fields
        closeDate: '',
        salesPrice: '',
        concessions: '',
        amountTaken: '',
        estCompletion: '',
        lender: '',
        loanType: '',
        titleWorkDate: '',
        surveyDate: '',
        appraisalDate: '',
        clearToCloseDate: '',
        closingTime: '',
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system',
        locationId: userProfile?.locationId || null
      };

      await addDoc(collection(db, 'companies', companyId, 'landAssets'), newAsset);
    } catch (error) {
      console.error('Error adding row:', error);
      alert('Error adding row');
    }
  };

  // Filter assets by main tab
  const buyingAssets = allAssets.filter(a => ['offer', 'option', 'title', 'closing'].includes(a.status));
  const subdivisionAssets = allAssets.filter(a => a.status === 'subdivision');
  const availableAssets = allAssets.filter(a => a.status === 'available');
  const pendingAssets = allAssets.filter(a => a.status === 'pending');
  const soldAssets = allAssets.filter(a => a.status === 'sold');

  const statCards = [
    {
      label: 'Buying',
      count: buyingAssets.length,
      icon: ShoppingCartIcon,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      tab: 'buying'
    },
    {
      label: 'Available',
      count: availableAssets.length,
      icon: InventoryIcon,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      tab: 'available'
    },
    {
      label: 'Pending',
      count: pendingAssets.length,
      icon: PendingActionsIcon,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      tab: 'pending'
    },
    {
      label: 'Sold',
      count: soldAssets.length,
      icon: CheckCircleIcon,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      tab: 'sold'
    }
  ];

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        {/* Top Level Tabs */}
        <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'divider' }}>
          <Tabs 
            value={topTab} 
            onChange={(e, v) => setTopTab(v)} 
            textColor="primary" 
            indicatorColor="primary" 
            sx={{ 
              '& .MuiTab-root': { 
                fontWeight: 700, 
                fontSize: 16, 
                px: 4 
              }, 
              '& .MuiTabs-indicator': { 
                height: 4 
              } 
            }}
          >
            <Tab label="Spec Properties" value="spec-properties" />
            <Tab label="Subdivision" value="subdivision" />
          </Tabs>
        </Box>

        {/* Spec Properties Section */}
        {topTab === 'spec-properties' && (
          <>
            {/* Header with Add Button */}
            <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Add Asset
              </Button>
            </Stack>

            {/* Stat Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
              {statCards.map((card) => {
                const Icon = card.icon;
                const isActive = mainTab === card.tab;
                
                return (
                  <Paper
                    key={card.tab}
                    onClick={() => setMainTab(card.tab)}
                    onContextMenu={card.tab === 'available' ? handleContextMenu : undefined}
                    sx={{
                      flex: 1,
                      p: 4,
                      cursor: 'pointer',
                      background: isActive ? card.bgGradient : 'customColors.cardBackground',
                      border: '2px solid',
                      borderColor: isActive ? card.color : 'rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isActive ? `0 8px 32px ${card.color}40` : '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: card.color,
                        boxShadow: `0 12px 40px ${card.color}50`
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography 
                          sx={{ 
                            fontSize: 14, 
                            fontWeight: 600, 
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            letterSpacing: 1
                          }}
                        >
                          {card.label}
                        </Typography>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${card.color}20`,
                            border: `2px solid ${card.color}60`
                          }}
                        >
                          <Icon sx={{ fontSize: 36, color: card.color }} />
                        </Box>
                      </Stack>
                      <Typography 
                        sx={{ 
                          fontSize: 48, 
                          fontWeight: 800, 
                          color: isActive ? card.color : 'text.primary',
                          lineHeight: 1,
                          mt: 1
                        }}
                      >
                        {card.count}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>

            {/* Render appropriate list based on tab */}
            {mainTab === 'buying' && (
              <BuyingList 
                assets={buyingAssets} 
                companyId={companyId}
                buyingSubTab={buyingSubTab}
                setBuyingSubTab={setBuyingSubTab}
              />
            )}
            {mainTab === 'available' && <AvailableList assets={availableAssets} companyId={companyId} />}
            {mainTab === 'pending' && <PendingList assets={pendingAssets} companyId={companyId} />}
            {mainTab === 'sold' && <SoldList assets={soldAssets} companyId={companyId} />}
          </>
        )}

        {/* Subdivision Section */}
        {topTab === 'subdivision' && (
          <SubdivisionList assets={subdivisionAssets} companyId={companyId} />
        )}

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
          PaperProps={{
            sx: {
              boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          <MenuItem onClick={handleOpenInNewWindow}>
            <ListItemIcon>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open in new window</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </UnifiedLayout>
  );
}

export default LandAsset;
