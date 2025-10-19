import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, IconButton, Stack, Chip, Drawer } from '@mui/material';
import { Close as CloseIcon, Task as TaskIcon } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import UnifiedLayout from '../UnifiedLayout';
import { useUser } from '../../hooks/useUser';
import { ProspectTopSection } from './prospect/ProspectTopSection';
import { ProspectTabs } from './prospect/ProspectTabs';
import { TabRouter } from './prospect-tabs/TabRouter';
import { useProspect } from '../../hooks/useProspect';
import LeadCallLogDrawer from './LeadCallLogDrawer';
import LeadAppointmentDrawer from './LeadAppointmentDrawer';
import VisitLogDrawer from './VisitLogDrawer';
import EmailDrawer from './EmailDrawer';
import LeadTaskDrawer from './LeadTaskDrawer';
import { defaultHousing } from '../../utils/prospectHelpers';
import { useProspectNotes } from '../../hooks/useProspectNotes';
import { useProspectDocuments } from '../../hooks/useProspectDocuments';
import { useProspectActivities } from '../../hooks/useProspectActivities';
import { useProspectTasks } from '../../hooks/useProspectTasks';
import { useCalculatorData } from '../../hooks/useCalculatorData';
import { CreditSnapshotModal } from './prospect/CreditSnapshotModal';
import { ProspectActions } from './prospect/ProspectActions';
import { ProspectSidebar } from './prospect/ProspectSidebar';
import { NotesDrawer } from './prospect/drawers/NotesDrawer';
import { ActivitiesDrawer } from './prospect/drawers/ActivitiesDrawer';
import { DocumentsDrawer } from './prospect/drawers/DocumentsDrawer';
import { BudgetCalculatorModal } from './prospect/modals/BudgetCalculatorModal';
import { GamePlanModal } from './prospect/modals/GamePlanModal';
import { BuildHomeModal } from './prospect/modals/BuildHomeModal';
import { DepositsModal } from './prospect/modals/DepositsModal';
import { ApplicationModal } from './prospect/modals/ApplicationModal';
import { DealBuilderModal } from './prospect/modals/DealBuilderModal';
import { HousingNeedsModal } from './prospect/modals/HousingNeedsModal';

