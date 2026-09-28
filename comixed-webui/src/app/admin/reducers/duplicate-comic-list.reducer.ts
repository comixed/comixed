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
import { DuplicateComic } from '@app/library/models/duplicate-comic';
import { DuplicateComicListActions } from '@app/admin/actions/duplicate-comic-list.actions';

export const DUPLICATE_COMIC_LIST_FEATURE_KEY = 'duplicate_comic_list_state';

export interface DuplicateComicListState extends EntityState<DuplicateComic> {
  busy: boolean;
  total: number;
}

export const duplicateComicListAdapter: EntityAdapter<DuplicateComic> =
  createEntityAdapter<DuplicateComic>({
    selectId: comic =>
      `${comic.publisher}:${comic.series}:${comic.volume}:${comic.issueNumber}:${comic.coverDate}`,
    sortComparer: (left, right) =>
      `${left.publisher}:${left.series}:${left.volume}:${left.issueNumber}:${left.coverDate}`.localeCompare(
        `${right.publisher}:${right.series}:${right.volume}:${right.issueNumber}:${right.coverDate}`
      )
  });

export const initialDuplicateComicListState: DuplicateComicListState =
  duplicateComicListAdapter.getInitialState({
    busy: false,
    total: 0
  });

export const duplicateComicListReducer = createReducer(
  initialDuplicateComicListState,
  on(DuplicateComicListActions.load, state => ({ ...state, busy: true })),
  on(DuplicateComicListActions.loadSuccess, (state, action) => {
    return duplicateComicListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      total: action.total
    });
  }),
  on(DuplicateComicListActions.loadFailure, state => ({
    ...state,
    busy: false
  }))
);

export const duplicateComicListFeature = createFeature({
  name: DUPLICATE_COMIC_LIST_FEATURE_KEY,
  reducer: duplicateComicListReducer
});
