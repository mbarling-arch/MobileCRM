import React from 'react';
import { Box, Typography } from '@mui/material';

function DataTable({ title, columns, rows, actions, dense = true, variant = 'embedded', square = false }) {
  const activeRows = rows || [];
  const spacing = dense ? 6 : 12;
  const cellPad = dense ? 10 : 16;
  const headerFs = dense ? 14 : 16; // header larger
  const rowFs = dense ? 12 : 14;    // body slightly smaller
  const rowRadius = dense ? 8 : 12;
  const isEmbedded = variant === 'embedded';

  return (
    <Box sx={{ backgroundColor: '#27233e', borderRadius: square ? 0 : 16, boxShadow: '0 10px 24px rgba(0,0,0,0.40)', p: dense ? 1.5 : 2, border: '1px solid rgba(255,255,255,0.06)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        {title && <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>{title}</Typography>}
        <Box>{actions}</Box>
      </Box>
      {/* No tabs in this generic table version */}
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: isEmbedded ? '0 0' : `0 ${spacing}px` }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.12)' }}>
              {columns.map((col) => (
                <th key={col.key} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'none', fontSize: headerFs, textAlign: 'left', padding: `${cellPad}px ${cellPad + 4}px` }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, idx) => (
              <tr key={row.id || idx} style={{
                background: isEmbedded ? 'transparent' : '#2e2a48',
                color: '#fff',
                boxShadow: isEmbedded ? 'none' : '0 4px 12px rgba(0,0,0,0.35)',
                border: isEmbedded ? 'none' : '1px solid rgba(255,255,255,0.06)'
              }}>
                {columns.map((col, i) => (
                  <td key={col.key} style={{
                    padding: `${cellPad}px`,
                    fontSize: rowFs,
                    borderTopLeftRadius: !isEmbedded && i === 0 ? rowRadius : 0,
                    borderBottomLeftRadius: !isEmbedded && i === 0 ? rowRadius : 0,
                    borderTopRightRadius: !isEmbedded && i === columns.length - 1 ? rowRadius : 0,
                    borderBottomRightRadius: !isEmbedded && i === columns.length - 1 ? rowRadius : 0,
                    borderBottom: isEmbedded && idx < activeRows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

export default DataTable;


