import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button as MuiButton,
  Tabs,
  Tab,
  Divider,
  TextField
} from '@mui/material';
import UnifiedLayout from '../UnifiedLayout';
import ActivityLog from './ActivityLog';

function Clients() {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingCoBuyer, setIsEditingCoBuyer] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('home-info');

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        {/* Buyer Information */}
        <Paper elevation={6} sx={{ backgroundColor: '#2a2746', px: { xs: 1.5, sm: 3 }, py: 2, mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Buyer Information</Typography>
            {isEditingHeader ? (
              <Stack direction="row" spacing={1.5}>
                <MuiButton onClick={() => setIsEditingHeader(false)} size="small" variant="contained" color="success">Save</MuiButton>
                <MuiButton onClick={() => setIsEditingHeader(false)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Cancel</MuiButton>
              </Stack>
            ) : (
              <MuiButton onClick={() => setIsEditingHeader(true)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Edit</MuiButton>
            )}
          </Stack>
          {isEditingHeader ? (
            <Box className="grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField placeholder="First Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Middle Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Last Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Phone Number" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Email Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Street Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="City" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="State" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Zip" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField select SelectProps={{ native: true }} size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }}>
                <option value="">Select Source</option>
                <option value="E-Lead">E-Lead</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Website">Website</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </TextField>
            </Box>
          ) : (
            <Box sx={{ color: 'rgba(255,255,255,0.85)' }}>Name, Phone, Email, Address</Box>
          )}
        </Paper>

        {/* Co-Buyer Information */}
        <Paper elevation={6} sx={{ backgroundColor: '#2a2746', px: { xs: 1.5, sm: 3 }, py: 2, mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Co-Buyer Information</Typography>
            {isEditingCoBuyer ? (
              <Stack direction="row" spacing={1.5}>
                <MuiButton onClick={() => setIsEditingCoBuyer(false)} size="small" variant="contained" color="success">Save</MuiButton>
                <MuiButton onClick={() => setIsEditingCoBuyer(false)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Cancel</MuiButton>
              </Stack>
            ) : (
              <MuiButton onClick={() => setIsEditingCoBuyer(true)} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' } }}>Edit</MuiButton>
            )}
          </Stack>
          {isEditingCoBuyer ? (
            <Box className="grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField placeholder="Co-Buyer First Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Middle Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Last Name" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Phone" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Email" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Street Address" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer City" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer State" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
              <TextField placeholder="Co-Buyer Zip" size="small" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }} />
            </Box>
          ) : (
            <Box sx={{ color: 'rgba(255,255,255,0.85)' }}>Not specified</Box>
          )}
        </Paper>

        {/* Primary Tabs */}
        <Paper sx={{ backgroundColor: '#2a2746', mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }} elevation={6}>
          <Box sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Tabs
              value={["activity","preferences","calculator","credit-snapshot","emc","deposit","application","documents"].indexOf(activeTab)}
              onChange={(_, idx) => setActiveTab(["activity","preferences","calculator","credit-snapshot","emc","deposit","application","documents"][idx])}
              textColor="secondary"
              indicatorColor="secondary"
              variant="fullWidth"
              centered
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 500, minHeight: 48 }, '& .Mui-selected': { color: '#90caf9' } }}
            >
              <Tab label="Activity" />
              <Tab label="Housing Needs" />
              <Tab label="Calculator" />
              <Tab label="Credit Snapshot" />
              <Tab label="EMC" />
              <Tab label="Deposit" />
              <Tab label="Application" />
              <Tab label="Documents" />
            </Tabs>
          </Box>
        </Paper>

        {/* Secondary Tabs */}
        <Paper sx={{ backgroundColor: '#2a2746', mb: 2.5, border: '1px solid rgba(255,255,255,0.08)' }} elevation={6}>
          <Box sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Tabs
              value={["home-info","financing","insurance","closing","project","funding","service"].indexOf(activeSecondaryTab)}
              onChange={(_, idx) => setActiveSecondaryTab(["home-info","financing","insurance","closing","project","funding","service"][idx])}
              textColor="secondary"
              indicatorColor="secondary"
              variant="fullWidth"
              centered
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 500, minHeight: 48 }, '& .Mui-selected': { color: '#90caf9' } }}
            >
              <Tab label="Home Info" />
              <Tab label="Financing" />
              <Tab label="Insurance" />
              <Tab label="Closing" />
              <Tab label="Project" />
              <Tab label="Funding" />
              <Tab label="Service" />
            </Tabs>
          </Box>
        </Paper>

        {/* Placeholder content area */}
        <Paper sx={{ backgroundColor: '#2a2746', p: 3, border: '1px solid rgba(255,255,255,0.08)' }} elevation={6}>
          <ActivityLog companyId={''} docType="clients" docId={''} />
        </Paper>
      </Box>
    </UnifiedLayout>
  );
}

export default Clients;


