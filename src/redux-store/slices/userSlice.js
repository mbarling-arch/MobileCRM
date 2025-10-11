import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { sanitizeFirestoreData } from '../../utils/firestore';
import { selectCurrentUser } from './authSlice';

export const ROLES = {
  ADMIN: 'admin',
  LEADERSHIP: 'leadership',
  GENERAL_MANAGER: 'general_manager',
  SALES: 'sales',
  OPERATIONS: 'operations'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageCompanies: true,
    canManageLocations: true,
    canViewAllCompanies: true,
    canViewAllLocations: true,
    canViewAllData: true,
    level: 5
  },
  [ROLES.LEADERSHIP]: {
    canManageUsers: true,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: true,
    canViewAllLocations: true,
    canViewAllData: true,
    level: 4
  },
  [ROLES.GENERAL_MANAGER]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: true,
    canViewAllData: true,
    level: 3
  },
  [ROLES.SALES]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: false,
    canViewAllData: false,
    level: 2
  },
  [ROLES.OPERATIONS]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: false,
    canViewAllData: false,
    level: 1
  }
};

const createDefaultProfile = (user) => ({
  email: user?.email,
  role: ROLES.ADMIN,
  firebaseUser: user,
  companyId: null,
  locationId: null
});

const serializeUser = (userProfile, userCompany, userLocation, firebaseUser) => ({
  ...sanitizeFirestoreData(userProfile),
  companyId: userCompany?.id || null,
  locationId: userLocation?.id || null,
  company: userCompany ? sanitizeFirestoreData(userCompany) : null,
  location: userLocation ? sanitizeFirestoreData(userLocation) : null,
  firebaseUser: firebaseUser || null
});

export const loadUserProfile = createAsyncThunk(
  'user/loadUserProfile',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const currentUser = selectCurrentUser(state);

    if (!currentUser) {
      return {
        profile: null,
        permissions: null,
        accessibleCompanies: [],
        accessibleLocations: []
      };
    }

    try {
      const companiesSnapshot = await getDocs(collection(db, 'companies'));

      let userData = null;
      let userCompany = null;
      let userLocation = null;

      for (const companyDoc of companiesSnapshot.docs) {
        const companyData = { id: companyDoc.id, ...companyDoc.data() };
        const locationsSnapshot = await getDocs(collection(db, 'companies', companyDoc.id, 'locations'));

        for (const locationDoc of locationsSnapshot.docs) {
          const locationData = { id: locationDoc.id, ...locationDoc.data() };
          const usersSnapshot = await getDocs(collection(db, 'companies', companyDoc.id, 'locations', locationDoc.id, 'users'));
          const userDoc = usersSnapshot.docs.find((d) => d.data().email === currentUser.email);

          if (userDoc) {
            userData = { id: userDoc.id, ...userDoc.data() };
            userCompany = companyData;
            userLocation = locationData;
            break;
          }
        }

        if (userData) {
          break;
        }
      }

      if (userData) {
        const sanitizedUserData = sanitizeFirestoreData(userData);
        const sanitizedCompany = userCompany ? sanitizeFirestoreData(userCompany) : null;
        const sanitizedLocation = userLocation ? sanitizeFirestoreData(userLocation) : null;

        const profile = serializeUser(sanitizedUserData, sanitizedCompany, sanitizedLocation, currentUser);
        const permissions = ROLE_PERMISSIONS[userData.role] || ROLE_PERMISSIONS[ROLES.SALES];

        const accessibleCompanies = permissions.canViewAllCompanies
          ? companiesSnapshot.docs.map((doc) => sanitizeFirestoreData({ id: doc.id, ...doc.data() }))
          : sanitizedCompany
            ? [sanitizedCompany]
            : [];

        let accessibleLocations = [];

        if (permissions.canViewAllLocations) {
          const targetCompanies = permissions.canViewAllCompanies ? companiesSnapshot.docs : [userCompany];
          for (const company of targetCompanies) {
            const locationsSnapshot = await getDocs(collection(db, 'companies', company.id, 'locations'));
            locationsSnapshot.docs.forEach((doc) => {
              accessibleLocations.push(
                sanitizeFirestoreData({
                  id: doc.id,
                  companyId: company.id,
                  ...doc.data()
                })
              );
            });
          }
        } else if (userLocation) {
          accessibleLocations = [
            sanitizeFirestoreData({
              id: userLocation.id,
              companyId: userCompany.id,
              ...userLocation
            })
          ];
        }

        return {
          profile,
          permissions,
          accessibleCompanies: accessibleCompanies.filter(Boolean),
          accessibleLocations: accessibleLocations.filter(Boolean)
        };
      }

      return {
        profile: createDefaultProfile(currentUser),
        permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
        accessibleCompanies: [],
        accessibleLocations: []
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  userProfile: null,
  userPermissions: null,
  accessibleCompanies: [],
  accessibleLocations: [],
  status: 'idle',
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload.profile;
        state.userPermissions = action.payload.permissions;
        state.accessibleCompanies = action.payload.accessibleCompanies;
        state.accessibleLocations = action.payload.accessibleLocations;
        state.status = 'succeeded';
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.userProfile = null;
        state.userPermissions = null;
        state.accessibleCompanies = [];
        state.accessibleLocations = [];
        state.status = 'failed';
      });
  }
});

export const { clearUserState } = userSlice.actions;

export const selectUserState = (state) => state.user;
export const selectUserProfile = (state) => state.user.userProfile;
export const selectUserPermissions = (state) => state.user.userPermissions;
export const selectAccessibleCompanies = (state) => state.user.accessibleCompanies;
export const selectAccessibleLocations = (state) => state.user.accessibleLocations;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

export const hasPermissionSelector = (permission) => (state) => !!state.user.userPermissions?.[permission];
export const canAccessCompanySelector = (companyId) => (state) =>
  state.user.accessibleCompanies.some((company) => company.id === companyId);
export const canAccessLocationSelector = (locationId) => (state) =>
  state.user.accessibleLocations.some((location) => location.id === locationId);

export default userSlice.reducer;

