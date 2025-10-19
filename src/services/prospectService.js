import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service layer for Prospect/Deal Firestore operations
 */

/**
 * Update prospect data
 */
export const updateProspectData = async (companyId, prospectId, data) => {
  try {
    const prospectRef = doc(db, 'companies', companyId, 'prospects', prospectId);
    await updateDoc(prospectRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating prospect:', error);
    throw error;
  }
};

/**
 * Get prospect data
 */
export const getProspectData = async (companyId, prospectId) => {
  try {
    const prospectRef = doc(db, 'companies', companyId, 'prospects', prospectId);
    const snapshot = await getDoc(prospectRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error('Error getting prospect:', error);
    throw error;
  }
};

/**
 * Update buyer information
 */
export const updateBuyerInfo = async (companyId, prospectId, buyerInfo) => {
  return updateProspectData(companyId, prospectId, { buyerInfo });
};

/**
 * Update co-buyer information
 */
export const updateCoBuyerInfo = async (companyId, prospectId, coBuyerInfo) => {
  return updateProspectData(companyId, prospectId, { coBuyerInfo });
};

/**
 * Update financing data
 */
export const updateFinancingData = async (companyId, prospectId, financing) => {
  return updateProspectData(companyId, prospectId, { financing });
};

/**
 * Update credit snapshot
 */
export const updateCreditSnapshot = async (companyId, prospectId, creditSnapshot) => {
  return updateProspectData(companyId, prospectId, { creditSnapshot });
};

/**
 * Update housing data
 */
export const updateHousingData = async (companyId, prospectId, housing) => {
  return updateProspectData(companyId, prospectId, { housing });
};

/**
 * Update calculator data
 */
export const updateCalculatorData = async (companyId, prospectId, calculator) => {
  return updateProspectData(companyId, prospectId, { calculator });
};

