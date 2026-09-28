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
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';

export const READ_COMIC_LIST_FEATURE_KEY = 'read_comics_state';

export interface ReadComicListState extends EntityState<number> {
  busy: boolean;
}

export const readComicListAdapter: EntityAdapter<number> =
  createEntityAdapter<number>({
    selectId: comicId => comicId,
    sortComparer: (left, right) => left - right
  });

export const initialReadComicListState: ReadComicListState =
  readComicListAdapter.getInitialState({
    busy: false
  });

export const readComicListReducer = createReducer(
  initialReadComicListState,
  on(ReadComicListActions.updateList, (state, action) => {
    return readComicListAdapter.setAll(action.comicIds, { ...state });
  }),
  on(ReadComicListActions.markSelectedComics, state => ({
    ...state,
    busy: true
  })),
  on(ReadComicListActions.markSelectedComicsSuccess, state => ({
    ...state,
    busy: false
  })),
  on(ReadComicListActions.markSelectedComicsFailure, state => ({
    ...state,
    busy: false
  }))
);

export const readComicListFeature = createFeature({
  name: READ_COMIC_LIST_FEATURE_KEY,
  reducer: readComicListReducer
});
