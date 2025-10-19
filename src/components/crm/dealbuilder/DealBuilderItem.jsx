import React, { memo, useCallback } from 'react';
import { TableRow, TableCell, TextField, Tooltip, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export const DealBuilderItem = memo(({ item, categoryId, onUpdate, onDelete }) => {
  const handleFieldChange = useCallback((field, value) => {
    onUpdate(categoryId, item.id, field, value);
  }, [categoryId, item.id, onUpdate]);

  return (
    <TableRow key={item.id}>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          value={item.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Enter description"
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
              color: 'text.primary'
            }
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          size="small"
          value={item.cost}
          onChange={(e) => handleFieldChange('cost', e.target.value)}
          placeholder="$0.00"
          sx={{
            width: 100,
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
              color: 'text.primary'
            },
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none'
            }
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          size="small"
          value={item.markup}
          onChange={(e) => handleFieldChange('markup', e.target.value)}
          placeholder="$0.00"
          sx={{
            width: 100,
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
              color: 'text.primary'
            },
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none'
            }
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}
          onChange={(e) => handleFieldChange('price', e.target.value)}
          placeholder="Auto-calculated or enter formula (e.g., =SUM)"
          sx={{
            width: 120,
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
              color: 'text.primary'
            }
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          value={item.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Additional notes"
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'background.paper',
              color: 'text.primary'
            }
          }}
        />
      </TableCell>
      <TableCell>
        <Tooltip title="Delete Item">
          <IconButton
            onClick={() => onDelete(categoryId, item.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});



