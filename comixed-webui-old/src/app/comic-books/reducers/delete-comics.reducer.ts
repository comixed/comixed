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
  deleteComicsFailure,
  deleteComicsSuccess,
  deleteSelectedComics,
  deleteSingleComic,
  undeleteSelectedComics,
  undeleteSingleComic
} from '../actions/delete-comic-books.actions';

export const MARK_COMICS_DELETED_FEATURE_KEY = 'mark_comics_deleted_state';

export interface MarkComicsDeletedState {
  updating: boolean;
}

export const initialState: MarkComicsDeletedState = { updating: false };

export const reducer = createReducer(
  initialState,

  on(deleteSingleComic, state => ({ ...state, updating: true })),
  on(undeleteSingleComic, state => ({ ...state, updating: true })),
  on(deleteSelectedComics, state => ({ ...state, updating: true })),
  on(undeleteSelectedComics, state => ({ ...state, updating: true })),
  on(deleteComicsSuccess, state => ({ ...state, updating: false })),
  on(deleteComicsFailure, state => ({ ...state, updating: false }))
);

export const markComicsDeletedFeature = createFeature({
  name: MARK_COMICS_DELETED_FEATURE_KEY,
  reducer
});
