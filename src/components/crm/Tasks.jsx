import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack
} from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import TaskList from './TaskList';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

function Tasks({ type }) {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [tasks, setTasks] = useState([]);

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'tasks');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !t.archived);
      setTasks(data);
    });
    return () => unsub();
  }, [companyId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const taskStats = useMemo(() => {
    const todayTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
      if (!dueDate) return false;
      return dueDate >= today && dueDate < tomorrow;
    });

    const pastDueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
      if (!dueDate) return false;
      return dueDate < today;
    });

    const teamTasks = tasks.filter(task => {
      return task.assignedTo && task.assignedTo !== currentUserEmail && task.locationId === locationId;
    });

    return { todayTasks, pastDueTasks, teamTasks };
  }, [tasks, today, tomorrow, currentUserEmail, locationId]);

  const TaskCard = ({ title, icon: Icon, count, color, onClick, subtitle }) => (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        },
        border: `1px solid ${color}20`,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
              {count}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 48, color: color, opacity: 0.7 }} />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            View Details
          </Typography>
          <ArrowForwardIcon sx={{ color: color, fontSize: 20 }} />
        </Stack>
      </CardContent>
    </Card>
  );

  // If type is specified, show the task list view
  if (type) {
    return <TaskList type={type} />;
  }

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Task Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track tasks across your team
            </Typography>
          </Box>

          <Stack spacing={3}>
            <TaskCard
              title="Today's Tasks"
              icon={TodayIcon}
              count={taskStats.todayTasks.length}
              color="#2196f3"
              onClick={() => navigate('/crm/tasks/today')}
              subtitle="Tasks due today"
            />

            <TaskCard
              title="Past Due Tasks"
              icon={ScheduleIcon}
              count={taskStats.pastDueTasks.length}
              color="#f44336"
              onClick={() => navigate('/crm/tasks/past-due')}
              subtitle="Overdue tasks requiring attention"
            />

            <TaskCard
              title="My Team's Tasks"
              icon={GroupIcon}
              count={taskStats.teamTasks.length}
              color="#4caf50"
              onClick={() => navigate('/crm/tasks/team')}
              subtitle="Tasks assigned to team members"
            />
          </Stack>
        </Stack>
      </Box>
    </UnifiedLayout>
  );
}

export default Tasks;

