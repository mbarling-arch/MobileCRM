import React, { useEffect, useMemo, useState } from 'react';
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
  TableRow
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LeadCallLogDrawer from './LeadCallLogDrawer';
import LeadTaskDrawer from './LeadTaskDrawer';
import LeadAppointmentDrawer from './LeadAppointmentDrawer';
import AddLeadDrawer from './AddLeadDrawer';
import LeadFilterDrawer from './LeadFilterDrawer';
import SaveListDialog from './SaveListDialog';
import LeadsImportExport from './LeadsImportExport';
import UnifiedLayout from '../UnifiedLayout';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import { getSourceMeta, getStatusMeta, LEAD_SOURCES, LEAD_STATUSES } from './LeadConstants';

function Leads() {
  const { userProfile } = useUser();

  const [dateRange, setDateRange] = useState('all');
  const [leads, setLeads] = useState([]);
  const [leadsWithData, setLeadsWithData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [drawerState, setDrawerState] = useState({ type: null, lead: null });
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filter, setFilter] = useState({ query: '', sources: [], statuses: [], dateRange: 'all', customStart: '', customEnd: '' });
  const [sort, setSort] = useState({ column: 'createdAt', direction: 'desc' });
  const [savedViews, setSavedViews] = useState([]);
  const [confirmConvert, setConfirmConvert] = useState({ open: false, lead: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  // Load users for name mapping
  useEffect(() => {
    if (!companyId) return;

    // Load from top-level users collection for easier access
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
    const col = collection(db, 'companies', companyId, 'leads');
    const constraints = [orderBy('createdAt', 'desc')];
    const q = query(col, ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.archived);
      setLeads(data);
    });
    return () => unsub();
  }, [companyId]);

  // Fetch appointments and call logs for all leads and combine with lead data
  useEffect(() => {
    if (leads.length === 0) {
      setLeadsWithData([]);
      return;
    }

    const unsubs = [];

    const fetchDataForLeads = async () => {
      const leadsWithData = await Promise.all(
        leads.map(async (lead) => {
          try {
            // Fetch appointments
            const appointmentsQuery = query(
              collection(db, 'companies', companyId, 'leads', lead.id, 'appointments'),
              orderBy('at', 'asc')
            );

            // Fetch call logs
            const callLogsQuery = query(
              collection(db, 'companies', companyId, 'leads', lead.id, 'callLogs'),
              orderBy('createdAt', 'desc')
            );

            return new Promise((resolve) => {
              let appointments = [];
              let callLogs = [];
              let appointmentsFetched = false;
              let callLogsFetched = false;

              const checkComplete = () => {
                if (appointmentsFetched && callLogsFetched) {
                  // Find the earliest appointment
                  const earliestAppointment = appointments.length > 0
                    ? appointments.reduce((earliest, current) => {
                        const currentDate = current.at?.toDate ? current.at.toDate() : new Date(current.at);
                        const earliestDate = earliest.at?.toDate ? earliest.at.toDate() : new Date(earliest.at);
                        return currentDate < earliestDate ? current : earliest;
                      })
                    : null;

                  // Find the most recent call log
                  const latestCallLog = callLogs.length > 0 ? callLogs[0] : null;

                  resolve({
                    ...lead,
                    earliestAppointment: earliestAppointment?.at?.toDate ? earliestAppointment.at.toDate() : null,
                    hasAppointment: appointments.length > 0,
                    latestCallLog: latestCallLog?.createdAt?.toDate ? latestCallLog.createdAt.toDate() : null,
                    hasCallLog: callLogs.length > 0
                  });
                }
              };

              // Subscribe to appointments
              const apptUnsub = onSnapshot(appointmentsQuery, (apptsSnap) => {
                appointments = apptsSnap.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                appointmentsFetched = true;
                checkComplete();
              });
              unsubs.push(apptUnsub);

              // Subscribe to call logs
              const callUnsub = onSnapshot(callLogsQuery, (callsSnap) => {
                callLogs = callsSnap.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                callLogsFetched = true;
                checkComplete();
              });
              unsubs.push(callUnsub);
            });
          } catch (error) {
            // If collections don't exist, return lead without data
            return {
              ...lead,
              earliestAppointment: null,
              hasAppointment: false,
              latestCallLog: null,
              hasCallLog: false
            };
          }
        })
      );

      setLeadsWithData(leadsWithData);
    };

    fetchDataForLeads();

    return () => unsubs.forEach(u => u());
  }, [leads, companyId]);

  const myLeads = useMemo(() => leadsWithData.filter(l => l.assignedTo === currentUserEmail), [leadsWithData, currentUserEmail]);
  const teamLeads = useMemo(
    () => leadsWithData.filter(l => l.assignedTo && l.assignedTo !== currentUserEmail && l.locationId === locationId),
    [leadsWithData, currentUserEmail, locationId]
  );
  const unclaimedLeads = useMemo(
    () => leadsWithData.filter(l => (!l.assignedTo || l.assignedTo === '') && l.locationId === locationId),
    [leadsWithData, locationId]
  );

  const rowsForTab = useMemo(() => {
    if (activeTab === 'my') return myLeads;
    if (activeTab === 'team') return teamLeads;
    return unclaimedLeads;
  }, [activeTab, myLeads, teamLeads, unclaimedLeads]);

  const filteredRows = useMemo(() => {
    let rows = rowsForTab;
    // Text query: match in name, email, phone
    if (filter.query.trim()) {
      const q = filter.query.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.firstName || '').toLowerCase().includes(q) ||
        (r.lastName || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
      );
    }
    // Sources
    if (filter.sources.length) rows = rows.filter(r => filter.sources.includes(r.source));
    // Statuses
    if (filter.statuses.length) rows = rows.filter(r => filter.statuses.includes(r.status));
    // Date range
    if (filter.dateRange !== 'all') {
      const now = new Date();
      let start = null;
      let end = null;
      if (filter.dateRange === 'this_week') {
        const d = new Date(now);
        const day = d.getDay(); // 0-6 (Sun-Sat)
        const diffToSunday = day; // start Sunday
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
        if (filter.customEnd) {
          end = new Date(filter.customEnd + 'T23:59:59');
        }
      }
      rows = rows.filter(r => {
        const ts = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt || null);
        if (!ts) return true;
        if (start && ts < start) return false;
        if (end && ts > end) return false;
        return true;
      });
    }
    // Sort by column header selection stored in `sort`
    const dir = sort.direction === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      let aVal = a[sort.column];
      let bVal = b[sort.column];

      // Special handling for date fields
      if (sort.column === 'earliestAppointment' || sort.column === 'latestCallLog') {
        aVal = aVal ? aVal.getTime() : null;
        bVal = bVal ? bVal.getTime() : null;
      } else {
        const norm = (v) => v?.toDate ? v.toDate().getTime() : (typeof v === 'string' ? v.toLowerCase() : v);
        aVal = norm(aVal);
        bVal = norm(bVal);
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
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
      // Prefer firstName + lastName, fallback to displayName, then email
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.displayName || email;
    }
    return email;
  };

  // Load saved defaults once
  useEffect(() => {
    // Load saved views from Firestore for current user ordered by 'order' then 'createdAt'
    const load = async () => {
      if (!userProfile?.companyId || !userProfile?.firebaseUser?.uid) return;
      const { collection, getDocs, query: fsQuery, orderBy: fsOrderBy } = await import('firebase/firestore');
      const viewsCol = collection(db, 'companies', userProfile.companyId, 'users', userProfile.firebaseUser.uid, 'leadViews');
      const q = fsQuery(viewsCol, fsOrderBy('order', 'asc'), fsOrderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      const views = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSavedViews(views);
    };
    load();
  }, [userProfile]);

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Leads</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button 
              variant="outlined" 
              onClick={() => setImportExportOpen(true)}
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            >
              Import/Export
            </Button>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>Filter</Button>
            { (filter.sources.length || filter.statuses.length || filter.dateRange !== 'all' || (filter.dateRange==='custom' && (filter.customStart || filter.customEnd))) && (
              <Button variant="contained" onClick={() => setSaveDialogOpen(true)}>Save List</Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                mb: 1,
                '& .MuiTab-root': { fontWeight: 600 },
                '& .MuiTabs-indicator': { height: 3 }
              }}
            >
              <Tab label="MY LEADS" value="my" />
              <Tab label="MY TEAM'S LEADS" value="team" />
              <Tab label="UNCLAIMED HOT LEADS" value="unclaimed" />
              <Tab label={`SAVED VIEWS (${savedViews.length})`} value="saved" sx={{ marginLeft: 'auto' }} />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {activeTab !== 'saved' ? (
              <LeadTable 
                rows={filteredRows} 
                formatDate={formatDate} 
                getUserDisplayName={getUserDisplayName}
                enableActions 
                showCreator={activeTab==='team'} 
                sort={sort} 
                onSortChange={setSort} 
                onEdit={(lead) => setOpenDialog(lead)} 
                onAction={(type, lead) => {
                  if (type === 'convert') {
                    setConfirmConvert({ open: true, lead });
                  } else {
                    setDrawerState({ type, lead });
                  }
                }} 
              />
            ) : (
              <SavedViewsList
                views={savedViews}
                onSelect={(view) => { setFilter(view.filter); setSort(view.sort); setActiveTab('my'); }}
                onReorder={async (newOrder) => {
                  const { writeBatch, doc } = await import('firebase/firestore');
                  const batch = writeBatch(db);
                  newOrder.forEach((v, idx) => {
                    const ref = doc(db, 'companies', userProfile.companyId, 'users', userProfile.firebaseUser.uid, 'leadViews', v.id);
                    batch.update(ref, { order: idx });
                  });
                  await batch.commit();
                  setSavedViews(newOrder);
                }}
              />
            )}
          </CardContent>
        </Card>

        <AddLeadDrawer
          open={Boolean(openDialog)}
          onClose={() => setOpenDialog(false)}
          onCreate={async (payload) => {
            // Create lead, then update with contactId = doc.id
            const data = {
              companyId,
              locationId,
              assignedTo: currentUserEmail || '',
              ...payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: currentUserEmail || 'system',
              archived: false
            };
            const ref = await addDoc(collection(db, 'companies', companyId, 'leads'), data);
            await updateDoc(ref, { contactId: ref.id });
            setOpenDialog(false);
          }}
          initial={typeof openDialog === 'object' ? openDialog : null}
          submitLabel={typeof openDialog === 'object' ? 'Save Changes' : 'Create Lead'}
          onSubmit={async (payload) => {
            if (typeof openDialog !== 'object') return;
            const ref = doc(db, 'companies', companyId, 'leads', openDialog.id);
            await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
            setOpenDialog(false);
          }}
        />

        <LeadCallLogDrawer
          open={drawerState.type === 'callNotes'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={companyId}
          lead={drawerState.lead}
        />
        <LeadTaskDrawer
          open={drawerState.type === 'task'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={companyId}
          lead={drawerState.lead}
        />
        <LeadAppointmentDrawer
          open={drawerState.type === 'calendar'}
          onClose={() => setDrawerState({ type: null, lead: null })}
          companyId={companyId}
          lead={drawerState.lead}
        />

        <LeadFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          initial={filter}
          onApply={(f) => { setFilter(f); setFilterOpen(false); }}
        />
        <SaveListDialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={async ({ name, favorite }) => {
            const { collection, addDoc } = await import('firebase/firestore');
            const uid = userProfile?.firebaseUser?.uid;
            const companyIdCurr = userProfile?.companyId;
            const viewsCol = collection(db, 'companies', companyIdCurr, 'users', uid, 'leadViews');
            const docRef = await addDoc(viewsCol, {
              name,
              favorite,
              filter,
              sort,
              createdAt: serverTimestamp(),
              createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
            });
            setSavedViews((v) => [...v, { id: docRef.id, name, favorite, filter, sort }]);
            if (favorite) setFavorites((favs) => [...favs, { id: docRef.id, name, favorite, filter, sort }].slice(0,5));
            setSaveDialogOpen(false);
          }}
        />

        <LeadsImportExport
          open={importExportOpen}
          onClose={() => setImportExportOpen(false)}
          companyId={companyId}
          locationId={locationId}
          leads={leads}
          onImportComplete={() => {
            setSnackbar({ open: true, message: 'Leads imported successfully!', severity: 'success' });
          }}
        />

        <Dialog open={confirmConvert.open} onClose={() => setConfirmConvert({ open: false, lead: null })}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmConvert({ open: false, lead: null })}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  const lead = confirmConvert.lead;
                  const { doc: fsDoc, getDoc, setDoc, collection: fsCollection, getDocs } = await import('firebase/firestore');
                  const leadRef = fsDoc(db, 'companies', companyId, 'leads', lead.id);
                  const leadSnap = await getDoc(leadRef);
                  const leadData = leadSnap.data();
                  const prospectRef = fsDoc(db, 'companies', companyId, 'prospects', lead.id);
                  await setDoc(prospectRef, { ...leadData, type: 'prospect', convertedAt: serverTimestamp() });
                  const subcollections = ['callLogs', 'tasks', 'appointments'];
                  for (const sub of subcollections) {
                    const subCol = fsCollection(db, 'companies', companyId, 'leads', lead.id, sub);
                    const subSnap = await getDocs(subCol);
                    for (const d of subSnap.docs) {
                      await setDoc(fsDoc(db, 'companies', companyId, 'prospects', lead.id, sub, d.id), d.data());
                    }
                  }
                  await updateDoc(leadRef, { archived: true, archivedAt: serverTimestamp() });
                  // Auto-log initial visit on conversion
                  try {
                    const { addDoc, collection } = await import('firebase/firestore');
                    await addDoc(collection(db, 'companies', companyId, 'prospects', lead.id, 'visits'), {
                      at: new Date(),
                      createdAt: serverTimestamp(),
                      createdBy: currentUserEmail || 'system'
                    });
                  } catch {}
                  setSnackbar({ open: true, message: 'Converted', severity: 'success' });
                } catch (e) {
                  setSnackbar({ open: true, message: 'Conversion failed', severity: 'error' });
                } finally {
                  setConfirmConvert({ open: false, lead: null });
                }
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

function LeadTable({ rows, formatDate, getUserDisplayName, enableActions, onEdit, onAction, showCreator, sort, onSortChange }) {
  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          '& thead th': {
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            borderBottomColor: 'rgba(255,255,255,0.08)'
          },
          '& tbody td': {
            color: 'rgba(255,255,255,0.92)',
            borderBottomColor: 'rgba(255,255,255,0.06)'
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)'
          }
        }}
      >
        <TableHead>
          <TableRow>
            <SortableHeader label="First Name" column="firstName" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Last Name" column="lastName" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Phone" column="phone" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Email" column="email" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Created" column="createdAt" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Next Appt" column="earliestAppointment" sort={sort} onSortChange={onSortChange} />
            {showCreator && <TableCell>Created By</TableCell>}
            <SortableHeader label="Source" column="source" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Status" column="status" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Last Contacted" column="latestCallLog" sort={sort} onSortChange={onSortChange} />
            {enableActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const source = getSourceMeta(row.source);
            const status = getStatusMeta(row.status);
            return (
              <TableRow key={row.id} hover>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>
                  {row.phone ? (
                    <MuiLink href={`tel:${row.phone}`} underline="hover" color="primary">
                      {row.phone}
                    </MuiLink>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{row.email || '-'}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell>
                  {row.earliestAppointment ? (
                    <Stack>
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {row.earliestAppointment.toLocaleDateString()}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        {row.earliestAppointment.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                      No appt
                    </Typography>
                  )}
                </TableCell>
                {showCreator && (
                  <TableCell>{getUserDisplayName(row.createdBy)}</TableCell>
                )}
                <TableCell>
                  <Chip size="small" label={source.label} color={source.color} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={status.label} color={status.color} />
                </TableCell>
                <TableCell>
                  {row.latestCallLog ? (
                    <Stack>
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {row.latestCallLog.toLocaleDateString()}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        {row.latestCallLog.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                      No contact
                    </Typography>
                  )}
                </TableCell>
                {enableActions && (
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => onEdit(row)} title="Edit">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
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
                      <IconButton size="small" onClick={() => onAction('convert', row)} title="Convert">
                        <SwapHorizOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No leads to display.
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
    <TableCell onClick={handleClick} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}{' '}{isActive ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
    </TableCell>
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
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={() => onSelect(v)}>Apply</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No saved views.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { TextField } from '@mui/material';

export default Leads;

