import React, { createContext, useContext } from 'react';
import { useProspect } from '../hooks/useProspect';
import { useProspectNotes } from '../hooks/useProspectNotes';
import { useProspectDocuments } from '../hooks/useProspectDocuments';
import { useProspectActivities } from '../hooks/useProspectActivities';
import { useProspectTasks } from '../hooks/useProspectTasks';
import { useCalculatorData } from '../hooks/useCalculatorData';

/**
 * Context for sharing prospect data across components
 */
const ProspectContext = createContext(null);

/**
 * Provider component that wraps the prospect portal
 */
export const ProspectProvider = ({ 
  prospectId, 
  isDeal, 
  companyId, 
  userProfile,
  children 
}) => {
  // Main prospect data
  const prospectContext = useProspect({ prospectId, isDeal });
  
  // Notes management
  const notesContext = useProspectNotes({
    prospectId,
    companyId,
    userProfile,
    buyerInfo: prospectContext.buyerInfo
  });
  
  // Documents management
  const documentsContext = useProspectDocuments({
    prospectId,
    companyId,
    isDeal,
    userProfile
  });
  
  // Activities management
  const activitiesContext = useProspectActivities({
    prospectId,
    companyId
  });
  
  // Tasks management
  const tasksContext = useProspectTasks({
    prospectId,
    companyId
  });
  
  // Calculator/Budget management
  const calculatorContext = useCalculatorData({
    prospectId,
    companyId,
    isDeal,
    prospect: prospectContext.prospect
  });

  const value = {
    // Prospect data
    ...prospectContext,
    
    // Notes
    notes: notesContext.notes,
    noteText: notesContext.noteText,
    setNoteText: notesContext.setNoteText,
    handleSendNote: notesContext.handleSendNote,
    handleNoteKeyPress: notesContext.handleNoteKeyPress,
    noteInputRef: notesContext.noteInputRef,
    showMentions: notesContext.showMentions,
    filteredUsers: notesContext.filteredUsers,
    insertMention: notesContext.insertMention,
    getUserDisplayName: notesContext.getUserDisplayName,
    cursorPosition: notesContext.cursorPosition,
    setCursorPosition: notesContext.setCursorPosition,
    
    // Documents
    documents: documentsContext.documents,
    uploadingDocs: documentsContext.uploadingDocs,
    uploading: documentsContext.uploading,
    fileInputRef: documentsContext.fileInputRef,
    documentCategories: documentsContext.documentCategories,
    handleFileSelect: documentsContext.handleFileSelect,
    updateUploadDoc: documentsContext.updateUploadDoc,
    removeUploadDoc: documentsContext.removeUploadDoc,
    handleUploadDocuments: documentsContext.handleUploadDocuments,
    handleDeleteDocument: documentsContext.handleDeleteDocument,
    handleDownloadDocument: documentsContext.handleDownloadDocument,
    
    // Activities
    calls: activitiesContext.calls,
    emails: activitiesContext.emails,
    appointments: activitiesContext.appointments,
    visits: activitiesContext.visits,
    activities: activitiesContext.activities,
    activityCounts: activitiesContext.activityCounts,
    
    // Tasks
    tasks: tasksContext.tasks,
    completedTasks: tasksContext.completedTasks,
    pendingTasks: tasksContext.pendingTasks,
    taskCounts: tasksContext.taskCounts,
    
    // Calculator
    calculatorData: calculatorContext.calculatorData,
    setCalculatorField: calculatorContext.setCalculatorField,
    applicantMonthly: calculatorContext.applicantMonthly,
    coappMonthly: calculatorContext.coappMonthly,
    grossMonthlyIncome: calculatorContext.grossMonthlyIncome,
    buyerDebtTotal: calculatorContext.buyerDebtTotal,
    coBuyerDebtTotal: calculatorContext.coBuyerDebtTotal,
    saveCalculatorData: calculatorContext.saveCalculatorData,
    savingCalculator: calculatorContext.savingCalculator
  };

  return (
    <ProspectContext.Provider value={value}>
      {children}
    </ProspectContext.Provider>
  );
};

/**
 * Hook to use prospect context
 */
export const useProspectContext = () => {
  const context = useContext(ProspectContext);
  if (!context) {
    throw new Error('useProspectContext must be used within ProspectProvider');
  }
  return context;
};

