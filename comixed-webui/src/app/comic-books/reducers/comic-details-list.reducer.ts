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
  comicDetailRemoved,
  comicDetailsLoaded,
  comicDetailUpdated,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed,
  loadComicDetailsForCollection,
  loadComicDetailsForReadingList,
  loadUnreadComicDetails
} from '../actions/comic-details-list.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { deepClone } from '@angular-ru/cdk/object';

export const COMIC_DETAILS_LIST_FEATURE_KEY = 'comic_details_list_state';

export interface ComicDetailsListState {
  loading: boolean;
  comicDetails: ComicDetail[];
  coverYears: number[];
  coverMonths: number[];
  totalCount: number;
  filteredCount: number;
}

export const initialState: ComicDetailsListState = {
  loading: false,
  comicDetails: [],
  coverYears: [],
  coverMonths: [],
  totalCount: 0,
  filteredCount: 0
};

export const reducer = createReducer(
  initialState,
  on(loadComicDetails, state => ({ ...state, loading: true })),
  on(loadComicDetailsById, state => ({ ...state, loading: true })),
  on(loadComicDetailsForCollection, state => ({ ...state, loading: true })),
  on(loadUnreadComicDetails, state => ({ ...state, loading: true })),
  on(loadComicDetailsForReadingList, state => ({ ...state, loading: true })),
  on(comicDetailsLoaded, (state, action) => ({
    ...state,
    loading: false,
    comicDetails: action.comicDetails,
    coverYears: action.coverYears,
    coverMonths: action.coverMonths,
    totalCount: action.totalCount,
    filteredCount: action.filteredCount
  })),
  on(loadComicDetailsFailed, state => ({
    ...state,
    loading: false
  })),
  on(comicDetailUpdated, (state, action) => {
    const comicDetails = deepClone(state.comicDetails);
    const index = comicDetails
      .map(entry => entry.id)
      .indexOf(action.comicDetail.id);
    if (index !== -1) {
      comicDetails[index] = { ...action.comicDetail };
    }
    return { ...state, comicDetails };
  }),
  on(comicDetailRemoved, (state, action) => {
    const comicDetails = state.comicDetails.filter(
      entry => entry.id !== action.comicDetail.id
    );
    return { ...state, comicDetails };
  })
);

export const comicDetailsListFeature = createFeature({
  name: COMIC_DETAILS_LIST_FEATURE_KEY,
  reducer
});
