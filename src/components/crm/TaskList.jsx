import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import ListContainer from '../ListContainer';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../hooks/useUser';

const PRIORITY_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336'
};

const TASK_COLUMNS = [
  {
    key: 'status',
    header: 'Status',
    render: (value, row) => (
      <Checkbox
        checked={value === 'completed'}
        onChange={() => handleStatusToggle(row)}
        icon={<RadioButtonUncheckedIcon />}
        checkedIcon={<CheckCircleIcon />}
        sx={{
          color: value === 'completed' ? 'success.main' : 'text.secondary',
          '&.Mui-checked': {
            color: 'success.main',
          },
        }}
      />
    )
  },
  {
    key: 'title',
    header: 'Task',
    render: (value, row) => (
      <Box>
        <Typography
          variant="body1"
          sx={{
            textDecoration: row.status === 'completed' ? 'line-through' : 'none',
            fontWeight: row.isOverdue ? 600 : 400,
            color: row.isOverdue ? 'error.main' : 'text.primary'
          }}
        >
          {value}
        </Typography>
        {row.description && (
          <Typography variant="body2" color="text.secondary">
            {row.description}
          </Typography>
        )}
      </Box>
    )
  },
  {
    key: 'assignedTo',
    header: 'Assigned To',
    render: (value) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2">
          {value || 'Unassigned'}
        </Typography>
      </Stack>
    )
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    render: (value) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography
          variant="body2"
          sx={{ color: 'text.primary' }}
        >
          {formatDate(value)}
        </Typography>
      </Stack>
    )
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (value) => (
      <Chip
        label={(value || 'medium').toUpperCase()}
        size="small"
        sx={{
          backgroundColor: `${PRIORITY_COLORS[value || 'medium']}20`,
          color: PRIORITY_COLORS[value || 'medium'],
          fontWeight: 'bold'
        }}
      />
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (value, row) => (
      <Stack direction="row" spacing={1}>
        <IconButton size="small" color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    )
  }
];

function TaskList({ type }) {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const companyId = userProfile?.companyId || 'demo-company';
  const locationId = userProfile?.locationId || 'demo-location';
  const currentUserEmail = userProfile?.email || userProfile?.firebaseUser?.email;

  const handleStatusToggle = async (task) => {
    try {
      const taskRef = doc(db, 'companies', companyId, 'tasks', task.id);
      const newStatus = task.status === 'completed' ? 'open' : 'completed';
      await updateDoc(taskRef, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'tasks');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !t.archived);
      setTasks(data);
    });
    return () => unsub();
  }, [companyId]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = tasks;

    // Filter by type
    switch (type) {
      case 'today':
        filtered = tasks.filter(task => {
          if (task.status === 'completed') return false;
          const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
          if (!dueDate) return false;
          return dueDate >= today && dueDate < tomorrow;
        });
        break;
      case 'past-due':
        filtered = tasks.filter(task => {
          if (task.status === 'completed') return false;
          const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
          if (!dueDate) return false;
          return dueDate < today;
        });
        break;
      case 'team':
        filtered = tasks.filter(task => {
          return task.assignedTo && task.assignedTo !== currentUserEmail && task.locationId === locationId;
        });
        break;
      default:
        break;
    }

    // Filter by status tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(task => task.status !== 'completed');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      default:
        break;
    }

    // Add isOverdue field for DataTable rendering
    return filtered.map(task => {
      const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
      const isOverdue = task.status !== 'completed' && dueDate && dueDate < today;
      return {
        ...task,
        isOverdue,
        actions: null // Placeholder for actions column
      };
    });
  }, [tasks, type, activeTab, currentUserEmail, locationId]);

  const formatDate = (date) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const getPageTitle = () => {
    switch (type) {
      case 'today':
        return "Today's Tasks";
      case 'past-due':
        return 'Past Due Tasks';
      case 'team':
        return "My Team's Tasks";
      default:
        return 'All Tasks';
    }
  };

  const getTabCounts = () => {
    const baseTasks = (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (type) {
        case 'today':
          return tasks.filter(task => {
            if (task.status === 'completed') return false;
            const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
            if (!dueDate) return false;
            return dueDate >= today && dueDate < tomorrow;
          });
        case 'past-due':
          return tasks.filter(task => {
            if (task.status === 'completed') return false;
            const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
            if (!dueDate) return false;
            return dueDate < today;
          });
        case 'team':
          return tasks.filter(task => {
            return task.assignedTo && task.assignedTo !== currentUserEmail && task.locationId === locationId;
          });
        default:
          return tasks;
      }
    })();

    const pending = baseTasks.filter(task => task.status !== 'completed').length;
    const completed = baseTasks.filter(task => task.status === 'completed').length;
    const all = baseTasks.length;

    return { all, pending, completed };
  };

  // Get title based on type
  const getTitle = () => {
    switch (type) {
      case 'today':
        return "Today's Tasks";
      case 'past-due':
        return 'Past Due Tasks';
      case 'team':
        return "My Team's Tasks";
      default:
        return getPageTitle();
    }
  };

  const tabCounts = getTabCounts();

  return (
    <UnifiedLayout mode="crm">
      <ListContainer
        title={getTitle()}
        subtitle={`${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`}
        backButton={
          <Button
            variant="outlined"
            onClick={() => navigate('/crm/tasks')}
            sx={{ minWidth: 120 }}
          >
            Back to Dashboard
          </Button>
        }
        tabs={type ? undefined : [
          { label: `All (${tabCounts.all})`, value: 'all' },
          { label: `Pending (${tabCounts.pending})`, value: 'pending' },
          { label: `Completed (${tabCounts.completed})`, value: 'completed' }
        ]}
        activeTab={type ? undefined : activeTab}
        onTabChange={type ? undefined : setActiveTab}
        tableProps={{
          columns: TASK_COLUMNS,
          rows: filteredTasks,
          dense: true,
          variant: 'embedded',
          square: true
        }}
      />
    </UnifiedLayout>
  );
}

export default TaskList;