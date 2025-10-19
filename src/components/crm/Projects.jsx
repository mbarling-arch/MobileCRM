import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import UnifiedLayout from '../UnifiedLayout';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import AddProjectDrawer from './AddProjectDrawer';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'projects');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.archived);
      setProjects(data);
    });
    return () => unsub();
  }, [companyId]);

  const myProjects = useMemo(() => projects.filter(p => p.createdBy === currentUserEmail), [projects, currentUserEmail]);
  const teamProjects = useMemo(() => projects.filter(p => p.createdBy && p.createdBy !== currentUserEmail), [projects, currentUserEmail]);
  const rowsForTab = activeTab === 'my' ? myProjects : activeTab === 'team' ? teamProjects : projects;

  const getStatusLabel = (status) => {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_market': 'On Market',
      'under_contract': 'Under Contract',
      'sold': 'Sold'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'default',
      'in_progress': 'info',
      'on_market': 'primary',
      'under_contract': 'warning',
      'sold': 'success'
    };
    return colors[status] || 'default';
  };

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Projects</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            onClick={() => setAddDrawerOpen(true)}
            >
              New Project
            </Button>
          </Stack>

        <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
          <CardContent>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 1, '& .MuiTab-root': { fontWeight: 600 }, '& .MuiTabs-indicator': { height: 3 } }}>
              <Tab label="ALL PROJECTS" value="all" />
              <Tab label="MY PROJECTS" value="my" />
              <Tab label="MY TEAM'S PROJECTS" value="team" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small" sx={{ '& thead th': { color: 'text.secondary', fontWeight: 600, borderBottomColor: 'divider' }, '& tbody td': { color: 'text.primary', borderBottomColor: 'divider' }, '& tbody tr:hover': { backgroundColor: 'action.hover' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Lot Number</TableCell>
                    <TableCell>Lot Size</TableCell>
                    <TableCell>Home</TableCell>
                    <TableCell>Land Owner</TableCell>
                    <TableCell>Offline Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsForTab.map(project => (
                    <TableRow key={project.id} hover onClick={(e) => { const t = e.target; if (t && t.closest && t.closest('a,button,[role="button"],svg')) return; navigate(`/crm/projects/${project.id}`); }} sx={{ cursor: 'pointer' }}>
                      <TableCell>{project.address || '-'}</TableCell>
                      <TableCell>{project.lotNumber || '-'}</TableCell>
                      <TableCell>{project.lotSize ? `${project.lotSize} acres` : '-'}</TableCell>
                      <TableCell>{project.homeDetails ? `${project.homeDetails.factory} ${project.homeDetails.model}` : '-'}</TableCell>
                      <TableCell>{project.landOwner || '-'}</TableCell>
                      <TableCell>{project.offlineDate || '-'}</TableCell>
                      <TableCell><Chip size="small" label={getStatusLabel(project.propertyStatus)} color={getStatusColor(project.propertyStatus)} /></TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" title="Log Call"><PhoneOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" title="Message"><ChatOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" title="Task"><TaskAltOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" title="Calendar"><EventOutlinedIcon fontSize="small" /></IconButton>
          </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rowsForTab.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No projects to display.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <AddProjectDrawer
          open={addDrawerOpen}
          onClose={() => setAddDrawerOpen(false)}
        />
      </Box>
    </UnifiedLayout>
  );
}

export default Projects;

