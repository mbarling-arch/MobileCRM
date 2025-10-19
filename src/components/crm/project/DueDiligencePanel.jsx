import React from 'react';
import { Paper, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Description as DescriptionIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DUE_DILIGENCE_DOCUMENTS } from '../../../constants/projectConstants';

export const DueDiligencePanel = ({
  dueDiligenceDocs,
  getDueDiligenceDoc,
  onDocumentClick,
  onDeleteDocument
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Left Container - 75% */}
      <Paper sx={{ 
        flex: '1 1 75%', 
        p: 3, 
        backgroundColor: 'customColors.calendarHeaderBackground', 
        border: '1px solid', 
        borderColor: 'customColors.calendarBorder' 
      }}>
        <Typography sx={{ color: 'text.disabled', fontSize: 14, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
          Reserved for future content
        </Typography>
      </Paper>

      {/* Right Container - 25% - Documents */}
      <Paper sx={{ 
        flex: '0 0 25%', 
        p: 2, 
        backgroundColor: 'customColors.calendarHeaderBackground', 
        border: '1px solid', 
        borderColor: 'customColors.calendarBorder' 
      }}>
        <List sx={{ py: 0 }}>
          {DUE_DILIGENCE_DOCUMENTS.map((docType) => {
            const existingDoc = getDueDiligenceDoc(docType);
            return (
              <ListItem
                key={docType}
                sx={{
                  px: 0,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  onClick={() => onDocumentClick(docType)}
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      '& .MuiTypography-root': {
                        color: 'primary.main'
                      }
                    }
                  }}
                >
                  <DescriptionIcon sx={{ 
                    fontSize: 18, 
                    color: existingDoc ? 'success.main' : 'text.disabled' 
                  }} />
                  <ListItemText
                    primary={docType}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: existingDoc ? 600 : 400,
                      color: existingDoc ? 'text.primary' : 'text.secondary',
                      sx: {
                        textDecoration: existingDoc ? 'underline' : 'none',
                        cursor: 'pointer'
                      }
                    }}
                  />
                </Box>
                {existingDoc && (
                  <IconButton
                    size="small"
                    onClick={() => onDeleteDocument(existingDoc.id)}
                    sx={{ color: 'error.main', p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

