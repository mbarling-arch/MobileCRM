import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import UnifiedLayout from '../UnifiedLayout';
import { useUser } from '../../hooks/useUser';
import { ProspectTopSection } from './prospect/ProspectTopSection';
import { ProspectTabs } from './prospect/ProspectTabs';
import { TabRouter } from './prospect-tabs/TabRouter';
import { useProspect } from '../../hooks/useProspect';

// Main content component that uses the context
function ProspectPortalContent({ userProfile, prospectId, isDeal }) {
  const [activeTab, setActiveTab] = useState('activity');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingCoBuyer, setIsEditingCoBuyer] = useState(false);
  const [saving, setSaving] = useState(false);

  const prospectContext = useProspect({ prospectId, isDeal });

  const {
    prospect,
    buyerInfo,
    setBuyerInfo,
    coBuyerInfo,
    setCoBuyerInfo,
    saveBuyerInfo,
    saveCoBuyerInfo,
    convertToDeal,
    status,
    error
  } = prospectContext;

  if (status === 'loading' || status === 'idle' || !prospect) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography color="error">Failed to load prospect: {error}</Typography>
        </Box>
      </UnifiedLayout>
    );
  }

  const handleBuyerInfoSave = async () => {
    setSaving(true);
    try {
      await saveBuyerInfo();
      setIsEditingHeader(false);
    } catch (error) {
      console.error('Error saving buyer info:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCoBuyerInfoSave = async () => {
    setSaving(true);
    try {
      await saveCoBuyerInfo();
      setIsEditingCoBuyer(false);
    } catch (error) {
      console.error('Error saving co-buyer info:', error);
    } finally {
      setSaving(false);
    }
  };


  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ pl: 3, pr: 3, pt: 3, pb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left Column - All content */}
          <Box sx={{ flex: '1 1 73%', width: { xs: '100%', lg: '73%' } }}>
            <ProspectTopSection 
              buyerInfo={buyerInfo}
              coBuyerInfo={coBuyerInfo}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <Box sx={{ minHeight: 400, mt: 2.5 }}>
              <TabRouter
                activeTab={activeTab}
                prospectId={prospectId}
                userProfile={userProfile}
                isDeal={isDeal}
                prospectContext={prospectContext}
              />
            </Box>
          </Box>

          {/* Right Column - Sticky Navigation */}
          <Box sx={{ flex: '1 1 27%', width: { xs: '100%', lg: '27%' } }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <ProspectTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </Box>
          </Box>
        </Box>
      </Box>
    </UnifiedLayout>
  );
}

// Main component with context provider
function ProspectPortal() {
  const params = useParams();
  const { userProfile } = useUser();

  // Handle both prospect and deal routes
  const prospectId = params.prospectId || params.dealId;
  const isDeal = !!params.dealId;


  // Don't render until userProfile is available
  if (!userProfile) {
  return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
                  </Box>
      </UnifiedLayout>
    );
  }

  return (
    <ProspectPortalContent userProfile={userProfile} prospectId={prospectId} isDeal={isDeal} />
  );
}

export default ProspectPortal;
