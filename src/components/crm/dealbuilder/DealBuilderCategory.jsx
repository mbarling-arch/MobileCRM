import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Add as AddIcon } from '@mui/icons-material';
import { DealBuilderItem } from './DealBuilderItem';

export const DealBuilderCategory = ({
  category,
  categoryTotals,
  onToggleExpansion,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const categoryTotal = categoryTotals.find(cat => cat.id === category.id)?.total || 0;

  return (
    <Accordion
      expanded={category.expanded}
      onChange={() => onToggleExpansion(category.id)}
      sx={{
        backgroundColor: 'customColors.calendarHeaderBackground',
        border: '1px solid',
        borderColor: 'customColors.calendarBorder',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: 0,
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
        sx={{
          backgroundColor: 'customColors.tableRowBackground',
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48,
          },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2,
          }
        }}
      >
        <Typography sx={{ color: 'text.primary', fontWeight: 600, flex: 1 }}>
          {category.name}
        </Typography>
        <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
          ${categoryTotal.toFixed(2)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 60 }}>
          {category.items.length} item{category.items.length !== 1 ? 's' : ''}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.paper' }}>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 200 }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, width: 120 }}>
                  Cost
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, width: 120 }}>
                  Markup
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, width: 120 }}>
                  Price
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 150 }}>
                  Notes
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, width: 80 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {category.items.map((item) => (
                <DealBuilderItem
                  key={item.id}
                  item={item}
                  categoryId={category.id}
                  onUpdate={onUpdateItem}
                  onDelete={onDeleteItem}
                />
              ))}

              {/* Add Item Row */}
              <TableRow sx={{ backgroundColor: 'customColors.tableRowBackground' }}>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 1 }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => onAddItem(category.id)}
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    Add Item to {category.name}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

