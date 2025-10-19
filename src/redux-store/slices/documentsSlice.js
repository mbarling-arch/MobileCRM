import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

/**
 * Upload and add a document to a prospect
 */
export const uploadProspectDocument = createAsyncThunk(
  'documents/uploadProspectDocument',
  async ({ companyId, prospectId, isDeal, file, documentData, userProfile }, { rejectWithValue }) => {
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `companies/${companyId}/${collectionName}/${prospectId}/documents/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const docData = {
        ...documentData,
        url: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: userProfile?.email || 'unknown',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(
        collection(db, 'companies', companyId, collectionName, prospectId, 'documents'), 
        docData
      );
      
      return { id: docRef.id, ...docData, prospectId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload document');
    }
  }
);

/**
 * Delete a document from a prospect
 */
export const deleteProspectDocument = createAsyncThunk(
  'documents/deleteProspectDocument',
  async ({ companyId, prospectId, isDeal, documentId }, { rejectWithValue }) => {
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      await deleteDoc(doc(db, 'companies', companyId, collectionName, prospectId, 'documents', documentId));
      return { prospectId, documentId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete document');
    }
  }
);

const initialState = {
  byProspect: {},
  uploadProgress: {},
  status: 'idle',
  error: null
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setProspectDocuments(state, action) {
      const { prospectId, documents } = action.payload;
      state.byProspect[prospectId] = documents;
    },
    clearProspectDocuments(state, action) {
      const { prospectId } = action.payload;
      delete state.byProspect[prospectId];
    },
    setUploadProgress(state, action) {
      const { prospectId, progress } = action.payload;
      state.uploadProgress[prospectId] = progress;
    },
    resetDocumentsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProspectDocument.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadProspectDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(uploadProspectDocument.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteProspectDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
      });
  }
});

export const { 
  setProspectDocuments, 
  clearProspectDocuments, 
  setUploadProgress, 
  resetDocumentsState 
} = documentsSlice.actions;

export const selectProspectDocuments = (state, prospectId) => 
  state.documents?.byProspect?.[prospectId] || [];

export const selectDocumentsStatus = (state) => state.documents?.status || 'idle';
export const selectDocumentsError = (state) => state.documents?.error || null;
export const selectUploadProgress = (state, prospectId) => 
  state.documents?.uploadProgress?.[prospectId] || 0;

export default documentsSlice.reducer;

