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
  DUPLICATE_PAGE_LIST_FEATURE_KEY,
  DuplicatePageListState
} from '../reducers/duplicate-page-list.reducer';

export const selectDuplicatePageListState =
  createFeatureSelector<DuplicatePageListState>(
    DUPLICATE_PAGE_LIST_FEATURE_KEY
  );

export const selectDuplicatePageList = createSelector(
  selectDuplicatePageListState,
  state => state.pages
);

export const selectDuplicatePageCount = createSelector(
  selectDuplicatePageListState,
  state => state.total
);
