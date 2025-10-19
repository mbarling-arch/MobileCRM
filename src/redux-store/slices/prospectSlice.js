import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { sanitizeFirestoreData } from '../../utils/firestore';
import { selectUserProfile } from './userSlice';

const prospectAdapter = createEntityAdapter();

const buildCollectionPath = (companyId, isDeal) => (isDeal ? 'deals' : 'prospects');

export const loadProspect = createAsyncThunk(
  'prospect/loadProspect',
  async ({ prospectId, isDeal = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userProfile = selectUserProfile(state);

      if (!userProfile?.companyId || !prospectId) {
        return null;
      }

      // Always use prospects collection
      const documentRef = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
      const snapshot = await getDoc(documentRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = sanitizeFirestoreData(snapshot.data());

      return {
        id: snapshot.id,
        ...data,
        isDeal,
        buyerInfo: data.buyerInfo || {
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: data.email || '',
          streetAddress: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || ''
        },
        coBuyerInfo: data.coBuyerInfo || null,
        financing: data.financing || {},
        creditSnapshot: data.creditSnapshot || null
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load prospect');
    }
  }
);

export const saveBuyerInfo = createAsyncThunk(
  'prospect/saveBuyerInfo',
  async ({ prospectId, buyerInfo, isDeal = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userProfile = selectUserProfile(state);

      if (!userProfile?.companyId || !prospectId) {
        throw new Error('Missing company or prospect ID');
      }

      // Always use prospects collection
      const ref = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
      await updateDoc(ref, { buyerInfo });

      return { prospectId, buyerInfo, isDeal };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save buyer info');
    }
  }
);

export const saveCoBuyerInfo = createAsyncThunk(
  'prospect/saveCoBuyerInfo',
  async ({ prospectId, coBuyerInfo, isDeal = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userProfile = selectUserProfile(state);

      if (!userProfile?.companyId || !prospectId) {
        throw new Error('Missing company or prospect ID');
      }

      // Always use prospects collection
      const ref = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
      await updateDoc(ref, { coBuyerInfo });

      return { prospectId, coBuyerInfo, isDeal };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save co-buyer info');
    }
  }
);

export const saveFinancingData = createAsyncThunk(
  'prospect/saveFinancingData',
  async ({ prospectId, financing, isDeal = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userProfile = selectUserProfile(state);

      if (!userProfile?.companyId || !prospectId) {
        throw new Error('Missing company or prospect ID');
      }

      // Always use prospects collection
      const ref = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
      await updateDoc(ref, {
        financing: {
          ...financing,
          updatedAt: serverTimestamp()
        }
      });

      return { prospectId, financing, isDeal };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save financing data');
    }
  }
);

export const saveCreditSnapshot = createAsyncThunk(
  'prospect/saveCreditSnapshot',
  async ({ prospectId, creditSnapshot, isDeal = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userProfile = selectUserProfile(state);

      if (!userProfile?.companyId || !prospectId) {
        throw new Error('Missing company or prospect ID');
      }

      // Always use prospects collection
      const ref = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
      await updateDoc(ref, {
        creditSnapshot,
        updatedAt: serverTimestamp()
      });

      return { prospectId, creditSnapshot, isDeal };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save credit snapshot');
    }
  }
);

// Conversion is no longer needed - stage field determines if prospect shows in Deals list

const initialState = prospectAdapter.getInitialState({
  status: 'idle',
  error: null,
  deposits: {},
  depositsStatus: {},
  depositsError: {}
});

const prospectSlice = createSlice({
  name: 'prospect',
  initialState,
  reducers: {
    updateProspect: (state, action) => {
      prospectAdapter.upsertOne(state, action.payload);
    },
    resetProspectState: () => initialState,
    setBuyerInfo(state, action) {
      const { prospectId, buyerInfo } = action.payload;
      prospectAdapter.updateOne(state, {
        id: prospectId,
        changes: {
          buyerInfo
        }
      });
    },
    setCoBuyerInfo(state, action) {
      const { prospectId, coBuyerInfo } = action.payload;
      prospectAdapter.updateOne(state, {
        id: prospectId,
        changes: {
          coBuyerInfo
        }
      });
    },
    setFinancing(state, action) {
      const { prospectId, financing } = action.payload;
      prospectAdapter.updateOne(state, {
        id: prospectId,
        changes: {
          financing
        }
      });
    },
    setCreditSnapshot(state, action) {
      const { prospectId, creditSnapshot } = action.payload;
      prospectAdapter.updateOne(state, {
        id: prospectId,
        changes: {
          creditSnapshot
        }
      });
    },
    setDeposits(state, action) {
      const { prospectId, deposits } = action.payload;
      state.deposits[prospectId] = deposits;
    },
    setDepositsStatus(state, action) {
      const { prospectId, status } = action.payload;
      state.depositsStatus[prospectId] = status;
    },
    setDepositsError(state, action) {
      const { prospectId, error } = action.payload;
      state.depositsError[prospectId] = error;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProspect.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadProspect.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
      prospectAdapter.upsertOne(state, action.payload);
        }
      })
      .addCase(loadProspect.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(saveBuyerInfo.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { prospectId, buyerInfo } = action.payload;
        prospectAdapter.updateOne(state, {
          id: prospectId,
          changes: { buyerInfo }
        });
      })
      .addCase(saveCoBuyerInfo.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { prospectId, coBuyerInfo } = action.payload;
        prospectAdapter.updateOne(state, {
          id: prospectId,
          changes: { coBuyerInfo }
        });
      })
      .addCase(saveFinancingData.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { prospectId, financing } = action.payload;
        prospectAdapter.updateOne(state, {
          id: prospectId,
          changes: { financing }
        });
      })
      .addCase(saveCreditSnapshot.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { prospectId, creditSnapshot } = action.payload;
        prospectAdapter.updateOne(state, {
          id: prospectId,
          changes: { creditSnapshot }
        });
      })
  }
});

export const prospectSelectors = prospectAdapter.getSelectors((state) => state.prospect);

export const selectProspectById = (state, prospectId) => {
  return prospectSelectors.selectById(state, prospectId);
};

export const selectProspectStatus = (state) => state.prospect.status;
export const selectProspectError = (state) => state.prospect.error;

export const selectDepositsByProspect = (state, prospectId) => state.prospect.deposits[prospectId] || [];
export const selectDepositsStatus = (state, prospectId) => state.prospect.depositsStatus[prospectId] || 'idle';
export const selectDepositsError = (state, prospectId) => state.prospect.depositsError[prospectId] || null;

export const {
  updateProspect,
  resetProspectState,
  setBuyerInfo,
  setCoBuyerInfo,
  setFinancing,
  setCreditSnapshot,
  setDeposits,
  setDepositsStatus,
  setDepositsError
} = prospectSlice.actions;

export default prospectSlice.reducer;

