import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromDisplay from '../reducers/display.reducer';

export const selectDisplayState = createFeatureSelector<
  fromDisplay.DisplayState
>(fromDisplay.DISPLAY_FEATURE_KEY);
