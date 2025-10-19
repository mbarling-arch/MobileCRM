import React from 'react';
import { Drawer, Box, Typography, Stack, IconButton, TextField, Button, Avatar, List, ListItemButton, ListItemText } from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';

export const NotesDrawer = ({
  open,
  onClose,
  notes,
  noteText,
  setNoteText,
  cursorPosition,
  setCursorPosition,
  showMentions,
  filteredUsers,
  noteInputRef,
  handleNoteKeyPress,
  handleSendNote,
  insertMention,
  buyerName
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Quick Notes</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              {buyerName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Notes List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={2}>
            {notes.map((note) => (
              <Box
                key={note.id}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                    {note.authorName?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 600 }}>
                      {note.authorName}
                    </Typography>
                    <Typography sx={{ color: 'text.primary', fontSize: 14, mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {note.text}
                    </Typography>
                    <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 1 }}>
                      {note.createdAt?.toDate?.().toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) || 'Just now'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
            {notes.length === 0 && (
              <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                No notes yet. Add one below!
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Mention Suggestions */}
        {showMentions && filteredUsers.length > 0 && (
          <Box
            sx={{
              mx: 2,
              mb: 1,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              maxHeight: 200,
              overflowY: 'auto',
              boxShadow: '0px -2px 8px rgba(100, 116, 139, 0.1)'
            }}
          >
            <List sx={{ py: 0 }}>
              {filteredUsers.slice(0, 5).map((user) => (
                <ListItemButton
                  key={user.email}
                  onClick={() => insertMention(user)}
                  sx={{ py: 1, px: 2 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}`}
                      secondary={user.email}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 11 }}
                    />
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Input Section */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
          <Stack spacing={1.5}>
            <TextField
              inputRef={noteInputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type @ to mention someone..."
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyPress={handleNoteKeyPress}
              onSelect={(e) => setCursorPosition(e.target.selectionStart)}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendNote}
              disabled={!noteText.trim()}
              fullWidth
            >
              Add Note
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

