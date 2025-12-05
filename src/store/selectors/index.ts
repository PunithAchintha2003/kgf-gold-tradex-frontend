/**
 * Redux selectors
 * Centralized selectors for accessing store state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Theme selectors
export const selectTheme = (state: RootState) => state.theme.mode;

// Gold API selectors
export const selectGoldApiState = (state: RootState) => state.goldApi;

// Select daily data
export const selectDailyData = createSelector(
  [selectGoldApiState],
  (apiState) => apiState.queries
);

// Select realtime price
export const selectRealtimePrice = createSelector(
  [selectGoldApiState],
  (apiState) => {
    const query = Object.values(apiState.queries).find(
      (q) => q?.endpointName === 'getRealtimePrice'
    );
    return query?.data as { current_price: number; timestamp: string } | undefined;
  }
);

// Select prediction explanation
export const selectPredictionExplanation = createSelector(
  [selectGoldApiState],
  (apiState) => {
    const query = Object.values(apiState.queries).find(
      (q) => q?.endpointName === 'getPredictionExplanation'
    );
    return query?.data;
  }
);

