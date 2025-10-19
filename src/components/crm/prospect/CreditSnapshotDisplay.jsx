import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import { getScoreColor } from '../../../utils/prospectHelpers';

export const CreditSnapshotDisplay = ({ creditData }) => {
  const show = (v) => v ? (
    <Typography component="span" sx={{ color: 'text.primary', fontSize: 17, fontWeight: 500 }}>
      {v}
    </Typography>
  ) : (
    <Typography component="span" sx={{ color: 'text.disabled', fontSize: 17 }}>—</Typography>
  );

  const buyer = creditData || {};
  const coBuyer = creditData || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        {/* Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Date of Birth
                  </Typography>
                  {show(buyer.buyerDOB)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    DL
                  </Typography>
                  {show(buyer.buyerDL)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    State
                  </Typography>
                  {show(buyer.buyerDLState)}
                </Stack>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    SSN
                  </Typography>
                  {show(buyer.buyerSSN)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Gender
                  </Typography>
                  {show(buyer.buyerGender)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Race
                  </Typography>
                  {show(buyer.buyerRace)}
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Co-Buyer Info Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Info
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Date of Birth
                  </Typography>
                  {show(coBuyer.coBuyerDOB)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    DL
                  </Typography>
                  {show(coBuyer.coBuyerDL)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    State
                  </Typography>
                  {show(coBuyer.coBuyerDLState)}
                </Stack>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    SSN
                  </Typography>
                  {show(coBuyer.coBuyerSSN)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Gender
                  </Typography>
                  {show(coBuyer.coBuyerGender)}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                    Race
                  </Typography>
                  {show(coBuyer.coBuyerRace)}
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Credit Scores Section */}
      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                TransUnion
              </Typography>
              <Typography sx={{ color: getScoreColor(buyer.buyerTransUnion), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerTransUnion || '-'}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Equifax
              </Typography>
              <Typography sx={{ color: getScoreColor(buyer.buyerEquifax), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerEquifax || '-'}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Experian
              </Typography>
              <Typography sx={{ color: getScoreColor(buyer.buyerExperian), fontSize: 20, fontWeight: 700 }}>
                {buyer.buyerExperian || '-'}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Co-Buyer Scores Column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 3, pb: 1.5, borderBottom: '2px solid', borderBottomColor: 'primary.main' }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
              Co-Buyer Scores
            </Typography>
          </Box>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                TransUnion
              </Typography>
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerTransUnion), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerTransUnion || '-'}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Equifax
              </Typography>
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerEquifax), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerEquifax || '-'}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Experian
              </Typography>
              <Typography sx={{ color: getScoreColor(coBuyer.coBuyerExperian), fontSize: 20, fontWeight: 700 }}>
                {coBuyer.coBuyerExperian || '-'}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

