import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Custom hook for managing project documents, especially Due Diligence
 */
export const useProjectDocuments = ({ projectId, companyId, userProfile }) => {
  const [dueDiligenceDocs, setDueDiligenceDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Load due diligence documents
  useEffect(() => {
    if (!companyId || !projectId) return;

    const docsRef = collection(db, 'companies', companyId, 'projects', projectId, 'documents');
    const q = query(docsRef, where('category', '==', 'Due Diligence'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDueDiligenceDocs(docs);
    });

    return () => unsubscribe();
  }, [companyId, projectId]);

  /**
   * Get a specific due diligence document by type
   */
  const getDueDiligenceDoc = (docType) => {
    return dueDiligenceDocs.find(doc => doc.name === docType);
  };

  /**
   * Upload a due diligence document
   */
  const uploadDueDiligenceDoc = async (file, docType) => {
    if (!file || !companyId || !projectId) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${companyId}/projects/${projectId}/documents/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const docData = {
        name: docType,
        category: 'Due Diligence',
        url: downloadURL,
        type: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system'
      };

      await addDoc(collection(db, 'companies', companyId, 'projects', projectId, 'documents'), docData);
      
      return { success: true };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a due diligence document
   */
  const deleteDueDiligenceDoc = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'projects', projectId, 'documents', docId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  /**
   * Open a document (or prompt upload if doesn't exist)
   */
  const handleDocumentClick = (docType, onUploadPrompt) => {
    const existingDoc = getDueDiligenceDoc(docType);
    if (existingDoc && existingDoc.url) {
      window.open(existingDoc.url, '_blank');
    } else if (onUploadPrompt) {
      onUploadPrompt(docType);
    }
  };

  return {
    dueDiligenceDocs,
    uploading,
    fileInputRef,
    getDueDiligenceDoc,
    uploadDueDiligenceDoc,
    deleteDueDiligenceDoc,
    handleDocumentClick
  };
};

