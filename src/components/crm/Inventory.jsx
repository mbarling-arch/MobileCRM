import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import InventoryDialog from './InventoryDialog';
import UnifiedLayout from '../UnifiedLayout';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function Inventory() {
  const { userProfile, accessibleLocations } = useUser();

  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'view', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [sort, setSort] = useState({ column: 'createdAt', direction: 'desc' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locations, setLocations] = useState([]);

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  // Load accessible locations
  useEffect(() => {
    if (accessibleLocations && accessibleLocations.length > 0) {
      setLocations(accessibleLocations);
      // Set default location to user's location or first accessible location
      if (userProfile?.locationId) {
        setSelectedLocationId(userProfile.locationId);
      } else if (accessibleLocations[0]?.id) {
        setSelectedLocationId(accessibleLocations[0].id);
      }
    }
  }, [accessibleLocations, userProfile?.locationId]);

  // Firebase inventory collection - filtered by selected location
  useEffect(() => {
    if (!companyId || !selectedLocationId) return;
    
    const col = collection(db, 'companies', companyId, 'inventory');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter by selected location
      const filteredData = data.filter(item => item.locationId === selectedLocationId);
      setInventory(filteredData);
    });
    return () => unsub();
  }, [companyId, selectedLocationId]);

  const stockHomes = useMemo(() => inventory.filter(item => item.status === 'stock'), [inventory]);
  const rsoItems = useMemo(() => inventory.filter(item => item.status === 'rso'), [inventory]);
  const onOrderItems = useMemo(() => inventory.filter(item => item.status === 'on_order'), [inventory]);
  const quotes = useMemo(() => inventory.filter(item => item.status === 'quote'), [inventory]);

  const statCards = [
    {
      label: 'Stock Homes',
      count: stockHomes.length,
      icon: HomeIcon,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      tab: 'stock'
    },
    {
      label: 'On Order',
      count: onOrderItems.length,
      icon: ShoppingCartIcon,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      tab: 'on_order'
    },
    {
      label: 'Quotes',
      count: quotes.length,
      icon: RequestQuoteIcon,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      tab: 'quote'
    },
    {
      label: 'RSO',
      count: rsoItems.length,
      icon: TaskAltOutlinedIcon,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      tab: 'rso'
    }
  ];

  const handleCreateInventory = async (payload) => {
    try {
      console.log('=== INVENTORY SAVE ATTEMPT ===');
      console.log('Payload received:', JSON.stringify(payload, null, 2));
      console.log('companyId:', companyId);
      console.log('selectedLocationId:', selectedLocationId);
      console.log('userProfile:', userProfile ? 'exists' : 'null/undefined');

      if (!companyId) {
        throw new Error('No companyId available');
      }

      if (!selectedLocationId) {
        throw new Error('No locationId available');
      }

      const data = {
        ...payload,
        companyId,
        locationId: selectedLocationId,
        availabilityStatus: payload.availabilityStatus || 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUserEmail || 'system'
      };
      console.log('Final data to save:', JSON.stringify(data, null, 2));
      console.log('Saving to collection: companies/' + companyId + '/inventory');

      await addDoc(collection(db, 'companies', companyId, 'inventory'), data);
      console.log('✅ Successfully saved to Firestore');
      setDialogOpen(false);
      setSelectedItem(null);
      setSnackbar({ open: true, message: 'Inventory item added successfully', severity: 'success' });
    } catch (error) {
      console.error('❌ Error creating inventory:', error);
      setSnackbar({ open: true, message: 'Error adding inventory item', severity: 'error' });
    }
  };

  const handleEditInventory = async (payload) => {
    if (!selectedItem) return;
    try {
      const ref = doc(db, 'companies', companyId, 'inventory', selectedItem.id);
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp()
      });
      setDialogOpen(false);
      setSelectedItem(null);
      setSnackbar({ open: true, message: 'Inventory item updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating inventory:', error);
      setSnackbar({ open: true, message: 'Error updating inventory item', severity: 'error' });
    }
  };

  const handleOpenDialog = (item = null, mode = 'create') => {
    setSelectedItem(item);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setDialogMode('create');
  };

  const rowsForTab = useMemo(() => {
    if (activeTab === 'stock') return stockHomes;
    if (activeTab === 'rso') return rsoItems;
    if (activeTab === 'on_order') return onOrderItems;
    return quotes;
  }, [activeTab, stockHomes, rsoItems, onOrderItems, quotes]);

  const filteredRows = useMemo(() => {
    let rows = rowsForTab;
    
    // Sort by column header selection
    const dir = sort.direction === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];
      const norm = (v) => v?.toDate ? v.toDate().getTime() : (typeof v === 'string' ? v.toLowerCase() : v);
      const av = norm(aVal);
      const bv = norm(bVal);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
    return rows;
  }, [rowsForTab, sort]);

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString();
  };

  const formatCurrency = (val) => {
    if (val == null || val === '') return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3, width: '100%' }}>
        {/* Location Tabs */}
        {locations.length > 0 && (
          <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Tabs 
                value={selectedLocationId} 
                onChange={(e, newValue) => setSelectedLocationId(newValue)} 
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
                {locations.map((location) => (
                  <Tab 
                    key={location.id} 
                    label={location.name}
                    value={location.id} 
                  />
                ))}
              </Tabs>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog(null, 'create')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Add Inventory
              </Button>
            </Stack>
          </Box>
        )}

        {/* Stat Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeTab === card.tab;
            
            return (
              <Paper
                key={card.tab}
                onClick={() => setActiveTab(card.tab)}
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

        <Card elevation={6} sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <InventoryTable
              rows={filteredRows}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              sort={sort}
              onSortChange={setSort}
              onRowClick={(item) => handleOpenDialog(item, 'view')}
              onStatusChange={async (itemId, newStatus) => {
                try {
                  const ref = doc(db, 'companies', companyId, 'inventory', itemId);
                  await updateDoc(ref, {
                    status: newStatus,
                    updatedAt: serverTimestamp()
                  });
                  setSnackbar({ open: true, message: `Item status updated to ${newStatus}`, severity: 'success' });
                } catch (error) {
                  console.error('Error updating status:', error);
                  setSnackbar({ open: true, message: 'Error updating item status', severity: 'error' });
                }
              }}
            />
          </CardContent>
        </Card>

        <InventoryDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onCreate={handleCreateInventory}
          onSubmit={handleEditInventory}
          initial={selectedItem}
          mode={dialogMode}
        />

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

function InventoryTable({ rows, formatDate, formatCurrency, sort, onSortChange, onStatusChange, onRowClick }) {
  const getAvailabilityColor = (status) => {
    if (status === 'pending') return '#ff9800'; // Orange
    if (status === 'sold') return '#f44336'; // Red
    return '#4caf50'; // Green for available
  };

  const getAvailabilityLabel = (status) => {
    if (status === 'pending') return 'PENDING';
    if (status === 'sold') return 'SOLD';
    return 'AVAILABLE';
  };

  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          '& thead th': {
            color: 'text.secondary',
            fontWeight: 600,
            borderBottomColor: 'divider',
            fontSize: '0.75rem',
            padding: '8px 4px'
          },
          '& tbody td': {
            color: 'text.primary',
            borderBottomColor: 'divider',
            fontSize: '0.75rem',
            padding: '8px 4px'
          },
          '& tbody tr:hover': {
            backgroundColor: 'action.hover',
            cursor: 'pointer'
          }
        }}
      >
        <TableHead>
          <TableRow>
            {/* Home Information */}
            <SortableHeader label="Availability" column="availabilityStatus" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Factory" column="factory" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Serial Number" column="serialNumber" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Model" column="model" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Size" column="size" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Year" column="year" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Bed" column="bedrooms" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Bath" column="bathrooms" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Sq Ft" column="squareFeet" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Invoice" column="invoice" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Sales Price" column="salesPrice" sort={sort} onSortChange={onSortChange} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover onClick={() => onRowClick(row)}>
              {/* Availability Status */}
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip
                  label={getAvailabilityLabel(row.availabilityStatus)}
                  size="small"
                  sx={{
                    backgroundColor: getAvailabilityColor(row.availabilityStatus),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </TableCell>
              {/* Home Information */}
              <TableCell sx={{ textAlign: 'center' }}>{row.factory || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.serialNumber || row.serialNumber1 || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.model || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.size || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.year || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.bedrooms || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.bathrooms || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.squareFeet ? `${row.squareFeet.toLocaleString()}` : '-'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{formatCurrency(row.invoice)}</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#90caf9' }}>{formatCurrency(row.salesPrice)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No inventory items to display.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SortableHeader({ label, column, sort, onSortChange }) {
  const isActive = sort.column === column;
  const handleClick = () => {
    if (sort.column === column) {
      onSortChange({ column, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ column, direction: 'asc' });
    }
  };
  return (
    <TableCell onClick={handleClick} sx={{ cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center' }}>
      {label}{' '}{isActive ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
    </TableCell>
  );
}

function StatusButton({ status, onChange }) {
  const getNextStatus = (current) => {
    const flow = ['quote', 'on_order', 'stock', 'rso'];
    const currentIndex = flow.indexOf(current);
    return flow[(currentIndex + 1) % flow.length];
  };

  const getStatusLabel = (status) => {
    const labels = {
      quote: 'Add Quote',
      on_order: 'Ordered',
      stock: 'Stock',
      rso: 'RSO'
    };
    return labels[status] || status;
  };

  const getButtonColor = (status) => {
    const colors = {
      quote: 'primary',
      on_order: 'warning',
      stock: 'success',
      rso: 'info'
    };
    return colors[status] || 'default';
  };

  const handleClick = () => {
    const nextStatus = getNextStatus(status);
    onChange(nextStatus);
  };

  return (
    <Button
      size="small"
      variant="contained"
      color={getButtonColor(status)}
      onClick={handleClick}
      sx={{ minWidth: 80 }}
    >
      {getStatusLabel(status)}
    </Button>
  );
}

export default Inventory;