// Main content component that uses the context
function ProspectPortalContent({ userProfile, prospectId, isDeal }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [homeNeedsModalOpen, setHomeNeedsModalOpen] = useState(false);
  const [housingForm, setHousingForm] = useState(defaultHousing());
  const [savingHousing, setSavingHousing] = useState(false);
  
  // Drawer states
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [activitiesDrawerOpen, setActivitiesDrawerOpen] = useState(false);
  const [documentsDrawerOpen, setDocumentsDrawerOpen] = useState(false);
  
  // Activity action drawers
  const [callDrawerOpen, setCallDrawerOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);
  const [tasksDrawerOpen, setTasksDrawerOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [dealBuilderModalOpen, setDealBuilderModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [creditSnapshotModalOpen, setCreditSnapshotModalOpen] = useState(false);
  const [gamePlanModalOpen, setGamePlanModalOpen] = useState(false);
  const [buildHomeModalOpen, setBuildHomeModalOpen] = useState(false);
  const [depositsModalOpen, setDepositsModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  const prospectContext = useProspect({ prospectId, isDeal });

  const {
    prospect,
    buyerInfo,
    setBuyerInfo,
    coBuyerInfo,
    setCoBuyerInfo,
    saveBuyerInfo,
    saveCoBuyerInfo,
    status,
    error
  } = prospectContext;

  // Notes management hook
  const notesContext = useProspectNotes({
    prospectId,
    companyId: userProfile?.companyId,
    userProfile,
    buyerInfo
  });

  // Documents management hook
  const documentsContext = useProspectDocuments({
    prospectId,
    companyId: userProfile?.companyId,
    isDeal,
    userProfile
  });

  // Activities management hook
  const activitiesContext = useProspectActivities({
    prospectId,
    companyId: userProfile?.companyId
  });

  // Tasks management hook
  const tasksContext = useProspectTasks({
    prospectId,
    companyId: userProfile?.companyId
  });

  // Calculator/Budget management hook
  const calculatorContext = useCalculatorData({
    prospectId,
    companyId: userProfile?.companyId,
    isDeal,
    prospect
  });

  // Initialize housing form when prospect loads
  useEffect(() => {
    if (prospect?.housing) {
      setHousingForm({ ...defaultHousing(), ...prospect.housing });
    }
  }, [prospect?.housing]);

  const handleHousingChange = (key) => (e) => {
    setHousingForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleNestedChange = (group) => (value) => {
    setHousingForm((f) => ({ ...f, [group]: value }));
  };

  const saveHousingData = async () => {
    if (!userProfile?.companyId || !prospectId) return;
    setSavingHousing(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
      await updateDoc(ref, { housing: housingForm });
    } catch (err) {
      console.error('Error saving housing data:', err);
    } finally {
      setSavingHousing(false);
    }
  };

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

  const stages = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'pre-approval', label: 'Pre-Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'closing', label: 'Closing' },
    { id: 'construction', label: 'Construction' },
    { id: 'booked', label: 'BOOKED' }
  ];

  const currentStage = prospect?.stage || 'discovery';

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ pl: 3, pr: 3, pt: 3, pb: 3, width: '100%' }}>
        {/* Stage Progress Bar */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 1, overflow: 'visible', py: 1 }}>
          {stages.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isPast = stages.findIndex(s => s.id === currentStage) > index;
            const clipPathValue = index < stages.length - 1 
              ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)' 
              : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)';
            
            return (
              <Box
                key={stage.id}
                sx={(theme) => ({
                  flex: 1,
                  py: 2,
                  px: 3,
                  position: 'relative',
                  ml: index > 0 ? '-20px' : 0,
                  zIndex: stages.length - index,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9
                  },
                  // Border layer (blue outline)
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.palette.primary.main,
                    clipPath: clipPathValue,
                    zIndex: -2
                  },
                  // Fill layer (creates the outline effect for inactive)
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    right: '3px',
                    bottom: '3px',
                    backgroundColor: (isActive || isPast) ? theme.palette.primary.main : '#F1F5F9',
                    clipPath: clipPathValue,
                    zIndex: -1
                  }
                })}
              >
                <Typography sx={{ 
                  fontWeight: (isActive || isPast) ? 700 : 600, 
                  fontSize: 14, 
                  textAlign: 'center', 
                  whiteSpace: 'nowrap',
                  color: (isActive || isPast) ? 'primary.contrastText' : 'primary.main',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stage.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Main Layout: Left (75%) and Right (25%) */}
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left Column - 75% width */}
          <Box sx={{ flex: '1 1 75%', width: { xs: '100%', lg: '75%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Overview Container */}
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

        {/* Budget Modal */}
        <BudgetCalculatorModal
          open={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          {...calculatorContext}
        />

        {/* Game Plan Modal */}
        <GamePlanModal
          open={gamePlanModalOpen}
          onClose={() => setGamePlanModalOpen(false)}
                prospectId={prospectId}
                userProfile={userProfile}
                isDeal={isDeal}
              />

        {/* Build Home (EMC) Modal */}
        <BuildHomeModal
          open={buildHomeModalOpen}
          onClose={() => setBuildHomeModalOpen(false)}
                companyId={userProfile?.companyId}
                prospectId={prospectId}
                isDeal={isDeal}
              />

        {/* Deposits Modal */}
        <DepositsModal
          open={depositsModalOpen}
          onClose={() => setDepositsModalOpen(false)}
              prospectId={prospectId}
              isDeal={isDeal}
          prospectContext={prospectContext}
            />

        {/* Application Modal */}
        <ApplicationModal
          open={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
              prospectId={prospectId}
              userProfile={userProfile}
          prospectContext={prospectContext}
            />

        {/* Credit Snapshot Modal */}
        <CreditSnapshotModal
          open={creditSnapshotModalOpen}
          onClose={() => setCreditSnapshotModalOpen(false)}
          creditData={prospectContext?.creditData}
          setCreditData={prospectContext?.setCreditData}
          onSave={prospectContext?.saveCreditData}
        />

        {/* Deal Builder Modal */}
        <DealBuilderModal
          open={dealBuilderModalOpen}
          onClose={() => setDealBuilderModalOpen(false)}
                companyId={userProfile?.companyId}
                prospectId={prospectId}
                isDeal={isDeal}
              />

        {/* Home Needs Modal */}
        <HousingNeedsModal
          open={homeNeedsModalOpen}
          onClose={() => setHomeNeedsModalOpen(false)}
          housingForm={housingForm}
          handleHousingChange={handleHousingChange}
          handleNestedChange={handleNestedChange}
          saveHousingData={saveHousingData}
          savingHousing={savingHousing}
        />

        {/* Speed Dial - Quick Actions */}
        <ProspectActions
          onTasksClick={() => setTasksDrawerOpen(true)}
          onNotesClick={() => setNotesDrawerOpen(true)}
          onActivitiesClick={() => setActivitiesDrawerOpen(true)}
          onDocumentsClick={() => setDocumentsDrawerOpen(true)}
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
            {/* Header */}
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
              
              {/* Create Task Button */}
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

            {/* Tasks List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={2}>
                {tasksContext.tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <Box
                      key={task.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: isCompleted ? 'success.lighterOpacity' : 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { backgroundColor: isCompleted ? 'success.lightOpacity' : 'action.selected' }
                      }}
                    >
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {task.title || 'Untitled Task'}
                    </Typography>
                          <Chip
                            size="small"
                            label={task.status || 'pending'}
                            color={isCompleted ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'}
                            sx={{ fontSize: 11, height: 20 }}
                          />
                  </Box>
                        {task.description && (
                          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {task.description}
                          </Typography>
                        )}
                        <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                          Due: {task.dueDate?.toDate?.().toLocaleDateString() || 'No due date'}
                        </Typography>
                      </Stack>
                </Box>
                  );
                })}
                {tasksContext.tasks.length === 0 && (
                  <Typography sx={{ color: 'text.disabled', fontSize: 14, textAlign: 'center', py: 6, fontStyle: 'italic' }}>
                    No tasks yet. Create one above!
                    </Typography>
                )}
              </Stack>
                  </Box>
          </Box>
        </Drawer>

        {/* Activities Drawer */}
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

        {/* Documents Drawer */}
        <DocumentsDrawer
          open={documentsDrawerOpen}
          onClose={() => setDocumentsDrawerOpen(false)}
          {...documentsContext}
          buyerName={`${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim()}
        />

        {/* Notes Drawer */}
        <NotesDrawer
          open={notesDrawerOpen}
          onClose={() => setNotesDrawerOpen(false)}
          {...notesContext}
          buyerName={`${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim()}
        />

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
