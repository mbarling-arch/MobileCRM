import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const initialState = {
  assets: [],
  status: 'idle',
  error: null
};

export const addLandAsset = createAsyncThunk(
  'landAsset/add',
  async ({ companyId, assetData }, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(
        collection(db, 'companies', companyId, 'landAssets'),
        { ...assetData, createdAt: serverTimestamp() }
      );
      return { id: docRef.id, ...assetData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLandAsset = createAsyncThunk(
  'landAsset/update',
  async ({ companyId, assetId, updates }, { rejectWithValue }) => {
    try {
      const assetRef = doc(db, 'companies', companyId, 'landAssets', assetId);
      await updateDoc(assetRef, updates);
      return { assetId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const landAssetSlice = createSlice({
  name: 'landAsset',
  initialState,
  reducers: {
    setAssets: (state, action) => {
      state.assets = action.payload;
    },
    updateAssetInState: (state, action) => {
      const { assetId, updates } = action.payload;
      const index = state.assets.findIndex(a => a.id === assetId);
      if (index !== -1) {
        state.assets[index] = { ...state.assets[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addLandAsset.fulfilled, (state, action) => {
        state.assets.unshift(action.payload);
      })
      .addCase(updateLandAsset.fulfilled, (state, action) => {
        const { assetId, updates } = action.payload;
        const index = state.assets.findIndex(a => a.id === assetId);
        if (index !== -1) {
          state.assets[index] = { ...state.assets[index], ...updates };
        }
      });
  }
});

export const { setAssets, updateAssetInState } = landAssetSlice.actions;

export const selectAllAssets = (state) => state.landAsset.assets;
export const selectAssetsByStatus = (state, statuses) => 
  state.landAsset.assets.filter(a => statuses.includes(a.status));

export default landAssetSlice.reducer;

