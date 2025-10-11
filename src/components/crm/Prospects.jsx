import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Stack,
  Typography,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LeadCallLogDrawer from './LeadCallLogDrawer';
import LeadTaskDrawer from './LeadTaskDrawer';
import LeadAppointmentDrawer from './LeadAppointmentDrawer';
import LeadFilterDrawer from './LeadFilterDrawer';
import SaveListDialog from './SaveListDialog';
import UnifiedLayout from '../UnifiedLayout';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import { getSourceMeta, getStatusMeta } from './LeadConstants';

function Prospects() {
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const [prospects, setProspects] = useState([]);
  const [activeTab, setActiveTab] = useState('my');
  const [drawerState, setDrawerState] = useState({ type: null, lead: null });
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filter, setFilter] = useState({ query: '', sources: [], statuses: [], dateRange: 'all', customStart: '', customEnd: '' });
  const [sort, setSort] = useState({ column: 'createdAt', direction: 'desc' });
  const [savedViews, setSavedViews] = useState([]);
  const [users, setUsers] = useState([]);

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  // Load users for name mapping
  useEffect(() => {
    if (!companyId) return;

    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName || doc.data().name || doc.data().email,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || ''
      }));
      setUsers(usersData);
    });

    return () => unsub();
  }, [companyId]);

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'prospects');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProspects(data);
    });
    return () => unsub();
  }, [companyId]);

  // Load saved views
  useEffect(() => {
    const load = async () => {
      if (!userProfile?.companyId || !userProfile?.firebaseUser?.uid) return;
      const { collection, getDocs, query: fsQuery, orderBy: fsOrderBy } = await import('firebase/firestore');
      const viewsCol = collection(db, 'companies', userProfile.companyId, 'users', userProfile.firebaseUser.uid, 'prospectViews');
      const q = fsQuery(viewsCol, fsOrderBy('order', 'asc'), fsOrderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      setSavedViews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, [userProfile]);

  const myRows = useMemo(() => prospects.filter(p => p.assignedTo === currentUserEmail), [prospects, currentUserEmail]);
  const teamRows = useMemo(() => prospects.filter(p => p.assignedTo && p.assignedTo !== currentUserEmail && p.locationId === locationId), [prospects, currentUserEmail, locationId]);

  const rowsForTab = useMemo(() => (activeTab === 'my' ? myRows : (activeTab === 'team' ? teamRows : [])), [activeTab, myRows, teamRows]);

  const filteredRows = useMemo(() => {
    let rows = rowsForTab;
    if (filter.query.trim()) {
      const q = filter.query.trim().toLowerCase();
      rows = rows.filter(r => (r.firstName || '').toLowerCase().includes(q) || (r.lastName || '').toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q));
    }
    if (filter.sources.length) rows = rows.filter(r => filter.sources.includes(r.source));
    if (filter.statuses.length) rows = rows.filter(r => filter.statuses.includes(r.status));
    if (filter.dateRange !== 'all') {
      const now = new Date();
      let start = null;
      let end = null;
      if (filter.dateRange === 'this_week') {
        const d = new Date(now);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
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
        if (filter.customEnd) end = new Date(filter.customEnd + 'T23:59:59');
      }
      rows = rows.filter(r => {
        const ts = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt || null);
        if (!ts) return true;
        if (start && ts < start) return false;
        if (end && ts > end) return false;
        return true;
      });
    }
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
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [rowsForTab, filter, sort]);

  const formatDate = (value) => {
    const d = value?.toDate ? value.toDate() : value;
    if (!d) return '-';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to get user display name from email
  const getUserDisplayName = (email) => {
    if (!email) return '-';
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.displayName || email;
    }
    return email;
  };

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Prospects</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={() => setFilterOpen(true)}>Filter</Button>
            {(filter.sources.length || filter.statuses.length || filter.dateRange !== 'all' || (filter.dateRange==='custom' && (filter.customStart || filter.customEnd))) && (
              <Button variant="contained" onClick={() => setSaveDialogOpen(true)}>Save List</Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <CardContent>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 1, '& .MuiTab-root': { fontWeight: 600 }, '& .MuiTabs-indicator': { height: 3 } }}>
              <Tab label="MY PROSPECTS" value="my" />
              <Tab label="MY TEAM'S PROSPECTS" value="team" />
              <Tab label={`SAVED VIEWS (${savedViews.length})`} value="saved" sx={{ marginLeft: 'auto' }} />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {activeTab !== 'saved' ? (
              <ProspectTable
                rows={filteredRows}
                formatDate={formatDate}
                getUserDisplayName={getUserDisplayName}
                enableActions
                showCreator={activeTab==='team'}
                sort={sort}
                onSortChange={setSort}
                onRowNavigate={(id) => navigate(`/crm/prospects/${id}`)}
                onAction={(type, lead) => setDrawerState({ type, lead })}
              />
            ) : (
              <SavedViewsList
                views={savedViews}
                onSelect={(view) => { setFilter(view.filter); setSort(view.sort); setActiveTab('my'); }}
                onReorder={async (newOrder) => {
                  const { writeBatch, doc } = await import('firebase/firestore');
                  const batch = writeBatch(db);
                  newOrder.forEach((v, idx) => {
                    const ref = doc(db, 'companies', userProfile.companyId, 'users', userProfile.firebaseUser.uid, 'prospectViews', v.id);
                    batch.update(ref, { order: idx });
                  });
                  await batch.commit();
                  setSavedViews(newOrder);
                }}
              />
            )}
          </CardContent>
        </Card>

        <LeadCallLogDrawer open={drawerState.type === 'callNotes'} onClose={() => setDrawerState({ type: null, lead: null })} companyId={companyId} lead={drawerState.lead} />
        <LeadTaskDrawer open={drawerState.type === 'task'} onClose={() => setDrawerState({ type: null, lead: null })} companyId={companyId} lead={drawerState.lead} />
        <LeadAppointmentDrawer open={drawerState.type === 'calendar'} onClose={() => setDrawerState({ type: null, lead: null })} companyId={companyId} lead={drawerState.lead} />
        <LeadFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} initial={filter} onApply={(f) => { setFilter(f); setFilterOpen(false); }} />
        <SaveListDialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} onSave={async ({ name }) => {
          const { collection, addDoc } = await import('firebase/firestore');
          const uid = userProfile?.firebaseUser?.uid;
          const companyIdCurr = userProfile?.companyId;
          const viewsCol = collection(db, 'companies', companyIdCurr, 'users', uid, 'prospectViews');
          const docRef = await addDoc(viewsCol, { name, filter, sort, createdAt: serverTimestamp(), createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system' });
          setSavedViews((v) => [...v, { id: docRef.id, name, filter, sort }]);
          setSaveDialogOpen(false);
        }} />
      </Box>
    </UnifiedLayout>
  );
}

