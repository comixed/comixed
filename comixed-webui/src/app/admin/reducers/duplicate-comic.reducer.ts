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
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Comic } from '@app/library/models/comic';
import { DuplicateComicActions } from '@app/admin/actions/duplicate-comic.actions';

export const DUPLICATE_COMIC_FEATURE_KEY = 'duplicate_comic_state';

export interface DuplicateComicState extends EntityState<Comic> {
  busy: boolean;
  coverMonths: number[];
  coverYears: number[];
  total: number;
}

export const duplicateComicAdapter: EntityAdapter<Comic> =
  createEntityAdapter<Comic>({
    selectId: comic => comic.comicId,
    sortComparer: (left, right) => left.comicId - right.comicId
  });

export const initialDuplicateComicState: DuplicateComicState =
  duplicateComicAdapter.getInitialState({
    busy: false,
    coverMonths: [],
    coverYears: [],
    total: 0
  });

export const duplicateComicReducer = createReducer(
  initialDuplicateComicState,
  on(DuplicateComicActions.load, state => ({ ...state, busy: true })),
  on(DuplicateComicActions.loadSuccess, (state, action) => {
    return duplicateComicAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      coverMonths: action.coverMonths,
      coverYears: action.coverYears,
      total: action.total
    });
  }),
  on(DuplicateComicActions.loadFailure, state => ({ ...state, busy: false }))
);

export const duplicateComicFeature = createFeature({
  name: DUPLICATE_COMIC_FEATURE_KEY,
  reducer: duplicateComicReducer
});
