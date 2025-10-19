import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const SubdivisionList = ({ assets, companyId }) => {
  return (
    <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
      <CardContent>
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
          Subdivision view - coming soon
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SubdivisionList;

