import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

function StatCard({ title, value, icon, color = '#26223a' }) {
  return (
    <Card sx={{ borderRadius: 4, backgroundColor: color, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </CardContent>
    </Card>
  );
}

export default StatCard;


