import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import prospectReducer from './slices/prospectSlice';
import conditionsReducer from './slices/conditionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    prospect: prospectReducer,
    conditions: conditionsReducer
  }
});

export const setupStore = () => store;

