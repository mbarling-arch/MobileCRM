import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tabs, Tab, Button } from '@mui/material';
import CRMLayout from '../CRMLayout';
import { db } from '../../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useUser } from '../../UserContext';
import { getSourceMeta, getStatusMeta } from './LeadConstants';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { useNavigate } from 'react-router-dom';

function Deals() {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [activeTab, setActiveTab] = useState('my');

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'deals');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [companyId]);

  const myDeals = useMemo(() => deals.filter(d => d.assignedTo === currentUserEmail), [deals, currentUserEmail]);
  const teamDeals = useMemo(() => deals.filter(d => d.assignedTo && d.assignedTo !== currentUserEmail && d.locationId === locationId), [deals, currentUserEmail, locationId]);
  const rowsForTab = activeTab === 'my' ? myDeals : teamDeals;

  const formatDate = (value) => {
    const d = value?.toDate ? value.toDate() : value;
    if (!d) return '-';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <CRMLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Deals</Typography>
        </Stack>

        <Card sx={{ backgroundColor: '#2a2746', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <CardContent>
            <Tabs value={activeTab} onChange={(e,v)=>setActiveTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 1, '& .MuiTab-root': { fontWeight: 600 }, '& .MuiTabs-indicator': { height: 3 } }}>
              <Tab label="MY DEALS" value="my" />
              <Tab label="MY TEAM'S DEALS" value="team" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small" sx={{ '& thead th': { color: 'rgba(255,255,255,0.9)', fontWeight: 600, borderBottomColor: 'rgba(255,255,255,0.08)' }, '& tbody td': { color: 'rgba(255,255,255,0.92)', borderBottomColor: 'rgba(255,255,255,0.06)' }, '& tbody tr:hover': { backgroundColor: 'rgba(255,255,255,0.04)' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsForTab.map(row => {
                    const source = getSourceMeta(row.source);
                    const status = getStatusMeta(row.status);
                    return (
                      <TableRow key={row.id} hover onClick={(e)=>{ const t=e.target; if(t && t.closest && t.closest('a,button,[role="button"],svg')) return; navigate(`/crm/deals/${row.id}`); }} sx={{ cursor:'pointer' }}>
                        <TableCell>{row.title || '-'}</TableCell>
                        <TableCell>{row.contactName || '-'}</TableCell>
                        <TableCell>{row.value ? `$${row.value}` : '-'}</TableCell>
                        <TableCell>{row.stage || '-'}</TableCell>
                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                        <TableCell><Chip size="small" label={source.label} color={source.color} variant="outlined" /></TableCell>
                        <TableCell><Chip size="small" label={status.label} color={status.color} /></TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" title="Log Call"><PhoneOutlinedIcon fontSize="small" /></IconButton>
                            <IconButton size="small" title="Message"><ChatOutlinedIcon fontSize="small" /></IconButton>
                            <IconButton size="small" title="Task"><TaskAltOutlinedIcon fontSize="small" /></IconButton>
                            <IconButton size="small" title="Calendar"><EventOutlinedIcon fontSize="small" /></IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rowsForTab.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No deals to display.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </CRMLayout>
  );
}

export default Deals;

