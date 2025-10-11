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
import { Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveListDialog from './SaveListDialog';
import InventoryDialog from './InventoryDialog';
import UnifiedLayout from '../UnifiedLayout';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function Inventory() {
  const { userProfile, accessibleLocations } = useUser();

  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'view', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState({ query: '', dateRange: 'all', customStart: '', customEnd: '' });
  const [sort, setSort] = useState({ column: 'createdAt', direction: 'desc' });
  const [savedViews, setSavedViews] = useState([]);
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
    // Text query: match in name, model, facility
    if (filter.query.trim()) {
      const q = filter.query.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.model || '').toLowerCase().includes(q) ||
        (r.facility || '').toLowerCase().includes(q)
      );
    }
    // Date range filtering similar to leads
    if (filter.dateRange !== 'all') {
      const now = new Date();
      let start = null;
      if (filter.dateRange === 'this_week') {
        const d = new Date(now);
        const day = d.getDay();
        const diffToSunday = day;
        d.setDate(d.getDate() - diffToSunday);
        d.setHours(0,0,0,0);
        start = d;
      } else if (filter.dateRange === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (filter.dateRange === '60d') {
        start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      } else if (filter.dateRange === '90d') {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (filter.dateRange === 'custom') {
        if (filter.customStart) start = new Date(filter.customStart + 'T00:00:00');
      }
      rows = rows.filter(r => {
        const ts = r.createdAt;
        if (!ts) return true;
        if (start && ts < start) return false;
        return true;
      });
    }
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
  }, [rowsForTab, filter, sort]);

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Inventory Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog(null, 'create')} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
              Add Inventory
            </Button>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Button variant="contained" onClick={() => setSaveDialogOpen(true)}>
              Save View
            </Button>
          </Stack>
        </Stack>

        {/* Location Tabs */}
        {locations.length > 0 && (
          <Paper sx={{ mb: 3, backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Tabs
              value={selectedLocationId}
              onChange={(e, newValue) => setSelectedLocationId(newValue)}
              sx={{
                '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600 },
                '& .MuiTab-root.Mui-selected': { color: 'text.primary' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3 }
              }}
            >
              {locations.map((location) => (
                <Tab 
                  key={location.id} 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon sx={{ fontSize: 18 }} />
                      <span>{location.name}</span>
                      {location.id === userProfile?.locationId && (
                        <Chip label="Your Location" size="small" color="primary" sx={{ height: 20 }} />
                      )}
                    </Stack>
                  } 
                  value={location.id} 
                />
              ))}
            </Tabs>
          </Paper>
        )}

        <Card elevation={6} sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                px: 3,
                pt: 2,
                pb: 0,
                mb: 1,
                '& .MuiTab-root': { fontWeight: 600 },
                '& .MuiTabs-indicator': { height: 3 }
              }}
            >
              <Tab label={`STOCK HOMES (${stockHomes.length})`} value="stock" />
              <Tab label={`RSO (${rsoItems.length})`} value="rso" />
              <Tab label={`ON ORDER (${onOrderItems.length})`} value="on_order" />
              <Tab label={`QUOTES (${quotes.length})`} value="quote" />
              <Tab label={`SAVED VIEWS (${savedViews.length})`} value="saved" sx={{ marginLeft: 'auto' }} />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {activeTab !== 'saved' ? (
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
            ) : (
              <SavedViewsList
                views={savedViews}
                onSelect={(view) => { setFilter(view.filter); setSort(view.sort); setActiveTab('stock'); }}
                onReorder={async (newOrder) => {
                  // Implement saved views reordering for inventory
                  setSavedViews(newOrder);
                }}
              />
            )}
          </CardContent>
        </Card>

        <SaveListDialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={async ({ name, favorite }) => {
            const { collection, addDoc } = await import('firebase/firestore');
            const uid = userProfile?.firebaseUser?.uid;
            const companyIdCurr = userProfile?.companyId;
            const viewsCol = collection(db, 'companies', companyIdCurr, 'users', uid, 'inventoryViews');
            await addDoc(viewsCol, {
              name,
              favorite,
              filter,
              sort,
              createdAt: serverTimestamp()
            });
            setSaveDialogOpen(false);
          }}
        />

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
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            borderBottomColor: 'rgba(255,255,255,0.08)',
            fontSize: '0.75rem',
            padding: '8px 4px'
          },
          '& tbody td': {
            color: 'rgba(255,255,255,0.92)',
            borderBottomColor: 'rgba(255,255,255,0.06)',
            fontSize: '0.75rem',
            padding: '8px 4px'
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
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
            <SortableHeader label="B/B" column="bedBath" sort={sort} onSortChange={onSortChange} />
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
              <TableCell sx={{ textAlign: 'center' }}>{row.bedBath || '-'}</TableCell>
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

function SavedViewsList({ views, onSelect, onReorder }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [list, setList] = useState(views);

  useEffect(() => setList(views), [views]);

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const updated = [...list];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setList(updated);
    onReorder(updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Saved Views</Typography>
      {list.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>No saved views yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {list.map((view, idx) => (
            <Box
              key={view.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              sx={{
                p: 2,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' }
              }}
              onClick={() => onSelect(view)}
            >
              <Typography sx={{ color: 'white' }}>{view.name}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default Inventory;