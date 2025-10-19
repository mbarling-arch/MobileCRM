import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service layer for Activities Firestore operations
 */

const ACTIVITY_COLLECTIONS = {
  call: 'callLogs',
  email: 'emails',
  appointment: 'appointments',
  visit: 'visits'
};

/**
 * Add an activity (call, email, appointment, visit)
 */
export const addActivity = async (companyId, prospectId, activityType, activityData) => {
  try {
    const collectionName = ACTIVITY_COLLECTIONS[activityType] || 'activities';
    const activitiesRef = collection(db, 'companies', companyId, 'prospects', prospectId, collectionName);
    
    const docRef = await addDoc(activitiesRef, {
      ...activityData,
      createdAt: serverTimestamp(),
      prospectId
    });
    
    return { id: docRef.id, ...activityData, type: activityType };
  } catch (error) {
    console.error(`Error adding ${activityType}:`, error);
    throw error;
  }
};

/**
 * Delete an activity
 */
export const deleteActivity = async (companyId, prospectId, activityType, activityId) => {
  try {
    const collectionName = ACTIVITY_COLLECTIONS[activityType] || 'activities';
    const activityRef = doc(db, 'companies', companyId, 'prospects', prospectId, collectionName, activityId);
    await deleteDoc(activityRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${activityType}:`, error);
    throw error;
  }
};

/**
 * Convenience methods for specific activity types
 */
export const addCall = (companyId, prospectId, callData) => 
  addActivity(companyId, prospectId, 'call', callData);

export const addEmail = (companyId, prospectId, emailData) => 
  addActivity(companyId, prospectId, 'email', emailData);

export const addAppointment = (companyId, prospectId, appointmentData) => 
  addActivity(companyId, prospectId, 'appointment', appointmentData);

export const addVisit = (companyId, prospectId, visitData) => 
  addActivity(companyId, prospectId, 'visit', visitData);

