import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Lazy load all tab components
const ActivityTab = lazy(() => import('./ActivityTab'));
const HousingNeedsTab = lazy(() => import('./HousingNeedsTab'));
const HomeLandInfoTab = lazy(() => import('./HomeLandInfoTab'));
const FinancingTab = lazy(() => import('./FinancingTab'));
const DealBuilderTab = lazy(() => import('./DealBuilderTab'));
const ProjectTab = lazy(() => import('./ProjectTab'));
const FormsTab = lazy(() => import('./FormsTab'));
const CalculatorTab = lazy(() => import('./CalculatorTab'));
const DocumentsTab = lazy(() => import('./DocumentsTab'));
const HomeSelectionTab = lazy(() => import('./HomeSelectionTab'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <CircularProgress />
    <Typography sx={{ ml: 2 }}>Loading...</Typography>
  </Box>
);

export const TabRouter = ({ activeTab, prospectId, userProfile, isDeal = false, prospectContext }) => {
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>Overview is displayed in the top container</Typography>
          </Box>
        );
      case 'activity':
        return <ActivityTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'task':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>Task content coming soon</Typography>
          </Box>
        );
      case 'documents':
        return <DocumentsTab prospectId={prospectId} userProfile={userProfile} isDeal={isDeal} context={prospectContext} />;
      case 'forms':
        return <FormsTab prospectId={prospectId} userProfile={userProfile} isDeal={isDeal} context={prospectContext} />;
      case 'buyer-information':
      case 'contact-info':
      case 'housing-needs':
      case 'home-placement':
      case 'lender-info':
        return <HousingNeedsTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'home-land-info':
        return <HomeLandInfoTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'financing':
        return <FinancingTab prospectId={prospectId} userProfile={userProfile} isDeal={isDeal} context={prospectContext} />;
      case 'deal-builder':
        return <DealBuilderTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'project':
        return <ProjectTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'calculator':
        return <CalculatorTab prospectId={prospectId} userProfile={userProfile} context={prospectContext} />;
      case 'home-selection':
        return <HomeSelectionTab prospectId={prospectId} userProfile={userProfile} isDeal={isDeal} context={prospectContext} />;
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6">Tab not found</Typography>
          </Box>
        );
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderTab()}
    </Suspense>
  );
};
