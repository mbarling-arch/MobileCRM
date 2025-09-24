import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip
} from '@mui/material';
import {
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import CRMLayout from '../CRMLayout';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../UserContext';

function Projects() {
  const { userProfile } = useUser();
  const [projects, setProjects] = useState([]);

  const companyId = userProfile?.companyId || 'demo-company';

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'projects');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.archived);
      setProjects(data);
    });
    return () => unsub();
  }, [companyId]);

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status !== 'completed').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => {
      if (p.status === 'completed' || !p.dueDate) return false;
      const dueDate = p.dueDate?.toDate ? p.dueDate.toDate() : new Date(p.dueDate);
      return dueDate < new Date();
    }).length
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ flex: 1, minWidth: 200 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Icon sx={{ fontSize: 40, color }} />
          <Box>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }) => {
    const isOverdue = project.status !== 'completed' && project.dueDate && (
      project.dueDate?.toDate ? project.dueDate.toDate() : new Date(project.dueDate)
    ) < new Date();

    return (
      <Card sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
        border: isOverdue ? '1px solid #f44336' : '1px solid rgba(255,255,255,0.12)'
      }}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {project.name || 'Unnamed Project'}
              </Typography>
              <Chip
                label={project.status || 'active'}
                size="small"
                color={project.status === 'completed' ? 'success' : 'primary'}
                variant={project.status === 'completed' ? 'filled' : 'outlined'}
              />
            </Stack>

            {project.description && (
              <Typography variant="body2" color="text.secondary">
                {project.description}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              {project.dueDate && (
                <Typography variant="caption" sx={{
                  color: isOverdue ? 'error.main' : 'text.secondary',
                  fontWeight: isOverdue ? 600 : 400
                }}>
                  Due: {new Date(project.dueDate?.toDate ? project.dueDate.toDate() : project.dueDate).toLocaleDateString()}
                </Typography>
              )}
              {project.assignedTo && (
                <Typography variant="caption" color="text.secondary">
                  Assigned: {project.assignedTo}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <CRMLayout>
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                Project Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage your projects
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minWidth: 140 }}
            >
              New Project
            </Button>
          </Stack>

          {/* Stats Cards */}
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
            <StatCard
              title="Total Projects"
              value={projectStats.total}
              icon={FolderIcon}
              color="#2196f3"
            />
            <StatCard
              title="Active Projects"
              value={projectStats.active}
              icon={ScheduleIcon}
              color="#ff9800"
            />
            <StatCard
              title="Completed"
              value={projectStats.completed}
              icon={CheckCircleIcon}
              color="#4caf50"
            />
          </Stack>

          {/* Projects Grid */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Projects
            </Typography>

            {projects.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No projects yet. Create your first project to get started!
                </Typography>
              </Card>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 2
              }}>
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </CRMLayout>
  );
}

export default Projects;

