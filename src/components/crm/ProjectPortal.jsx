import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, CircularProgress, Typography, Stack, Button, Dialog, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Upload as UploadIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UnifiedLayout from '../UnifiedLayout';
import { useUser } from '../../hooks/useUser';
import DealBuilder from './DealBuilder';
import LeadTaskDrawer from './LeadTaskDrawer';
import AddDocumentDialog from './AddDocumentDialog';

function ProjectPortal() {
  const { projectId } = useParams();
  const { userProfile } = useUser();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dealBuilderOpen, setDealBuilderOpen] = useState(false);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [dueDiligenceDocs, setDueDiligenceDocs] = useState([]);
  const [ddUploadDialogOpen, setDdUploadDialogOpen] = useState(false);
  const [selectedDdDocType, setSelectedDdDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef();

  const dueDiligenceDocuments = [
    'Septic Design',
    'Survey/Plat',
    '911 Letter',
    'Prelim Site Plan',
    'Land Size',
    'Google Map',
    'CAD',
    'RR Map',
    'Flood Map',
    'Water Will Serve',
    'Electric Will Serve',
    'HUD',
    'Deed'
  ];

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

  // Load due diligence documents
  useEffect(() => {
    if (!userProfile?.companyId || !projectId) return;

    const docsRef = collection(db, 'companies', userProfile.companyId, 'projects', projectId, 'documents');
    const q = query(docsRef, where('category', '==', 'Due Diligence'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDueDiligenceDocs(docs);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, projectId]);

  const getDueDiligenceDoc = (docType) => {
    return dueDiligenceDocs.find(doc => doc.name === docType);
  };

  const handleDdDocClick = (docType) => {
    const existingDoc = getDueDiligenceDoc(docType);
    if (existingDoc && existingDoc.url) {
      window.open(existingDoc.url, '_blank');
    } else {
      setSelectedDdDocType(docType);
      setDdUploadDialogOpen(true);
    }
  };

  const handleDdFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userProfile?.companyId || !projectId) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${userProfile.companyId}/projects/${projectId}/documents/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const docData = {
        name: selectedDdDocType,
        category: 'Due Diligence',
        url: downloadURL,
        type: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system'
      };

      await addDoc(collection(db, 'companies', userProfile.companyId, 'projects', projectId, 'documents'), docData);
      
      setDdUploadDialogOpen(false);
      setSelectedDdDocType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDdDoc = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDoc(doc(db, 'companies', userProfile.companyId, 'projects', projectId, 'documents', docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'due-diligence', label: 'Land' },
    { id: 'home', label: 'Home' },
    { id: 'phase-1', label: 'Phase 1' },
    { id: 'phase-2', label: 'Phase 2' },
    { id: 'phase-3', label: 'Phase 3' },
    { id: 'documents', label: 'Documents' }
  ];

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
            <Paper
              elevation={6}
              sx={{
                backgroundColor: 'customColors.calendarHeaderBackground',
                border: '1px solid',
                borderColor: 'customColors.calendarBorder',
                borderRadius: 4,
                p: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 20, mb: 2 }}>
                {project.address}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4 }}>
                {/* Left Column */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Lot Number</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{project.lotNumber || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Lot Size</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{project.lotSize ? `${project.lotSize} acres` : '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Land Owner</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{project.landOwner || '—'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Home</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                        {project.homeDetails ? `${project.homeDetails.factory} ${project.homeDetails.model}` : '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Offline Date</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>{project.offlineDate || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>Property Status</Typography>
                      <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                        {project.propertyStatus ? project.propertyStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Right - Quick Actions (25%) */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', lg: 'calc(25% - 16px)' } }}>
            <Paper
              elevation={6}
              sx={{
                backgroundColor: 'customColors.calendarHeaderBackground',
                border: '1px solid',
                borderColor: 'customColors.calendarBorder',
                borderRadius: 4,
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setDealBuilderOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Deal Builder
                </Button>

                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  onClick={() => setTaskDrawerOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Create Task
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => setDocumentDialogOpen(true)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: 'none'
                  }}
                >
                  Upload Document
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Main Content - 75% width like Prospect Portal */}
        <Box sx={{ width: { xs: '100%', lg: '75%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Folder Tabs */}
          <Box sx={{ display: 'flex', gap: 0.5, borderBottom: '2px solid', borderColor: 'divider' }}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              
              return (
                <Box
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    px: 3,
                    py: 1.5,
                    backgroundColor: isActive ? 'background.paper' : 'transparent',
                    borderTop: '2px solid',
                    borderLeft: '2px solid',
                    borderRight: '2px solid',
                    borderColor: isActive ? 'divider' : 'transparent',
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    marginBottom: isActive ? '-2px' : 0,
                    zIndex: isActive ? 2 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: isActive ? 'background.paper' : 'action.hover'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Tab Content */}
          <Box>
          {activeTab === 'overview' && (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Overview content coming soon
            </Typography>
          )}
          {activeTab === 'due-diligence' && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Left Container - 75% */}
              <Paper sx={{ flex: '1 1 75%', p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                <Typography sx={{ color: 'text.disabled', fontSize: 14, fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                  Reserved for future content
                </Typography>
              </Paper>

              {/* Right Container - 25% - Documents */}
              <Paper sx={{ flex: '0 0 25%', p: 2, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                <List sx={{ py: 0 }}>
                  {dueDiligenceDocuments.map((docType) => {
                    const existingDoc = getDueDiligenceDoc(docType);
                    return (
                      <ListItem
                        key={docType}
                        sx={{
                          px: 0,
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box
                          onClick={() => handleDdDocClick(docType)}
                          sx={{
                            flex: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover': {
                              '& .MuiTypography-root': {
                                color: 'primary.main'
                              }
                            }
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 18, color: existingDoc ? 'success.main' : 'text.disabled' }} />
                          <ListItemText
                            primary={docType}
                            primaryTypographyProps={{
                              fontSize: 13,
                              fontWeight: existingDoc ? 600 : 400,
                              color: existingDoc ? 'text.primary' : 'text.secondary',
                              sx: {
                                textDecoration: existingDoc ? 'underline' : 'none',
                                cursor: 'pointer'
                              }
                            }}
                          />
                        </Box>
                        {existingDoc && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDdDoc(existingDoc.id)}
                            sx={{ color: 'error.main', p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Box>
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

        {/* Due Diligence Upload Dialog */}
        <Dialog 
          open={ddUploadDialogOpen} 
          onClose={() => setDdUploadDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Upload {selectedDdDocType}</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
                Select a file to upload for this document
              </Typography>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleDdFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="dd-doc-upload"
              />
              <label htmlFor="dd-doc-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </label>
            </Box>
            
            <Typography sx={{ color: 'text.disabled', fontSize: 12, textAlign: 'center' }}>
              Accepted formats: PDF, Word, Images (JPG, PNG)
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setDdUploadDialogOpen(false)} variant="outlined">
              Cancel
            </Button>
          </Box>
        </Dialog>

        {/* Deal Builder Modal */}
        <Dialog
          open={dealBuilderOpen}
          onClose={() => setDealBuilderOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'customColors.layoutBackground',
              borderRadius: 2,
              minHeight: '85vh',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 24 }}>
                Deal Builder
              </Typography>
              <IconButton onClick={() => setDealBuilderOpen(false)} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <DealBuilder
                companyId={userProfile?.companyId}
                prospectId={projectId}
                isDeal={false}
                initial={null}
              />
            </Box>
          </Box>
        </Dialog>

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


