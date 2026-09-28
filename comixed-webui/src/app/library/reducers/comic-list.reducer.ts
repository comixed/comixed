/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ComicListActions } from '../actions/comic-list.actions';
import { Comic } from '@app/library/models/comic';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export const COMIC_LIST_FEATURE_KEY = 'comic_list_state';

export const comicListAdaptor: EntityAdapter<Comic> =
  createEntityAdapter<Comic>({
    selectId: comic => comic.comicId,
    sortComparer: (left, right) => left.comicId - right.comicId
  });

export interface ComicListState extends EntityState<Comic> {
  loading: boolean;
  totalCount: number;
  filterCount: number;
  coverMonthList: number[];
  coverYearList: number[];
}

export const initialComicListState: ComicListState =
  comicListAdaptor.getInitialState({
    loading: false,
    totalCount: 0,
    filterCount: 0,
    coverMonthList: [],
    coverYearList: []
  });

export const comicListReducer = createReducer(
  initialComicListState,
  on(ComicListActions.loadByFilters, state => ({ ...state, loading: true })),
  on(ComicListActions.loadSuccess, (state, action) => {
    return comicListAdaptor.setAll(action.comicList, {
      ...state,
      loading: false,
      totalCount: action.totalCount,
      filterCount: action.filterCount,
      coverMonthList: action.coverMonthList,
      coverYearList: action.coverYearList
    });
  }),
  on(ComicListActions.loadFailure, state => ({
    ...state,
    loading: false
  })),
  on(ComicListActions.listUpdate, (state, action) => {
    if ((state.ids as number[]).includes(action.comic.comicId)) {
      state = comicListAdaptor.updateOne(
        { id: action.comic.comicId, changes: action.comic },
        state
      );
    }
    return state;
  })
);

export const comicListFeature = createFeature({
  name: COMIC_LIST_FEATURE_KEY,
  reducer: comicListReducer
});
