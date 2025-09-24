import React from 'react';
import { Box, InputBase, IconButton, Stack, Avatar, Tooltip } from '@mui/material';
import { Search as SearchIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

function TopSearchBar({ onAvatarClick, onQuickAddLead }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.drawer + 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
        pointerEvents: 'none'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, width: 'min(720px, 92vw)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', pointerEvents: 'auto' }}>
        <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
        <InputBase placeholder="Search…" sx={{ flex: 1, color: 'inherit' }} inputProps={{ 'aria-label': 'search' }} />
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'fixed', right: 16, top: 12, pointerEvents: 'auto' }}>
        <Tooltip title="Quick Add Lead">
          <IconButton color="inherit" onClick={onQuickAddLead}>
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
        <IconButton color="inherit" onClick={toggleTheme}>
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={onAvatarClick} src={currentUser?.photoURL || ''} />
      </Stack>
    </Box>
  );
}

export default TopSearchBar;


