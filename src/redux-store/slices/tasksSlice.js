import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Add a task to a prospect
 */
export const addProspectTask = createAsyncThunk(
  'tasks/addProspectTask',
  async ({ companyId, prospectId, taskData }, { rejectWithValue }) => {
    try {
      const tasksRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'tasks');
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        createdAt: serverTimestamp(),
        prospectId,
        completed: false
      });
      
      return { id: docRef.id, ...taskData, prospectId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add task');
    }
  }
);

/**
 * Update a task (e.g., mark as completed)
 */
export const updateProspectTask = createAsyncThunk(
  'tasks/updateProspectTask',
  async ({ companyId, prospectId, taskId, updates }, { rejectWithValue }) => {
    try {
      const taskRef = doc(db, 'companies', companyId, 'prospects', prospectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { prospectId, taskId, updates };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  }
);

/**
 * Delete a task from a prospect
 */
export const deleteProspectTask = createAsyncThunk(
  'tasks/deleteProspectTask',
  async ({ companyId, prospectId, taskId }, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'prospects', prospectId, 'tasks', taskId));
      return { prospectId, taskId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  }
);

const initialState = {
  byProspect: {},
  status: 'idle',
  error: null
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setProspectTasks(state, action) {
      const { prospectId, tasks } = action.payload;
      state.byProspect[prospectId] = tasks;
    },
    clearProspectTasks(state, action) {
      const { prospectId } = action.payload;
      delete state.byProspect[prospectId];
    },
    resetTasksState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProspectTask.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addProspectTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(addProspectTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateProspectTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(deleteProspectTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
      });
  }
});

export const { setProspectTasks, clearProspectTasks, resetTasksState } = tasksSlice.actions;

export const selectProspectTasks = (state, prospectId) => 
  state.tasks?.byProspect?.[prospectId] || [];

export const selectTasksStatus = (state) => state.tasks?.status || 'idle';
export const selectTasksError = (state) => state.tasks?.error || null;

export default tasksSlice.reducer;

