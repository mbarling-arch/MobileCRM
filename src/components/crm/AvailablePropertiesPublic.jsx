import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const AvailablePropertiesPublic = () => {
  const [assets, setAssets] = useState([]);
  
  // Get companyId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('companyId') || 'demo-company';

  useEffect(() => {
    const col = collection(db, 'companies', companyId, 'landAssets');
    const q = query(col, where('status', '==', 'available'), orderBy('city'));
    
    const unsub = onSnapshot(q, snap => {
      const loadedAssets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssets(loadedAssets);
    });
    
    return () => unsub();
  }, [companyId]);

  // Group and sort assets by city alphabetically
  const groupedAssets = assets.reduce((groups, asset) => {
    const rawCity = asset.city || '';
    const city = rawCity.trim() || 'Uncategorized';
    const normalizedCity = city.toLowerCase();
    
    if (!groups[normalizedCity]) {
      groups[normalizedCity] = {
        displayName: city,
        assets: []
      };
    }
    groups[normalizedCity].assets.push(asset);
    return groups;
  }, {});

  const sortedCities = Object.keys(groupedAssets).sort((a, b) => {
    if (a === 'uncategorized') return 1;
    if (b === 'uncategorized') return -1;
    return a.localeCompare(b);
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${parseInt(month)}/${parseInt(day)}/${year}`;
  };

  const calculateDOM = (listDate) => {
    if (!listDate) return '-';
    const listDateObj = new Date(listDate);
    const today = new Date();
    const diffTime = Math.abs(today - listDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#ffffff' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Available Properties
        </Typography>
      </Paper>

      {/* Properties Table */}
      <Paper sx={{ backgroundColor: '#ffffff' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Lot Size</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>List Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Current Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Home</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Bed/Bath</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Front Deck</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Back Deck</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>MLS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>DOM</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>List Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCities.map((cityKey) => (
                <React.Fragment key={cityKey}>
                  {/* City Header Row */}
                  <TableRow>
                    <TableCell 
                      colSpan={11}
                      sx={{
                        backgroundColor: 'primary.dark',
                        borderTop: '2px solid',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        py: 1.5
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: 1 }}>
                        {groupedAssets[cityKey].displayName.toUpperCase()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {/* Assets for this city */}
                  {groupedAssets[cityKey].assets.map((asset) => (
                    <TableRow key={asset.id} hover>
                      <TableCell>{asset.address || '-'}</TableCell>
                      <TableCell>{asset.lotSize || '-'}</TableCell>
                      <TableCell>{asset.listPrice ? `$${Number(asset.listPrice).toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{asset.currentPrice ? `$${Number(asset.currentPrice).toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{asset.home || '-'}</TableCell>
                      <TableCell>{asset.bedBath || '-'}</TableCell>
                      <TableCell>{asset.frontDeck || '-'}</TableCell>
                      <TableCell>{asset.backDeck || '-'}</TableCell>
                      <TableCell>{asset.mlsNumber || '-'}</TableCell>
                      <TableCell>{calculateDOM(asset.listDate)}</TableCell>
                      <TableCell>{formatDate(asset.listDate)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No available properties to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AvailablePropertiesPublic;