function ProspectTable({ rows, formatDate, getUserDisplayName, enableActions, onAction, showCreator, sort, onSortChange, onRowNavigate }) {
  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          '& thead th': { color: 'rgba(255,255,255,0.9)', fontWeight: 600, borderBottomColor: 'rgba(255,255,255,0.08)' },
          '& tbody td': { color: 'rgba(255,255,255,0.92)', borderBottomColor: 'rgba(255,255,255,0.06)' },
          '& tbody tr:hover': { backgroundColor: 'rgba(255,255,255,0.04)' }
        }}
      >
        <TableHead>
          <TableRow>
            <SortableHeader label="First Name" column="firstName" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Last Name" column="lastName" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Phone" column="phone" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Email" column="email" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Created" column="createdAt" sort={sort} onSortChange={onSortChange} />
            {showCreator && <TableCell>Created By</TableCell>}
            <SortableHeader label="Source" column="source" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Status" column="status" sort={sort} onSortChange={onSortChange} />
            {enableActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const source = getSourceMeta(row.source);
            const status = getStatusMeta(row.status);
            return (
              <TableRow
                key={row.id}
                hover
                onClick={(e) => {
                  const target = e.target;
                  if (target && target.closest && target.closest('a,button,[role="button"],svg')) return;
                  onRowNavigate && onRowNavigate(row.id);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{row.firstName || (row.name || '').split(' ')[0]}</TableCell>
                <TableCell>{row.lastName || (row.name || '').split(' ').slice(1).join(' ')}</TableCell>
                <TableCell>{row.phone ? (<MuiLink href={`tel:${row.phone}`} underline="hover" color="primary">{row.phone}</MuiLink>) : '-'}</TableCell>
                <TableCell>{row.email || '-'}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                {showCreator && (<TableCell>{getUserDisplayName(row.createdBy)}</TableCell>)}
                <TableCell><Chip size="small" label={source.label} color={source.color} variant="outlined" /></TableCell>
                <TableCell><Chip size="small" label={status.label} color={status.color} /></TableCell>
                {enableActions && (
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => onAction('callNotes', row)} title="Log Call/Notes">
                        <PhoneOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onAction('message', row)} title="Message">
                        <ChatOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onAction('task', row)} title="Task">
                        <TaskAltOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onAction('calendar', row)} title="Calendar">
                        <EventOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No prospects to display.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
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
    setDragIdx(null);
    onReorder && onReorder(updated);
  };
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((v, idx) => (
            <TableRow key={v.id} hover draggable onDragStart={() => handleDragStart(idx)} onDragOver={handleDragOver} onDrop={() => handleDrop(idx)}>
              <TableCell>{v.name}</TableCell>
              <TableCell align="right"><Button size="small" variant="outlined" onClick={() => onSelect(v)}>Apply</Button></TableCell>
            </TableRow>
          ))}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>No saved views.</TableCell>
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
    if (sort.column === column) onSortChange({ column, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    else onSortChange({ column, direction: 'asc' });
  };
  return (
    <TableCell onClick={handleClick} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}{' '}{isActive ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
    </TableCell>
  );
}

export default Prospects;

