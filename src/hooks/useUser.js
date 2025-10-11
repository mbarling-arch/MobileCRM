import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  loadUserProfile,
  selectUserProfile,
  selectUserPermissions,
  selectAccessibleCompanies,
  selectAccessibleLocations,
  selectUserStatus,
  ROLE_PERMISSIONS,
  ROLES
} from '../redux-store/slices/userSlice';
import { selectCurrentUser } from '../redux-store/slices/authSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userProfile = useAppSelector(selectUserProfile);
  const userPermissions = useAppSelector(selectUserPermissions);
  const accessibleCompanies = useAppSelector(selectAccessibleCompanies);
  const accessibleLocations = useAppSelector(selectAccessibleLocations);
  const status = useAppSelector(selectUserStatus);

  useEffect(() => {
    dispatch(loadUserProfile());
  }, [dispatch, currentUser]);

  const loading = status === 'loading' || status === 'idle';

  const hasPermission = useMemo(
    () => (permission) => Boolean(userPermissions?.[permission]),
    [userPermissions]
  );

  const canAccessCompany = useMemo(
    () => (companyId) => accessibleCompanies.some((company) => company.id === companyId),
    [accessibleCompanies]
  );

  const canAccessLocation = useMemo(
    () => (locationId) => accessibleLocations.some((location) => location.id === locationId),
    [accessibleLocations]
  );

  return {
    userProfile,
    userPermissions,
    accessibleCompanies,
    accessibleLocations,
    loading,
    hasPermission,
    canAccessCompany,
    canAccessLocation,
    getFilteredQuery: (baseQuery) => baseQuery,
    ROLES,
    ROLE_PERMISSIONS
  };
};

