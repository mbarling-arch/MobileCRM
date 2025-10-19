import React, { useState } from 'react';
import { Box } from '@mui/material';
import UnifiedLayout from '../../UnifiedLayout';
import { ProspectTopSection } from './ProspectTopSection';
import { ProspectTabs } from './ProspectTabs';
import { TabRouter } from '../prospect-tabs/TabRouter';
import { ProspectSidebar } from './ProspectSidebar';
import { ProspectActions } from './ProspectActions';
import { NotesDrawer } from './drawers/NotesDrawer';
import { ActivitiesDrawer } from './drawers/ActivitiesDrawer';
import { DocumentsDrawer } from './drawers/DocumentsDrawer';
import { BudgetCalculatorModal } from './modals/BudgetCalculatorModal';
import { GamePlanModal } from './modals/GamePlanModal';
import { BuildHomeModal } from './modals/BuildHomeModal';
import { DepositsModal } from './modals/DepositsModal';
import { ApplicationModal } from './modals/ApplicationModal';
import { DealBuilderModal } from './modals/DealBuilderModal';
import { HousingNeedsModal } from './modals/HousingNeedsModal';
import { CreditSnapshotModal } from './CreditSnapshotModal';
import LeadCallLogDrawer from '../LeadCallLogDrawer';
import LeadAppointmentDrawer from '../LeadAppointmentDrawer';
import VisitLogDrawer from '../VisitLogDrawer';
import EmailDrawer from '../EmailDrawer';
import LeadTaskDrawer from '../LeadTaskDrawer';
import { Drawer, IconButton, Typography, Button, Stack } from '@mui/material';
import { Close as CloseIcon, Task as TaskIcon } from '@mui/icons-material';

/**
 * Main layout component for Prospect Portal
 * Handles all UI state and renders modals/drawers
 */
