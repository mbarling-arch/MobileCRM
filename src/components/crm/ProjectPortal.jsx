import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import UnifiedLayout from '../UnifiedLayout';
import { useUser } from '../../hooks/useUser';
import { ProjectHeader } from './project/ProjectHeader';
import { ProjectTabs } from './project/ProjectTabs';
import { ProjectSidebar } from './project/ProjectSidebar';
import { DueDiligencePanel } from './project/DueDiligencePanel';
import { DueDiligenceUploadModal } from './project/modals/DueDiligenceUploadModal';
import { ProjectDealBuilderModal } from './project/modals/ProjectDealBuilderModal';
import { useProjectDocuments } from '../../hooks/useProjectDocuments';
import LeadTaskDrawer from './LeadTaskDrawer';
import AddDocumentDialog from './AddDocumentDialog';

function ProjectPortal() {
  const { projectId } = useParams();
  const { userProfile } = useUser();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal/Drawer states
  const [dealBuilderOpen, setDealBuilderOpen] = useState(false);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [ddUploadDialogOpen, setDdUploadDialogOpen] = useState(false);
  const [selectedDdDocType, setSelectedDdDocType] = useState('');

  // Documents management hook
  const {
    dueDiligenceDocs,
    uploading,
    fileInputRef,
    getDueDiligenceDoc,
    uploadDueDiligenceDoc,
    deleteDueDiligenceDoc,
    handleDocumentClick
  } = useProjectDocuments({
    projectId,
    companyId: userProfile?.companyId,
    userProfile
  });

  // Load project data
  useEffect(() => {
    if (!userProfile?.companyId || !projectId) return;

    const projectRef = doc(db, 'companies', userProfile.companyId, 'projects', projectId);
    const unsubscribe = onSnapshot(projectRef, (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, projectId]);

  const handleDdDocClick = (docType) => {
    handleDocumentClick(docType, (type) => {
      setSelectedDdDocType(type);
      setDdUploadDialogOpen(true);
    });
  };

  const handleDdFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await uploadDueDiligenceDoc(file, selectedDdDocType);
      setDdUploadDialogOpen(false);
      setSelectedDdDocType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Failed to upload document');
    }
  };

  if (loading || !project) {
    return (
      <UnifiedLayout mode="crm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ pl: 3, pr: 3, pt: 3, pb: 3, width: '100%' }}>
        {/* Top Row: Project Info + Quick Actions */}
        <Box sx={{ display: 'flex', gap: 4, mb: 2.5, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left - Project Info Container (75%) */}
          <Box sx={{ flex: '1 1 75%', width: { xs: '100%', lg: '75%' } }}>
            <ProjectHeader project={project} />
          </Box>

          {/* Right - Quick Actions Sidebar (25%) */}
          <ProjectSidebar
            onDealBuilderClick={() => setDealBuilderOpen(true)}
            onCreateTaskClick={() => setTaskDrawerOpen(true)}
            onUploadDocumentClick={() => setDocumentDialogOpen(true)}
          />
        </Box>

        {/* Main Content - 75% width */}
        <Box sx={{ width: { xs: '100%', lg: '75%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Navigation Tabs */}
          <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <Box>
            {activeTab === 'overview' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Overview content coming soon
              </Typography>
            )}
            {activeTab === 'due-diligence' && (
              <DueDiligencePanel
                dueDiligenceDocs={dueDiligenceDocs}
                getDueDiligenceDoc={getDueDiligenceDoc}
                onDocumentClick={handleDdDocClick}
                onDeleteDocument={deleteDueDiligenceDoc}
              />
            )}
            {activeTab === 'home' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Home content coming soon
              </Typography>
            )}
            {activeTab === 'phase-1' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Phase 1 content coming soon
              </Typography>
            )}
            {activeTab === 'phase-2' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Phase 2 content coming soon
              </Typography>
            )}
            {activeTab === 'phase-3' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Phase 3 content coming soon
              </Typography>
            )}
            {activeTab === 'documents' && (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Documents content coming soon
              </Typography>
            )}
          </Box>
        </Box>

        {/* Modals */}
        <DueDiligenceUploadModal
          open={ddUploadDialogOpen}
          onClose={() => setDdUploadDialogOpen(false)}
          documentType={selectedDdDocType}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onFileSelect={handleDdFileUpload}
        />

        <ProjectDealBuilderModal
          open={dealBuilderOpen}
          onClose={() => setDealBuilderOpen(false)}
          companyId={userProfile?.companyId}
          projectId={projectId}
        />

        {/* Task Drawer */}
        <LeadTaskDrawer
          open={taskDrawerOpen}
          onClose={() => setTaskDrawerOpen(false)}
          leadId={projectId}
          companyId={userProfile?.companyId}
          docType="projects"
        />

        {/* Document Upload Dialog */}
        <AddDocumentDialog
          open={documentDialogOpen}
          onClose={() => setDocumentDialogOpen(false)}
          companyId={userProfile?.companyId}
          docId={projectId}
          docType="projects"
        />
      </Box>
    </UnifiedLayout>
  );
}

export default ProjectPortal;


