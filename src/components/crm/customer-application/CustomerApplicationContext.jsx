import React, { createContext, useContext, useState } from 'react';

const CustomerApplicationContext = createContext();

export const useCustomerApplication = () => {
  const context = useContext(CustomerApplicationContext);
  if (!context) {
    throw new Error('useCustomerApplication must be used within a CustomerApplicationProvider');
  }
  return context;
};

export const CustomerApplicationProvider = ({ children, initialData = {} }) => {
  const [applicationData, setApplicationData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (updates) => {
    setApplicationData(prev => ({ ...prev, ...updates }));
  };

  const handleFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateField(field, value);
  };

  const value = {
    applicationData,
    saving,
    currentStep,
    setSaving,
    setCurrentStep,
    updateField,
    updateFields,
    handleFieldChange,
    setApplicationData
  };

  return (
    <CustomerApplicationContext.Provider value={value}>
      {children}
    </CustomerApplicationContext.Provider>
  );
};

