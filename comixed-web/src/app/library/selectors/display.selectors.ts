import { createFeatureSelector } from '@ngrx/store';
import { DISPLAY_FEATURE_KEY, DisplayState } from '../reducers/display.reducer';

export const selectDisplayState =
  createFeatureSelector<DisplayState>(DISPLAY_FEATURE_KEY);
