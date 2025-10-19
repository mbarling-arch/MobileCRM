import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Service layer for Documents Firestore/Storage operations
 */

/**
 * Upload a document file to Firebase Storage
 */
export const uploadDocumentFile = async (companyId, collectionName, prospectId, file) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `companies/${companyId}/${collectionName}/${prospectId}/documents/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, fileName };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Add document metadata to Firestore
 */
export const addDocument = async (companyId, collectionName, prospectId, documentData) => {
  try {
    const documentsRef = collection(db, 'companies', companyId, collectionName, prospectId, 'documents');
    const docRef = await addDoc(documentsRef, {
      ...documentData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...documentData };
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

/**
 * Upload file and add document in one operation
 */
export const uploadAndAddDocument = async (companyId, collectionName, prospectId, file, metadata, userEmail) => {
  try {
    const { url, fileName } = await uploadDocumentFile(companyId, collectionName, prospectId, file);
    
    const documentData = {
      ...metadata,
      url,
      fileName,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: userEmail,
      createdAt: serverTimestamp()
    };
    
    return await addDocument(companyId, collectionName, prospectId, documentData);
  } catch (error) {
    console.error('Error uploading and adding document:', error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (companyId, collectionName, prospectId, documentId) => {
  try {
    const docRef = doc(db, 'companies', companyId, collectionName, prospectId, 'documents', documentId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