export const ProspectLayout = ({
  prospectId,
  isDeal,
  userProfile,
  prospectContext,
  notesContext,
  documentsContext,
  activitiesContext,
  tasksContext,
  calculatorContext,
  housingForm,
  handleHousingChange,
  handleNestedChange,
  saveHousingData,
  savingHousing
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [homeNeedsModalOpen, setHomeNeedsModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [creditSnapshotModalOpen, setCreditSnapshotModalOpen] = useState(false);
  const [gamePlanModalOpen, setGamePlanModalOpen] = useState(false);
  const [buildHomeModalOpen, setBuildHomeModalOpen] = useState(false);
  const [depositsModalOpen, setDepositsModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [dealBuilderModalOpen, setDealBuilderModalOpen] = useState(false);
  
  // Drawer states
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [activitiesDrawerOpen, setActivitiesDrawerOpen] = useState(false);
  const [documentsDrawerOpen, setDocumentsDrawerOpen] = useState(false);
  const [tasksDrawerOpen, setTasksDrawerOpen] = useState(false);
  
  // Activity action drawers
  const [callDrawerOpen, setCallDrawerOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const { buyerInfo, coBuyerInfo, setBuyerInfo, setCoBuyerInfo, saveBuyerInfo, saveCoBuyerInfo } = prospectContext;

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ maxWidth: 1800, mx: 'auto', p: 2 }}>
        {/* Main Layout: Left (75%) and Right (25%) */}
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left Column - 75% width */}
          <Box sx={{ flex: '1 1 75%', width: { xs: '100%', lg: '75%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Buyer/Co-Buyer Section */}
            <ProspectTopSection 
              buyerInfo={buyerInfo}
              coBuyerInfo={coBuyerInfo}
              setBuyerInfo={setBuyerInfo}
              setCoBuyerInfo={setCoBuyerInfo}
              saveBuyerInfo={saveBuyerInfo}
              saveCoBuyerInfo={saveCoBuyerInfo}
            />

            {/* Navigation Tabs */}
            <ProspectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <Box sx={{ minHeight: 400 }}>
              <TabRouter
                activeTab={activeTab}
                prospectId={prospectId}
                userProfile={userProfile}
                isDeal={isDeal}
                prospectContext={prospectContext}
              />
            </Box>
          </Box>

          {/* Right Column - Sidebar */}
          <ProspectSidebar
            onBudgetClick={() => setBudgetModalOpen(true)}
            onCreditSnapshotClick={() => setCreditSnapshotModalOpen(true)}
            onGamePlanClick={() => setGamePlanModalOpen(true)}
            onBuildHomeClick={() => setBuildHomeModalOpen(true)}
            onDepositsClick={() => setDepositsModalOpen(true)}
            onApplicationClick={() => setApplicationModalOpen(true)}
            onDealBuilderClick={() => setDealBuilderModalOpen(true)}
          />
        </Box>

        {/* Modals */}
        <BudgetCalculatorModal
          open={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          {...calculatorContext}
        />

        <GamePlanModal
          open={gamePlanModalOpen}
          onClose={() => setGamePlanModalOpen(false)}
          prospectId={prospectId}
          userProfile={userProfile}
          isDeal={isDeal}
        />

        <BuildHomeModal
          open={buildHomeModalOpen}
          onClose={() => setBuildHomeModalOpen(false)}
          companyId={userProfile?.companyId}
          prospectId={prospectId}
          isDeal={isDeal}
        />

        <DepositsModal
          open={depositsModalOpen}
          onClose={() => setDepositsModalOpen(false)}
          prospectId={prospectId}
          isDeal={isDeal}
          prospectContext={prospectContext}
        />

        <ApplicationModal
          open={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
          prospectId={prospectId}
          userProfile={userProfile}
          prospectContext={prospectContext}
        />

        <CreditSnapshotModal
          open={creditSnapshotModalOpen}
          onClose={() => setCreditSnapshotModalOpen(false)}
          creditData={prospectContext?.creditData}
          setCreditData={prospectContext?.setCreditData}
          onSave={prospectContext?.saveCreditData}
        />

        <DealBuilderModal
          open={dealBuilderModalOpen}
          onClose={() => setDealBuilderModalOpen(false)}
          companyId={userProfile?.companyId}
          prospectId={prospectId}
          isDeal={isDeal}
        />

        <HousingNeedsModal
          open={homeNeedsModalOpen}
          onClose={() => setHomeNeedsModalOpen(false)}
          housingForm={housingForm}
          handleHousingChange={handleHousingChange}
          handleNestedChange={handleNestedChange}
          saveHousingData={saveHousingData}
          savingHousing={savingHousing}
        />

        {/* Drawers */}
        <ActivitiesDrawer
          open={activitiesDrawerOpen}
          onClose={() => setActivitiesDrawerOpen(false)}
          activities={activitiesContext.activities}
          buyerName={`${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim()}
          getUserDisplayName={notesContext.getUserDisplayName}
          onCallClick={() => setCallDrawerOpen(true)}
          onEmailClick={() => setEmailDrawerOpen(true)}
          onAppointmentClick={() => setAppointmentDrawerOpen(true)}
          onVisitClick={() => setVisitDrawerOpen(true)}
        />

        <DocumentsDrawer
          open={documentsDrawerOpen}
          onClose={() => setDocumentsDrawerOpen(false)}
          {...documentsContext}
          buyerName={`${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim()}
        />

        <NotesDrawer
          open={notesDrawerOpen}
          onClose={() => setNotesDrawerOpen(false)}
          {...notesContext}
          buyerName={`${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim()}
        />

        {/* Tasks Drawer */}
        <Drawer
          anchor="right"
          open={tasksDrawerOpen}
          onClose={() => setTasksDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 450 },
              backgroundColor: 'background.paper'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Tasks</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                    {buyerInfo?.firstName} {buyerInfo?.lastName}
                  </Typography>
                </Box>
                <IconButton onClick={() => setTasksDrawerOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<TaskIcon />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Create Task
              </Button>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={1.5}>
                {tasksContext.tasks.map((task) => (
                  <Box key={task.id} sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{task.title || 'Task'}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{task.description}</Typography>
                  </Box>
                ))}
                {tasksContext.tasks.length === 0 && (
                  <Typography sx={{ color: 'text.disabled', textAlign: 'center', py: 4 }}>
                    No tasks yet
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Drawer>

        {/* Activity Action Drawers */}
        <LeadCallLogDrawer
          open={callDrawerOpen}
          onClose={() => setCallDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <EmailDrawer
          open={emailDrawerOpen}
          onClose={() => setEmailDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <LeadAppointmentDrawer
          open={appointmentDrawerOpen}
          onClose={() => setAppointmentDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <VisitLogDrawer
          open={visitDrawerOpen}
          onClose={() => setVisitDrawerOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />
        <LeadTaskDrawer
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          leadId={prospectId}
          companyId={userProfile?.companyId}
          docType="prospects"
        />

        {/* Speed Dial */}
        <ProspectActions
          onTasksClick={() => setTasksDrawerOpen(true)}
          onNotesClick={() => setNotesDrawerOpen(true)}
          onActivitiesClick={() => setActivitiesDrawerOpen(true)}
          onDocumentsClick={() => setDocumentsDrawerOpen(true)}
        />
      </Box>
    </UnifiedLayout>
  );
};

