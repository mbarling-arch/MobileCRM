import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service layer for Tasks Firestore operations
 */

/**
 * Add a task to a prospect
 */
export const addTask = async (companyId, prospectId, taskData) => {
  try {
    const tasksRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      prospectId,
      completed: false
    });
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (companyId, prospectId, taskId, updates) => {
  try {
    const taskRef = doc(db, 'companies', companyId, 'prospects', prospectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (companyId, prospectId, taskId) => {
  try {
    const taskRef = doc(db, 'companies', companyId, 'prospects', prospectId, 'tasks', taskId);
    await deleteDoc(taskRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Toggle task completion
 */
export const toggleTaskCompletion = async (companyId, prospectId, taskId, currentStatus) => {
  return updateTask(companyId, prospectId, taskId, { 
    completed: !currentStatus,
    completedAt: !currentStatus ? new Date().toISOString() : null
  });
};

