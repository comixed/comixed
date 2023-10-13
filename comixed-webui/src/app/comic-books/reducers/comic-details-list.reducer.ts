/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  comicDetailsLoaded,
  loadComicDetails,
  loadComicDetailsFailed
} from '../actions/comics-details-list.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const COMIC_DETAILS_LIST_FEATURE_KEY = 'comic_details_list_state';

export interface ComicDetailsListState {
  loading: boolean;
  comicDetails: ComicDetail[];
  totalCount: number;
  filteredCount: number;
}

export const initialState: ComicDetailsListState = {
  loading: false,
  comicDetails: [],
  totalCount: 0,
  filteredCount: 0
};

export const reducer = createReducer(
  initialState,
  on(loadComicDetails, state => ({ ...state, loading: true })),
  on(comicDetailsLoaded, (state, action) => ({
    ...state,
    loading: false,
    comicDetails: action.comicDetails,
    totalCount: action.totalCount,
    filteredCount: action.filteredCount
  })),
  on(loadComicDetailsFailed, state => ({
    ...state,
    loading: false
  }))
);

export const comicDetailsListFeature = createFeature({
  name: COMIC_DETAILS_LIST_FEATURE_KEY,
  reducer
});
