import React, { useState } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { 
  Task as TaskIcon, 
  Chat as ChatIcon, 
  Timeline as TimelineIcon, 
  Description as DescriptionIcon 
} from '@mui/icons-material';

/**
 * Floating action button with quick actions for prospect management
 */
export const ProspectActions = ({
  onTasksClick,
  onNotesClick,
  onActivitiesClick,
  onDocumentsClick
}) => {
  const [open, setOpen] = useState(false);

  const handleAction = (callback) => () => {
    setOpen(false);
    if (callback) callback();
  };

  const actions = [
    {
      icon: <TaskIcon />,
      name: 'Tasks',
      onClick: handleAction(onTasksClick),
      color: 'warning.main',
      hoverColor: 'warning.dark'
    },
    {
      icon: <DescriptionIcon />,
      name: 'Documents',
      onClick: handleAction(onDocumentsClick),
      color: 'success.main',
      hoverColor: 'success.dark'
    },
    {
      icon: <TimelineIcon />,
      name: 'Activities',
      onClick: handleAction(onActivitiesClick),
      color: 'secondary.main',
      hoverColor: 'secondary.dark'
    },
    {
      icon: <ChatIcon />,
      name: 'Notes',
      onClick: handleAction(onNotesClick),
      color: 'info.main',
      hoverColor: 'info.dark'
    }
  ];

  return (
    <SpeedDial
      ariaLabel="Quick Actions"
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24,
        '& .MuiSpeedDial-fab': {
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }
      }}
      icon={<SpeedDialIcon />}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
          sx={{
            backgroundColor: action.color,
            color: 'white',
            '&:hover': {
              backgroundColor: action.hoverColor
            }
          }}
        />
      ))}
    </SpeedDial>
  );
};

