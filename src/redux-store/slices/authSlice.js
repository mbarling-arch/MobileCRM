import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { auth, db } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ROLES } from './userSlice';

const serializeFirebaseUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified
  };
};

let authUnsubscribe = null;

export const startAuthListener = () => (dispatch, getState) => {
  if (authUnsubscribe) {
    return authUnsubscribe;
  }

  dispatch(setAuthLoading());
  dispatch(setListenerActive(true));

  authUnsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      dispatch(authStateChanged(serializeFirebaseUser(user)));
    },
    (error) => {
      dispatch(authListenerError(error.message));
    }
  );

  return authUnsubscribe;
};

export const stopAuthListener = () => () => {
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return serializeFirebaseUser(credential.user);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      // Auto-create default company, location, and super user profile
      const companyId = doc(collection(db, 'companies')).id;
      const locationId = doc(collection(db, 'locations')).id;
      
      // Create default company
      await setDoc(doc(db, 'companies', companyId), {
        name: 'My Company',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'active'
      });
      
      // Create default location
      await setDoc(doc(db, 'companies', companyId, 'locations', locationId), {
        name: 'Main Office',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'active'
      });
      
      const userData = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        name: user.displayName || email.split('@')[0],
        role: ROLES.ADMIN,
        companyId: companyId,
        locationId: locationId,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      // Create super user profile with admin role in location path
      await setDoc(doc(db, 'companies', companyId, 'locations', locationId, 'users', user.uid), userData);
      
      // Also create in top-level users collection
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return serializeFirebaseUser(user);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await signOut(auth);
    return null;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentUser: null,
  status: 'idle',
  error: null,
  listenerActive: false,
  authActionStatus: 'idle',
  authActionError: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setListenerActive(state, action) {
      state.listenerActive = action.payload;
    },
    authStateChanged(state, action) {
      state.currentUser = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    authListenerError(state, action) {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetAuthState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.authActionStatus = 'loading';
        state.authActionError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.authActionStatus = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.authActionStatus = 'failed';
        state.authActionError = action.payload || action.error.message;
      })
      .addCase(signup.pending, (state) => {
        state.authActionStatus = 'loading';
        state.authActionError = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.authActionStatus = 'succeeded';
      })
      .addCase(signup.rejected, (state, action) => {
        state.authActionStatus = 'failed';
        state.authActionError = action.payload || action.error.message;
      })
      .addCase(logout.pending, (state) => {
        state.authActionStatus = 'loading';
        state.authActionError = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.authActionStatus = 'succeeded';
      })
      .addCase(logout.rejected, (state, action) => {
        state.authActionStatus = 'failed';
        state.authActionError = action.payload || action.error.message;
      })
      .addCase(updatePassword.pending, (state) => {
        state.authActionStatus = 'loading';
        state.authActionError = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.authActionStatus = 'succeeded';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.authActionStatus = 'failed';
        state.authActionError = action.payload || action.error.message;
      });
  }
});

export const {
  setAuthLoading,
  setListenerActive,
  authStateChanged,
  authListenerError,
  resetAuthState
} = authSlice.actions;

export const selectAuthState = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;

