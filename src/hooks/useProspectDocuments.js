import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Document categories
 */
const DOCUMENT_CATEGORIES = [
  'Customer Documents',
  'Credit Application Documents',
  'Income Documents',
  'Home Documents',
  'Property Documents',
  'Closing Documents',
  'Other Documents'
];

/**
 * Allowed file types for upload
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Custom hook for managing prospect documents
 * @param {object} params - Hook parameters
 * @param {string} params.prospectId - Prospect ID
 * @param {string} params.companyId - Company ID
 * @param {boolean} params.isDeal - Whether this is a deal or prospect
 * @param {object} params.userProfile - Current user profile
 * @returns {object} Documents state and handlers
 */
export const useProspectDocuments = ({ prospectId, companyId, isDeal = false, userProfile }) => {
  // State
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Collection name based on deal/prospect
  const collectionName = isDeal ? 'deals' : 'prospects';

  // Load documents
  useEffect(() => {
    if (!companyId || !prospectId) return;
    
    const q = query(
      collection(db, 'companies', companyId, collectionName, prospectId, 'documents'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    });

    return () => unsub();
  }, [companyId, prospectId, collectionName]);

  /**
   * Handle file selection from file input
   * @param {Event} event - File input change event
   */
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`File ${file.name} is not an allowed type.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const newDocs = validFiles.map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default name
      category: 'Other',
      description: ''
    }));

    setUploadingDocs(prev => [...prev, ...newDocs]);
  };

  /**
   * Update a field in an uploading document
   * @param {number} index - Index of document in uploadingDocs array
   * @param {string} field - Field to update
   * @param {any} value - New value
   */
  const updateUploadDoc = (index, field, value) => {
    setUploadingDocs(docs => docs.map((doc, i) => 
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  /**
   * Remove a document from the upload queue
   * @param {number} index - Index of document to remove
   */
  const removeUploadDoc = (index) => {
    setUploadingDocs(docs => docs.filter((_, i) => i !== index));
  };

  /**
   * Upload all documents in the queue
   */
  const handleUploadDocuments = async () => {
    if (uploadingDocs.length === 0) return;

    const invalidDocs = uploadingDocs.filter(doc => !doc.name.trim());
    if (invalidDocs.length > 0) {
      alert('Please provide names for all documents');
      return;
    }

    setUploading(true);
    try {
      for (const doc of uploadingDocs) {
        const fileName = `${Date.now()}_${doc.file.name}`;
        const storageRef = ref(storage, `companies/${companyId}/${collectionName}/${prospectId}/documents/${fileName}`);

        await uploadBytes(storageRef, doc.file);
        const downloadURL = await getDownloadURL(storageRef);

        const docData = {
          name: doc.name,
          category: doc.category,
          description: doc.description,
          url: downloadURL,
          fileName: doc.file.name,
          fileType: doc.file.type,
          fileSize: doc.file.size,
          uploadedBy: userProfile?.email || 'unknown',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'companies', companyId, collectionName, prospectId, 'documents'), docData);
      }

      setUploadingDocs([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents. Please try again.');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a document
   * @param {string} docId - Document ID to delete
   */
  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDoc(doc(db, 'companies', companyId, collectionName, prospectId, 'documents', docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
      throw error;
    }
  };

  /**
   * Download/open a document
   * @param {object} document - Document object with url
   */
  const handleDownloadDocument = (document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      alert('Document URL not available');
    }
  };

  /**
   * Clear the upload queue
   */
  const clearUploadQueue = () => {
    setUploadingDocs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // State
    documents,
    uploadingDocs,
    uploading,
    fileInputRef,
    
    // Constants
    documentCategories: DOCUMENT_CATEGORIES,
    
    // Handlers
    handleFileSelect,
    updateUploadDoc,
    removeUploadDoc,
    handleUploadDocuments,
    handleDeleteDocument,
    handleDownloadDocument,
    clearUploadQueue
  };
};

