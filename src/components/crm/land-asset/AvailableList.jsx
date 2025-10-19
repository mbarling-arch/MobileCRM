import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, Typography, Stack
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { updateLandAsset } from '../../../redux-store/slices/landAssetSlice';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../firebase';

const AvailableList = ({ assets, companyId }) => {
  const dispatch = useDispatch();
  const [editingCell, setEditingCell] = useState(null); // {assetId, field}
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    'Deed',
    '911 Letter',
    'Survey/Plat',
    'Home Pictures',
    'Site Plan',
    'Septic Design',
    'Home Invoice'
  ];

  // Group and sort assets by city alphabetically
  const groupedAssets = assets.reduce((groups, asset) => {
    // Normalize city name: trim whitespace and convert to title case for grouping
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

  const handleCellUpdate = async (assetId, field, value) => {
    dispatch(updateLandAsset({ companyId, assetId, updates: { [field]: value } }));
  };

  const handleOpenDocuments = (asset) => {
    setSelectedAsset(asset);
    setDocumentsDialogOpen(true);
  };

  const handleCloseDocuments = () => {
    setDocumentsDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleFileUpload = async (docType, event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedAsset) return;

    setUploading(true);
    try {
      // Create a deep copy of documents to avoid immutability issues
      const documents = JSON.parse(JSON.stringify(selectedAsset.documents || {}));
      const existingDocs = documents[docType] || [];
      
      // Upload all selected files
      const uploadPromises = Array.from(files).map(async (file) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${docType.replace(/\//g, '-')}_${timestamp}_${random}_${file.name}`;
        const storageRef = ref(storage, `landAssets/${companyId}/${selectedAsset.id}/documents/${fileName}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return {
          url: downloadURL,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          storagePath: `landAssets/${companyId}/${selectedAsset.id}/documents/${fileName}`
        };
      });

      const newDocs = await Promise.all(uploadPromises);
      documents[docType] = [...existingDocs, ...newDocs];

      await handleCellUpdate(selectedAsset.id, 'documents', documents);
      
      // Update local state
      setSelectedAsset({...selectedAsset, documents});
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docType, docIndex) => {
    if (!selectedAsset?.documents?.[docType]?.[docIndex]) return;
    
    if (!window.confirm(`Delete this document?`)) return;

    try {
      const docData = selectedAsset.documents[docType][docIndex];
      const storageRef = ref(storage, docData.storagePath);
      await deleteObject(storageRef);

      // Create a deep copy of documents to avoid immutability issues
      const documents = JSON.parse(JSON.stringify(selectedAsset.documents || {}));
      const updatedDocs = [...(documents[docType] || [])];
      updatedDocs.splice(docIndex, 1);
      
      if (updatedDocs.length === 0) {
        delete documents[docType];
      } else {
        documents[docType] = updatedDocs;
      }

      await handleCellUpdate(selectedAsset.id, 'documents', documents);
      
      // Update local state
      setSelectedAsset({...selectedAsset, documents});
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const EditableCell = ({ asset, field, type = 'text', readOnly = false }) => {
    const isEditing = editingCell?.assetId === asset.id && editingCell?.field === field;
    const [value, setValue] = useState(asset[field] || '');

    useEffect(() => {
      setValue(asset[field] || '');
    }, [asset[field]]);

    const handleSave = async () => {
      if (value !== asset[field]) {
        const updates = { [field]: value };
        
        // If updating listDate, also calculate and update DOM
        if (field === 'listDate' && value) {
          const listDate = new Date(value);
          const today = new Date();
          const diffTime = Math.abs(today - listDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updates.dom = diffDays;
        }
        
        await handleCellUpdate(asset.id, Object.keys(updates)[0], updates[Object.keys(updates)[0]]);
        
        // If we also updated DOM, update it separately
        if (updates.dom !== undefined) {
          await handleCellUpdate(asset.id, 'dom', updates.dom);
        }
      }
      setEditingCell(null);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      // Parse the date string directly without timezone conversion
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      return `${parseInt(month)}/${parseInt(day)}/${year}`;
    };

    const calculateDOM = () => {
      if (!asset.listDate) return '-';
      const listDate = new Date(asset.listDate);
      const today = new Date();
      const diffTime = Math.abs(today - listDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const getDisplayValue = () => {
      if (field === 'dom') {
        return calculateDOM();
      }
      if (type === 'number' && value) {
        return `$${Number(value).toLocaleString()}`;
      }
      if (type === 'date' && value) {
        return formatDate(value);
      }
      return value || '-';
    };

    if (isEditing && !readOnly) {
      return (
        <TextField
          size="small"
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          InputLabelProps={type === 'date' ? { shrink: true } : {}}
          sx={{ 
            '& .MuiInputBase-root': {
              fontSize: 13
            },
            maxWidth: '100%'
          }}
        />
      );
    }

    return (
      <Box 
        onClick={readOnly ? undefined : () => setEditingCell({ assetId: asset.id, field })} 
        tabIndex={-1}
        sx={{ 
          cursor: readOnly ? 'default' : 'pointer', 
          minHeight: 20, 
          '&:hover': readOnly ? {} : { backgroundColor: 'action.hover', borderRadius: 1 }, 
          px: 0.5, 
          py: 0.25 
        }}
      >
        {getDisplayValue()}
      </Box>
    );
  };

  return (
    <>
      <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                <TableCell 
                  sx={{ 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: 'customColors.cardBackground',
                    zIndex: 3,
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    p: 1
                  }}
                >
                  Address
                </TableCell>
                <TableCell>Lot Size</TableCell>
                <TableCell>List Price</TableCell>
                <TableCell>Current Price</TableCell>
                <TableCell>Home</TableCell>
                <TableCell>Bed/Bath</TableCell>
                <TableCell>Front Deck</TableCell>
                <TableCell>Back Deck</TableCell>
                <TableCell>MLS</TableCell>
                <TableCell>DOM</TableCell>
                <TableCell>Ownership</TableCell>
                <TableCell>List Date</TableCell>
                <TableCell align="center" sx={{ width: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCities.map((cityKey) => (
                <React.Fragment key={cityKey}>
                  {/* City Header Row */}
                  <TableRow>
                    <TableCell 
                      colSpan={13}
                      sx={{
                        backgroundColor: 'primary.dark',
                        borderTop: '2px solid',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        py: 1.5,
                        position: 'sticky',
                        left: 0,
                        zIndex: 2
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
                      <TableCell 
                        sx={{ 
                          position: 'sticky', 
                          left: 0, 
                          backgroundColor: 'customColors.cardBackground',
                          zIndex: 2,
                          borderRight: '2px solid',
                          borderColor: 'divider',
                          p: 1
                        }}
                      >
                        <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <EditableCell asset={asset} field="address" />
                        </Box>
                      </TableCell>
                      <TableCell><EditableCell asset={asset} field="lotSize" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="listPrice" type="number" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="currentPrice" type="number" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="home" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="bedBath" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="frontDeck" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="backDeck" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="mlsNumber" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="dom" type="number" readOnly={true} /></TableCell>
                      <TableCell><EditableCell asset={asset} field="ownership" /></TableCell>
                      <TableCell><EditableCell asset={asset} field="listDate" type="date" /></TableCell>
                      <TableCell align="center">
                        <Tooltip title="Documents">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDocuments(asset)}
                          >
                            <FolderIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No available assets to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>

    {/* Documents Dialog */}
    <Dialog
      open={documentsDialogOpen}
      onClose={handleCloseDocuments}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <DialogTitle>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
          Documents - {selectedAsset?.address || 'Asset'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List sx={{ py: 0 }}>
          {documentTypes.map((docType) => {
            const existingDocs = selectedAsset?.documents?.[docType] || [];
            const hasDocuments = existingDocs.length > 0;
            
            return (
              <Box
                key={docType}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: hasDocuments ? 1 : 0 }}>
                  <DescriptionIcon 
                    sx={{ 
                      fontSize: 20, 
                      color: hasDocuments ? 'success.main' : 'text.disabled' 
                    }} 
                  />
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: hasDocuments ? 600 : 400,
                      color: hasDocuments ? 'text.primary' : 'text.secondary',
                      flex: 1
                    }}
                  >
                    {docType} {hasDocuments && `(${existingDocs.length})`}
                  </Typography>
                  <input
                    type="file"
                    id={`upload-${docType}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(docType, e)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                  />
                  <label htmlFor={`upload-${docType}`}>
                    <Button
                      component="span"
                      size="small"
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      disabled={uploading}
                    >
                      Upload
                    </Button>
                  </label>
                </Stack>
                
                {hasDocuments && (
                  <Stack spacing={0.5} sx={{ ml: 5 }}>
                    {existingDocs.map((doc, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.5,
                          px: 1,
                          backgroundColor: 'action.hover',
                          borderRadius: 1
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            flex: 1,
                            color: 'text.secondary'
                          }}
                        >
                          {doc.fileName}
    </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => window.open(doc.url, '_blank')}
                          sx={{ minWidth: 'auto', fontSize: 11 }}
                        >
                          View
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDocument(docType, index)}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDocuments} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default AvailableList;

