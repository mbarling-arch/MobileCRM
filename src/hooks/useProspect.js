import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  loadProspect,
  saveBuyerInfo,
  saveCoBuyerInfo,
  saveFinancingData,
  saveCreditSnapshot,
  convertProspectToDeal,
  selectProspectById,
  selectProspectStatus,
  selectProspectError,
  selectDepositsByProspect,
  selectDepositsStatus,
  selectDepositsError,
  setBuyerInfo,
  setCoBuyerInfo,
  setFinancing,
  setCreditSnapshot,
  setDeposits,
  setDepositsStatus,
  setDepositsError
} from '../redux-store/slices/prospectSlice';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useUser } from './useUser';
import {
  addCondition as addConditionAction,
  removeCondition as removeConditionAction,
  clearCondition as clearConditionAction,
  removeClearedCondition as removeClearedConditionAction,
  setConditions as setConditionsAction,
  setClearedConditions as setClearedConditionsAction,
  selectConditionsState
} from '../redux-store/slices/conditionsSlice';

export const useProspect = ({ prospectId, isDeal = false }) => {
  const dispatch = useAppDispatch();
  const { userProfile } = useUser();

  const prospect = useAppSelector((state) => selectProspectById(state, prospectId));
  const status = useAppSelector(selectProspectStatus);
  const error = useAppSelector(selectProspectError);
  const deposits = useAppSelector((state) => selectDepositsByProspect(state, prospectId));
  const depositsStatus = useAppSelector((state) => selectDepositsStatus(state, prospectId));
  const depositsError = useAppSelector((state) => selectDepositsError(state, prospectId));
  const { conditions, clearedConditions } = useAppSelector((state) =>
    selectConditionsState(state, prospectId)
  );

  useEffect(() => {
    if (!prospectId || !userProfile?.companyId) {
      return;
    }

    dispatch(loadProspect({ prospectId, isDeal }));
  }, [dispatch, prospectId, isDeal, userProfile?.companyId]);

  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) {
      return;
    }

    const collectionName = isDeal ? 'deals' : 'prospects';
    const depositRef = collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'deposits');
    const depositQuery = query(depositRef, orderBy('createdAt', 'desc'));

    dispatch(setDepositsStatus({ prospectId, status: 'loading' }));

    const unsubscribe = onSnapshot(
      depositQuery,
      (snapshot) => {
        const depositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        dispatch(setDeposits({ prospectId, deposits: depositData }));
        dispatch(setDepositsStatus({ prospectId, status: 'succeeded' }));
      },
      (listenerError) => {
        dispatch(setDepositsStatus({ prospectId, status: 'failed' }));
        dispatch(setDepositsError({ prospectId, error: listenerError.message }));
      }
    );

    return () => unsubscribe();
  }, [dispatch, prospectId, isDeal, userProfile?.companyId]);

  const buyerInfo = prospect?.buyerInfo || {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  };

  const coBuyerInfo = prospect?.coBuyerInfo || {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  };

  const financingData = prospect?.financing || {};
  const creditData = prospect?.creditSnapshot || {};

  const prospectValue = useMemo(
    () => ({
      prospect,
      buyerInfo,
      coBuyerInfo,
      financingData,
      creditData,
      deposits,
      conditions,
      clearedConditions,
      status,
      error,
      depositsStatus,
      depositsError,
      setBuyerInfo: (info) => dispatch(setBuyerInfo({ prospectId, buyerInfo: info })),
      setCoBuyerInfo: (info) => dispatch(setCoBuyerInfo({ prospectId, coBuyerInfo: info })),
      setFinancingData: (data) => dispatch(setFinancing({ prospectId, financing: data })),
      setCreditData: (data) => dispatch(setCreditSnapshot({ prospectId, creditSnapshot: data })),
      setDeposits: (data) => dispatch(setDeposits({ prospectId, deposits: data })),
      setConditions: (data) => dispatch(setConditionsAction({ prospectId, conditions: data })),
      setClearedConditions: (data) => dispatch(setClearedConditionsAction({ prospectId, clearedConditions: data })),
      addCondition: (text) => {
        if (!text.trim()) {
          return;
        }
        dispatch(
          addConditionAction({
            prospectId,
            condition: {
              id: Date.now(),
              text: text.trim(),
              dateAdded: new Date().toISOString()
            }
          })
        );
      },
      removeCondition: (conditionId) => dispatch(removeConditionAction({ prospectId, conditionId })),
      clearCondition: (condition) => dispatch(clearConditionAction({ prospectId, condition })),
      removeClearedCondition: (conditionId) => dispatch(removeClearedConditionAction({ prospectId, conditionId })),
      saveBuyerInfo: () => dispatch(saveBuyerInfo({ prospectId, buyerInfo, isDeal })).unwrap(),
      saveCoBuyerInfo: () => dispatch(saveCoBuyerInfo({ prospectId, coBuyerInfo, isDeal })).unwrap(),
      saveFinancingData: (conditions, clearedConditions) =>
        dispatch(
          saveFinancingData({
            prospectId,
            financing: {
              ...financingData,
              conditions,
              clearedConditions
            },
            isDeal
          })
        ).unwrap(),
      saveCreditData: () => dispatch(saveCreditSnapshot({ prospectId, creditSnapshot: creditData, isDeal })).unwrap(),
      convertToDeal: () => dispatch(convertProspectToDeal({ prospectId })).unwrap(),
      prospectId,
      isDeal,
      userProfile
    }),
    [
      dispatch,
      prospect,
      buyerInfo,
      coBuyerInfo,
      financingData,
      creditData,
      deposits,
      conditions,
      clearedConditions,
      status,
      error,
      depositsStatus,
      depositsError,
      prospectId,
      isDeal,
      userProfile
    ]
  );

  return prospectValue;
};

