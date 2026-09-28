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
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';

export const SELECTED_COMIC_LIST_FEATURE_KEY = 'selected_comic_list_state';

export interface SelectedComicListState extends EntityState<number> {
  busy: boolean;
}

export const selectedComicListAdapter: EntityAdapter<number> =
  createEntityAdapter<number>({
    selectId: comicId => comicId,
    sortComparer: (left, right) => left - right
  });

export const initialSelectedComicListState: SelectedComicListState =
  selectedComicListAdapter.getInitialState({
    busy: false
  });

export const selectedComicListReducer = createReducer(
  initialSelectedComicListState,
  on(SelectedComicListActions.load, state => ({ ...state, busy: true })),
  on(SelectedComicListActions.loadSuccess, (state, action) => {
    return selectedComicListAdapter.setAll(action.comicIds, {
      ...state,
      busy: false
    });
  }),
  on(SelectedComicListActions.loadFailure, state => ({
    ...state,
    busy: false
  })),
  on(SelectedComicListActions.updateList, (state, action) => {
    return selectedComicListAdapter.setAll(action.comicIds, state);
  }),
  on(SelectedComicListActions.selectComic, state => ({ ...state, busy: true })),
  on(SelectedComicListActions.selectComicSuccess, state => ({
    ...state,
    busy: false
  })),
  on(SelectedComicListActions.selectComicFailure, state => ({
    ...state,
    busy: false
  }))
);

export const selectedComicListsFeature = createFeature({
  name: SELECTED_COMIC_LIST_FEATURE_KEY,
  reducer: selectedComicListReducer
});
