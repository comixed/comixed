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

import { createReducer, on } from '@ngrx/store';
import {
  duplicatePageDetailLoaded,
  loadDuplicatePageDetail,
  loadDuplicatePageDetailFailed
} from '../actions/duplicate-page-detail.actions';
import { DuplicatePage } from '@app/library/models/duplicate-page';

export const DUPLICATE_PAGE_DETAIL_FEATURE_KEY = 'duplicate_page_detail_state';

export interface DuplicatePageDetailState {
  loading: boolean;
  notFound: boolean;
  detail: DuplicatePage;
}

export const initialState: DuplicatePageDetailState = {
  loading: false,
  notFound: false,
  detail: null
};

export const reducer = createReducer(
  initialState,

  on(loadDuplicatePageDetail, state => ({
    ...state,
    loading: true,
    notFound: false,
    detail: null
  })),
  on(duplicatePageDetailLoaded, (state, action) => ({
    ...state,
    loading: false,
    detail: action.detail
  })),
  on(loadDuplicatePageDetailFailed, state => ({
    ...state,
    loading: false,
    notFound: true
  }))
);
