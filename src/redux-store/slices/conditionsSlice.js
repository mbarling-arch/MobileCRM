import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = {
  byProspect: {}
};

const emptyConditionsState = {
  conditions: [],
  clearedConditions: []
};

const ensureProspectEntry = (state, prospectId) => {
  if (!state.byProspect[prospectId]) {
    state.byProspect[prospectId] = {
      conditions: [],
      clearedConditions: []
    };
  }
};

const conditionsSlice = createSlice({
  name: 'conditions',
  initialState,
  reducers: {
    setConditions(state, action) {
      const { prospectId, conditions } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].conditions = conditions;
    },
    setClearedConditions(state, action) {
      const { prospectId, clearedConditions } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].clearedConditions = clearedConditions;
    },
    addCondition(state, action) {
      const { prospectId, condition } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].conditions.push(condition);
    },
    removeCondition(state, action) {
      const { prospectId, conditionId } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].conditions = state.byProspect[prospectId].conditions.filter(
        (cond) => cond.id !== conditionId
      );
    },
    clearCondition(state, action) {
      const { prospectId, condition } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].conditions = state.byProspect[prospectId].conditions.filter(
        (cond) => cond.id !== condition.id
      );
      state.byProspect[prospectId].clearedConditions.push({
        ...condition,
        dateCleared: new Date().toISOString()
      });
    },
    removeClearedCondition(state, action) {
      const { prospectId, conditionId } = action.payload;
      ensureProspectEntry(state, prospectId);
      state.byProspect[prospectId].clearedConditions = state.byProspect[prospectId].clearedConditions.filter(
        (cond) => cond.id !== conditionId
      );
    },
    resetConditionsState: () => initialState
  }
});

export const {
  setConditions,
  setClearedConditions,
  addCondition,
  removeCondition,
  clearCondition,
  removeClearedCondition,
  resetConditionsState
} = conditionsSlice.actions;

export const selectConditionsState = createSelector(
  [(state) => state.conditions.byProspect, (_, prospectId) => prospectId],
  (byProspect, prospectId) => byProspect[prospectId] || emptyConditionsState
);

export default conditionsSlice.reducer;

