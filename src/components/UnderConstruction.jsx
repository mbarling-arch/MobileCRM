import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';

const UnderConstruction = ({ title, description }) => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3
        }}
      >
        <BuildIcon
          sx={{
            fontSize: 80,
            color: 'rgba(255,255,255,0.4)',
            mb: 3
          }}
        />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            mb: 2
          }}
        >
          {title || 'Under Construction'}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          {description || 'This feature is currently being developed and will be available soon. Please check back later for updates.'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic'
          }}
        >
          Coming Soon
        </Typography>
      </Paper>
    </Container>
  );
};

export default UnderConstruction;

