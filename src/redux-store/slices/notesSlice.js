import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Add a note to a prospect
 */
export const addProspectNote = createAsyncThunk(
  'notes/addProspectNote',
  async ({ companyId, prospectId, noteData, userProfile }, { rejectWithValue }) => {
    try {
      const notesRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'notes');
      const docRef = await addDoc(notesRef, {
        ...noteData,
        createdAt: serverTimestamp(),
        prospectId
      });
      
      return { id: docRef.id, ...noteData, prospectId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add note');
    }
  }
);

/**
 * Delete a note from a prospect
 */
export const deleteProspectNote = createAsyncThunk(
  'notes/deleteProspectNote',
  async ({ companyId, prospectId, noteId }, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'prospects', prospectId, 'notes', noteId));
      return { prospectId, noteId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete note');
    }
  }
);

const initialState = {
  byProspect: {},
  status: 'idle',
  error: null
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setProspectNotes(state, action) {
      const { prospectId, notes } = action.payload;
      state.byProspect[prospectId] = notes;
    },
    clearProspectNotes(state, action) {
      const { prospectId } = action.payload;
      delete state.byProspect[prospectId];
    },
    resetNotesState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProspectNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addProspectNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(addProspectNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteProspectNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
      });
  }
});

export const { setProspectNotes, clearProspectNotes, resetNotesState } = notesSlice.actions;

export const selectProspectNotes = (state, prospectId) => 
  state.notes?.byProspect?.[prospectId] || [];

export const selectNotesStatus = (state) => state.notes?.status || 'idle';
export const selectNotesError = (state) => state.notes?.error || null;

export default notesSlice.reducer;

