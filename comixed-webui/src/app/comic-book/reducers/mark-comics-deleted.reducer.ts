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
  comicsMarkedDeleted,
  markComicsDeleted,
  markComicsDeletedFailed
} from '../actions/mark-comics-deleted.actions';

export const MARK_COMICS_DELETED_FEATURE_KEY = 'mark_comics_deleted_state';

export interface MarkComicsDeletedState {
  updating: boolean;
}

export const initialState: MarkComicsDeletedState = { updating: false };

export const reducer = createReducer(
  initialState,

  on(markComicsDeleted, state => ({ ...state, updating: true })),
  on(comicsMarkedDeleted, state => ({ ...state, updating: false })),
  on(markComicsDeletedFailed, state => ({ ...state, updating: false }))
);
