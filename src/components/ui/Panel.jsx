import React from 'react';
import { Card, CardContent } from '@mui/material';

function Panel({ children, sx }) {
  return (
    <Card sx={{ borderRadius: 4, backgroundColor: '#26223a', boxShadow: '0 8px 20px rgba(0,0,0,0.35)', ...sx }}>
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
}

export default Panel;


