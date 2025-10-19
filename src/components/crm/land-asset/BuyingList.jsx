import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Tabs, Tab, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Checkbox, MenuItem, Select, Button, Menu, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { updateLandAsset } from '../../../redux-store/slices/landAssetSlice';

const BuyingList = ({ assets, companyId, buyingSubTab, setBuyingSubTab }) => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // {assetId, field}
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [currentContext, setCurrentContext] = useState(null); // {assetId, field, value}

  // Load company locations
  useEffect(() => {
    if (!companyId) return;

    const locationsRef = collection(db, 'companies', companyId, 'locations');
    const unsubscribe = onSnapshot(locationsRef, (snapshot) => {
      const locs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locs);
    });

    return () => unsubscribe();
  }, [companyId]);

  const offersOut = assets.filter(a => a.status === 'offer');
  const option = assets.filter(a => a.status === 'option');
  const title = assets.filter(a => a.status === 'title');
  const closing = assets.filter(a => a.status === 'closing');

  const rowsForTab = {
    'offers-out': offersOut,
    'option': option,
    'title': title,
    'closing': closing
  }[buyingSubTab] || assets;

  const handleCellUpdate = async (assetId, field, value) => {
    dispatch(updateLandAsset({ companyId, assetId, updates: { [field]: value } }));
  };

  const handleMarkExecuted = (asset) => {
    const newStatus = asset.hasOptionPeriod ? 'option' : 'title';
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    dispatch(updateLandAsset({ 
      companyId, 
      assetId: asset.id, 
      updates: { 
        status: newStatus,
        contractDate: today
      } 
    }));
  };

  const handleMoveToTitle = (asset) => {
    dispatch(updateLandAsset({ 
      companyId, 
      assetId: asset.id, 
      updates: { 
        status: 'title'
      } 
    }));
  };

  const handleMoveToClosing = (asset) => {
    dispatch(updateLandAsset({ 
      companyId, 
      assetId: asset.id, 
      updates: { 
        status: 'closing'
      } 
    }));
  };

  const handleMoveToAvailable = (asset) => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    dispatch(updateLandAsset({ 
      companyId, 
      assetId: asset.id, 
      updates: { 
        status: 'available',
        ownership: asset.buyer || '',
        mlsNumber: '',
        listDate: today,
        dom: 0,
        // Address fields and lot size automatically carry over
        city: asset.city || '',
        state: asset.state || '',
        zipcode: asset.zipcode || ''
      } 
    }));
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

  // Context menu handlers
  const handleContextMenu = (e, assetId, field, value) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
    setCurrentContext({ assetId, field, value });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleInsertLink = () => {
    setLinkText(currentContext?.value || '');
    setLinkUrl('');
    setLinkDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleRemoveLink = () => {
    if (currentContext) {
      const { assetId, field, value } = currentContext;
      // Remove all markdown links from the text
      const textWithoutLinks = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
      handleCellUpdate(assetId, field, textWithoutLinks);
    }
    handleCloseContextMenu();
  };

  const handleSaveLink = () => {
    if (currentContext && linkUrl) {
      const { assetId, field, value } = currentContext;
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
      const newValue = value ? `${value} ${linkMarkdown}` : linkMarkdown;
      handleCellUpdate(assetId, field, newValue);
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const hasLink = (text) => {
    if (!text) return false;
    return /\[([^\]]+)\]\(([^)]+)\)/.test(text);
  };

  const BuyerCell = ({ asset }) => {
    const isEditing = editingCell?.assetId === asset.id && editingCell?.field === 'buyer';
    const [value, setValue] = useState(asset.buyer || '');

    useEffect(() => {
      setValue(asset.buyer || '');
    }, [asset.buyer]);

    const handleSave = (newValue) => {
      if (newValue !== asset.buyer) {
        handleCellUpdate(asset.id, 'buyer', newValue);
      }
      setEditingCell(null);
    };

    if (isEditing) {
      return (
        <Select
          size="small"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleSave(e.target.value);
          }}
          autoFocus
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'background.paper',
                '& .MuiMenuItem-root': {
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected'
                  }
                }
              }
            }
          }}
        >
          <MenuItem value="">Select Location</MenuItem>
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.name || loc.id}>
              {loc.name || loc.id}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <Box 
        onClick={() => setEditingCell({ assetId: asset.id, field: 'buyer' })} 
        tabIndex={-1}
        sx={{ cursor: 'pointer', minHeight: 20, '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }, px: 0.5, py: 0.25 }}
      >
        {value || '-'}
      </Box>
    );
  };

  const renderWithLinks = (text) => {
    if (!text) return '-';
    
    // Match markdown-style links [text](url)
    const parts = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: '#2196f3', textDecoration: 'underline' }}
        >
          {match[1]}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
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
      // Parse the date string directly without timezone conversion
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
      return renderWithLinks(value || '-');
    };

    if (isEditing) {
      return (
        <TextField
          size="small"
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onContextMenu={(e) => handleContextMenu(e, asset.id, field, value)}
          autoFocus
          fullWidth
          InputLabelProps={type === 'date' ? { shrink: true } : {}}
        />
      );
    }

    return (
      <Box 
        onClick={() => setEditingCell({ assetId: asset.id, field })} 
        onContextMenu={(e) => handleContextMenu(e, asset.id, field, value)}
        tabIndex={-1}
        sx={{ cursor: 'pointer', minHeight: 20, '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }, px: 0.5, py: 0.25 }}
      >
        {getDisplayValue()}
      </Box>
    );
  };

  const CheckboxCell = ({ asset, field }) => {
    const [checked, setChecked] = useState(!!asset[field]);

    const handleChange = (e) => {
      const newValue = e.target.checked;
      setChecked(newValue);
      handleCellUpdate(asset.id, field, newValue);
    };

    return (
      <Checkbox 
        checked={checked} 
        onChange={handleChange} 
        size="small"
      />
    );
  };

  const ResponseCell = ({ asset }) => {
    const [value, setValue] = useState(asset.offerResponse || '');

    const handleChange = (e) => {
      const newValue = e.target.value;
      setValue(newValue);
      handleCellUpdate(asset.id, 'offerResponse', newValue);
    };

    const getBackgroundColor = () => {
      if (value === 'accepted') return 'success.main';
      if (value === 'rejected') return 'error.main';
      return 'transparent';
    };

    const getTextColor = () => {
      if (value === 'accepted' || value === 'rejected') return 'white';
      return 'text.secondary';
    };

    return (
      <Box
        component="select"
        value={value}
        onChange={handleChange}
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          border: '1px solid',
          borderColor: value ? 'transparent' : 'divider',
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
          fontWeight: value ? 600 : 400,
          fontSize: 13,
          cursor: 'pointer',
          minWidth: 110,
          '&:hover': {
            opacity: 0.9
          }
        }}
      >
        <option value="">—</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </Box>
    );
  };

  const NotesCell = ({ asset }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(asset.notes || '');

    const handleSave = () => {
      if (value !== asset.notes) {
        handleCellUpdate(asset.id, 'notes', value);
      }
      setIsEditing(false);
    };

    const renderNotesWithLinks = (text) => {
      if (!text) return 'Click to add notes...';
      
      // Match markdown-style links [text](url)
      const parts = [];
      let lastIndex = 0;
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        // Add the link
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#2196f3', textDecoration: 'underline' }}
          >
            {match[1]}
          </a>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : text;
    };

    if (isEditing) {
      return (
        <TextField 
          multiline 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          onBlur={handleSave}
          onContextMenu={(e) => handleContextMenu(e, asset.id, 'notes', value)}
          autoFocus 
          fullWidth 
          variant="outlined" 
          size="small" 
          sx={{ minWidth: 200 }} 
        />
      );
    }

    return (
      <Box 
        onClick={() => setIsEditing(true)} 
        onContextMenu={(e) => handleContextMenu(e, asset.id, 'notes', value)}
        sx={{ cursor: 'pointer', minHeight: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word', '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }, px: 0.5, py: 0.25, maxWidth: 300 }}
      >
        {renderNotesWithLinks(value)}
      </Box>
    );
  };

  const isOffersOut = buyingSubTab === 'offers-out';
  const isOption = buyingSubTab === 'option';
  const isTitle = buyingSubTab === 'title';
  const isClosing = buyingSubTab === 'closing';

  return (
    <>
      <Card sx={{ backgroundColor: 'customColors.cardBackground', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
        <CardContent>
          <Tabs value={buyingSubTab} onChange={(e, v) => setBuyingSubTab(v)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 1, '& .MuiTab-root': { fontWeight: 500, fontSize: 13 }, '& .MuiTabs-indicator': { height: 2 } }}>
            <Tab label="OFFERS OUT" value="offers-out" />
            <Tab label="OPTION" value="option" />
            <Tab label="TITLE" value="title" />
            <Tab label="CLOSING" value="closing" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Zipcode</TableCell>
                  {isOffersOut ? (
                    <>
                      <TableCell>Lot Size</TableCell>
                      <TableCell>Offer Amount</TableCell>
                      <TableCell align="center">Option Period</TableCell>
                      <TableCell>Earnest Money</TableCell>
                      <TableCell>Close Date</TableCell>
                      <TableCell>MLS#</TableCell>
                      <TableCell sx={{ minWidth: 250 }}>Notes</TableCell>
                      <TableCell align="center">Response</TableCell>
                      <TableCell align="center" sx={{ width: 50 }}></TableCell>
                      <TableCell align="center" sx={{ width: 50 }}></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Lot Size</TableCell>
                      <TableCell>Contract Date</TableCell>
                      <TableCell>Contract Price</TableCell>
                      {isOption && <TableCell>Option Amount</TableCell>}
                      {isOption && <TableCell>Option End</TableCell>}
                      <TableCell>Earnest Money</TableCell>
                      <TableCell>Close Date</TableCell>
                      <TableCell>Title Company</TableCell>
                      <TableCell>MLS#</TableCell>
                      <TableCell sx={{ minWidth: 250 }}>Notes</TableCell>
                      {(isOption || isTitle || isClosing) && <TableCell align="center" sx={{ width: 50 }}></TableCell>}
                      <TableCell align="center" sx={{ width: 50 }}></TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsForTab.map(asset => (
                  <TableRow key={asset.id} hover>
                    <TableCell><BuyerCell asset={asset} /></TableCell>
                    <TableCell><EditableCell asset={asset} field="address" /></TableCell>
                    <TableCell><EditableCell asset={asset} field="city" /></TableCell>
                    <TableCell><EditableCell asset={asset} field="state" /></TableCell>
                    <TableCell><EditableCell asset={asset} field="zipcode" /></TableCell>
                    {isOffersOut ? (
                      <>
                        <TableCell><EditableCell asset={asset} field="lotSize" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="contractPrice" type="number" /></TableCell>
                        <TableCell align="center"><CheckboxCell asset={asset} field="hasOptionPeriod" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="earnestMoney" type="number" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="scheduleCloseDate" type="date" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="mlsNumber" /></TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}><NotesCell asset={asset} /></TableCell>
                        <TableCell align="center"><ResponseCell asset={asset} /></TableCell>
                        <TableCell align="center">
                          <Tooltip title="Mark Executed">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleMarkExecuted(asset)}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
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
                      </>
                    ) : (
                      <>
                        <TableCell><EditableCell asset={asset} field="lotSize" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="contractDate" type="date" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="contractPrice" type="number" /></TableCell>
                        {isOption && <TableCell><EditableCell asset={asset} field="optionAmount" type="number" /></TableCell>}
                        {isOption && <TableCell><EditableCell asset={asset} field="optionEndDate" type="date" /></TableCell>}
                        <TableCell><EditableCell asset={asset} field="earnestMoney" type="number" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="scheduleCloseDate" type="date" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="titleCompany" /></TableCell>
                        <TableCell><EditableCell asset={asset} field="mlsNumber" /></TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}><NotesCell asset={asset} /></TableCell>
                        {isOption && (
                          <TableCell align="center">
                            <Tooltip title="Move to Title">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleMoveToTitle(asset)}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                        {isTitle && (
                          <TableCell align="center">
                            <Tooltip title="Move to Closing">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleMoveToClosing(asset)}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                        {isClosing && (
                          <TableCell align="center">
                            <Tooltip title="Move to Available">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleMoveToAvailable(asset)}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
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
                      </>
                    )}
                  </TableRow>
                ))}
            {rowsForTab.length === 0 && (
              <TableRow>
                <TableCell colSpan={isOffersOut ? 15 : (isOption ? 15 : (isTitle ? 14 : (isClosing ? 14 : 13)))} align="center" sx={{ py: 4, color: 'text.secondary' }}>No assets to display.</TableCell>
              </TableRow>
            )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <MenuItem onClick={handleInsertLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Insert link</ListItemText>
        </MenuItem>
        {currentContext && hasLink(currentContext.value) && (
          <MenuItem onClick={handleRemoveLink}>
            <ListItemIcon>
              <LinkOffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove link</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Link Dialog */}
      <Dialog 
        open={linkDialogOpen} 
        onClose={() => setLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Link Text"
            type="text"
            fullWidth
            variant="outlined"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL"
            type="url"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLink} variant="contained" disabled={!linkUrl}>
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyingList;

