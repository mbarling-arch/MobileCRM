import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service layer for Notes Firestore operations
 */

/**
 * Add a note to a prospect
 */
export const addNote = async (companyId, prospectId, noteData) => {
  try {
    const notesRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'notes');
    const docRef = await addDoc(notesRef, {
      ...noteData,
      createdAt: serverTimestamp(),
      prospectId
    });
    return { id: docRef.id, ...noteData };
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (companyId, prospectId, noteId) => {
  try {
    const noteRef = doc(db, 'companies', companyId, 'prospects', prospectId, 'notes', noteId);
    await deleteDoc(noteRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

/**
 * Create notification for mentioned user
 */
export const createMentionNotification = async (recipientEmail, message, prospectId, noteText) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      recipientEmail,
      message,
      type: 'mention',
      read: false,
      prospectId,
      createdAt: serverTimestamp(),
      noteText
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

