/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  READING_LISTS_FEATURE_KEY,
  ReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';

export const selectUserReadingListsState =
  createFeatureSelector<ReadingListsState>(READING_LISTS_FEATURE_KEY);

export const selectUserReadingLists = createSelector(
  selectUserReadingListsState,
  state => state.entries
);

export const selectUserReadingListsBusy = createSelector(
  selectUserReadingListsState,
  state => state.loading || state.deleting
);
