import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  login as loginThunk,
  logout as logoutThunk,
  signup as signupThunk,
  updatePassword as updatePasswordThunk,
  selectAuthState
} from '../redux-store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);

  const login = useCallback(
    (email, password) => dispatch(loginThunk({ email, password })).unwrap(),
    [dispatch]
  );

  const signup = useCallback(
    (email, password) => dispatch(signupThunk({ email, password })).unwrap(),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutThunk()).unwrap(), [dispatch]);

  const updatePassword = useCallback(
    (newPassword) => dispatch(updatePasswordThunk(newPassword)).unwrap(),
    [dispatch]
  );

  return {
    ...authState,
    login,
    signup,
    logout,
    updatePassword
  };
};














