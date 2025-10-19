import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Add an activity (call, email, appointment, visit) to a prospect
 */
export const addProspectActivity = createAsyncThunk(
  'activities/addProspectActivity',
  async ({ companyId, prospectId, activityType, activityData }, { rejectWithValue }) => {
    try {
      const collectionMap = {
        call: 'callLogs',
        email: 'emails',
        appointment: 'appointments',
        visit: 'visits'
      };
      
      const collectionName = collectionMap[activityType] || 'activities';
      const activitiesRef = collection(db, 'companies', companyId, 'prospects', prospectId, collectionName);
      
      const docRef = await addDoc(activitiesRef, {
        ...activityData,
        createdAt: serverTimestamp(),
        prospectId
      });
      
      return { id: docRef.id, ...activityData, prospectId, type: activityType };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add activity');
    }
  }
);

/**
 * Delete an activity from a prospect
 */
export const deleteProspectActivity = createAsyncThunk(
  'activities/deleteProspectActivity',
  async ({ companyId, prospectId, activityType, activityId }, { rejectWithValue }) => {
    try {
      const collectionMap = {
        call: 'callLogs',
        email: 'emails',
        appointment: 'appointments',
        visit: 'visits'
      };
      
      const collectionName = collectionMap[activityType] || 'activities';
      await deleteDoc(doc(db, 'companies', companyId, 'prospects', prospectId, collectionName, activityId));
      
      return { prospectId, activityId, activityType };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete activity');
    }
  }
);

const initialState = {
  byProspect: {},
  status: 'idle',
  error: null
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setProspectActivities(state, action) {
      const { prospectId, activities } = action.payload;
      if (!state.byProspect[prospectId]) {
        state.byProspect[prospectId] = {
          calls: [],
          emails: [],
          appointments: [],
          visits: []
        };
      }
      state.byProspect[prospectId] = {
        ...state.byProspect[prospectId],
        ...activities
      };
    },
    setProspectCalls(state, action) {
      const { prospectId, calls } = action.payload;
      if (!state.byProspect[prospectId]) {
        state.byProspect[prospectId] = { calls: [], emails: [], appointments: [], visits: [] };
      }
      state.byProspect[prospectId].calls = calls;
    },
    setProspectEmails(state, action) {
      const { prospectId, emails } = action.payload;
      if (!state.byProspect[prospectId]) {
        state.byProspect[prospectId] = { calls: [], emails: [], appointments: [], visits: [] };
      }
      state.byProspect[prospectId].emails = emails;
    },
    setProspectAppointments(state, action) {
      const { prospectId, appointments } = action.payload;
      if (!state.byProspect[prospectId]) {
        state.byProspect[prospectId] = { calls: [], emails: [], appointments: [], visits: [] };
      }
      state.byProspect[prospectId].appointments = appointments;
    },
    setProspectVisits(state, action) {
      const { prospectId, visits } = action.payload;
      if (!state.byProspect[prospectId]) {
        state.byProspect[prospectId] = { calls: [], emails: [], appointments: [], visits: [] };
      }
      state.byProspect[prospectId].visits = visits;
    },
    clearProspectActivities(state, action) {
      const { prospectId } = action.payload;
      delete state.byProspect[prospectId];
    },
    resetActivitiesState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProspectActivity.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addProspectActivity.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(addProspectActivity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteProspectActivity.fulfilled, (state, action) => {
        state.status = 'succeeded';
      });
  }
});

export const { 
  setProspectActivities,
  setProspectCalls,
  setProspectEmails,
  setProspectAppointments,
  setProspectVisits,
  clearProspectActivities,
  resetActivitiesState 
} = activitiesSlice.actions;

export const selectProspectActivities = (state, prospectId) => 
  state.activities?.byProspect?.[prospectId] || { calls: [], emails: [], appointments: [], visits: [] };

export const selectActivitiesStatus = (state) => state.activities?.status || 'idle';
export const selectActivitiesError = (state) => state.activities?.error || null;

export default activitiesSlice.reducer;

