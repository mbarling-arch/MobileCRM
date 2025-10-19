import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Tooltip, Select, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { updateLandAsset } from '../../../redux-store/slices/landAssetSlice';

const PendingList = ({ assets, companyId }) => {
  const dispatch = useDispatch();
  const [editingCell, setEditingCell] = useState(null); // {assetId, field}

  const handleCellUpdate = async (assetId, field, value) => {
    dispatch(updateLandAsset({ companyId, assetId, updates: { [field]: value } }));
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId, 'landAssets', assetId));
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset');
      }
    }
  };

  const EditableCell = ({ asset, field, type = 'text' }) => {
    const isEditing = editingCell?.assetId === asset.id && editingCell?.field === field;
    const [value, setValue] = useState(asset[field] || '');

    useEffect(() => {
      setValue(asset[field] || '');
    }, [asset[field]]);

    const handleSave = () => {
      if (value !== asset[field]) {
        handleCellUpdate(asset.id, field, value);
      }
      setEditingCell(null);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      return `${parseInt(month)}/${parseInt(day)}/${year}`;
    };

    const getDisplayValue = () => {
      if (type === 'number' && value) {
        return `$${Number(value).toLocaleString()}`;
      }
      if (type === 'date' && value) {
        return formatDate(value);
      }
      return value || '-';
    };

    if (isEditing) {
      return (
        <TextField
          size="small"
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          fullWidth
          InputLabelProps={type === 'date' || type === 'time' ? { shrink: true } : {}}
        />
      );
    }

    return (
      <Box 
        onClick={() => setEditingCell({ assetId: asset.id, field })} 
        tabIndex={-1}
        sx={{ cursor: 'pointer', minHeight: 20, '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }, px: 0.5, py: 0.25 }}
      >
        {getDisplayValue()}
      </Box>
    );
  };

  const LoanTypeCell = ({ asset }) => {
    const [value, setValue] = useState(asset.loanType || '');

    const handleChange = (e) => {
      const newValue = e.target.value;
      setValue(newValue);
      handleCellUpdate(asset.id, 'loanType', newValue);
    };

    const loanTypes = ['Conventional', 'FHA', 'USDA', 'VA', 'Cash'];

    return (
      <Select
        size="small"
        value={value}
        onChange={handleChange}
        displayEmpty
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">-</MenuItem>
        {loanTypes.map(type => (
          <MenuItem key={type} value={type}>{type}</MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Buyer</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Close Date</TableCell>
                <TableCell>Sales Price</TableCell>
                <TableCell>Concessions</TableCell>
                <TableCell>Earnest Money</TableCell>
                <TableCell>Amount Taken</TableCell>
                <TableCell>Est. Completion</TableCell>
                <TableCell>Lender</TableCell>
                <TableCell>Loan</TableCell>
                <TableCell>Title Company</TableCell>
                <TableCell>Title Work</TableCell>
                <TableCell>Survey</TableCell>
                <TableCell>Appraisal</TableCell>
                <TableCell>Clear to Close</TableCell>
                <TableCell>Closing Time</TableCell>
                <TableCell align="center" sx={{ width: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map(asset => (
                <TableRow key={asset.id} hover>
                  <TableCell><EditableCell asset={asset} field="buyer" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="address" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="closeDate" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="salesPrice" type="number" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="concessions" type="number" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="earnestMoney" type="number" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="amountTaken" type="number" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="estCompletion" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="lender" /></TableCell>
                  <TableCell><LoanTypeCell asset={asset} /></TableCell>
                  <TableCell><EditableCell asset={asset} field="titleCompany" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="titleWorkDate" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="surveyDate" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="appraisalDate" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="clearToCloseDate" type="date" /></TableCell>
                  <TableCell><EditableCell asset={asset} field="closingTime" type="time" /></TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={17} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No pending assets to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PendingList;

