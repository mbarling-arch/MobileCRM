import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import prospectReducer from './slices/prospectSlice';
import conditionsReducer from './slices/conditionsSlice';
import landAssetReducer from './slices/landAssetSlice';
import notesReducer from './slices/notesSlice';
import documentsReducer from './slices/documentsSlice';
import activitiesReducer from './slices/activitiesSlice';
import tasksReducer from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    prospect: prospectReducer,
    conditions: conditionsReducer,
    landAsset: landAssetReducer,
    notes: notesReducer,
    documents: documentsReducer,
    activities: activitiesReducer,
    tasks: tasksReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['landAsset.assets'],
        // Ignore these action types
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        // Ignore these field paths in all actions
        ignoredActions: ['landAsset/setAssets', 'landAsset/update/fulfilled']
      }
    })
});

export const setupStore = () => store;

