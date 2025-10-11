import { useState } from 'react';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

export const useFinancingData = (userProfile, prospectId, isDeal = false) => {
  const [financingData, setFinancingData] = useState({
    applicationDate: '',
    decisionDate: '',
    approvalDate: '',
    applicationStatus: '',
    preApprovalDate: '',
    preApprovalAmount: '',
    preApprovalRate: '',
    preApprovalTerms: '',
    incomeApprovalDate: '',
    finalLoanAmount: '',
    finalRate: '',
    finalTerms: '',
    finalPayment: '',
    finalTaxes: '',
    finalInsurance: '',
    finalDownPayment: ''
  });

  const saveFinancingData = async (conditions = [], clearedConditions = []) => {
    if (!userProfile?.companyId || !prospectId) return;
    const collectionName = isDeal ? 'deals' : 'prospects';
    const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
    await updateDoc(ref, {
      financing: {
        ...financingData,
        conditions,
        clearedConditions,
        updatedAt: serverTimestamp()
      }
    });
    return true;
  };

  return {
    financingData,
    setFinancingData,
    saveFinancingData
  };
};
