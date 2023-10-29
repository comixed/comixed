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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  duplicatePagesLoaded,
  loadDuplicatePages,
  loadDuplicatePagesFailed,
  resetDuplicatePages
} from '@app/library/actions/duplicate-page-list.actions';
import { DuplicatePage } from '@app/library/models/duplicate-page';

export const DUPLICATE_PAGE_LIST_FEATURE_KEY = 'duplicate_page_list_state';

export interface DuplicatePageListState {
  loading: boolean;
  pages: DuplicatePage[];
}

export const initialState: DuplicatePageListState = {
  loading: false,
  pages: []
};

export const reducer = createReducer(
  initialState,

  on(resetDuplicatePages, state => ({
    ...state,
    loading: false,
    pages: []
  })),
  on(loadDuplicatePages, state => ({ ...state, loading: true })),
  on(duplicatePagesLoaded, (state, action) => ({
    ...state,
    loading: false,
    pages: action.pages
  })),
  on(loadDuplicatePagesFailed, state => ({
    ...state,
    loading: false
  }))
);

export const duplicatePageListFeature = createFeature({
  name: DUPLICATE_PAGE_LIST_FEATURE_KEY,
  reducer
});
