/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Action, createReducer, on } from '@ngrx/store';
import {
  comicsImporting,
  importComics,
  importComicsFailed
} from '../actions/import-comics.actions';

export const IMPORT_COMICS_FEATURE_KEY = 'import_comics_state';

export interface ImportComicsState {
  starting: boolean;
}

export const initialState: ImportComicsState = {
  starting: false
};

const importComicsReducer = createReducer(
  initialState,

  on(importComics, state => ({ ...state, starting: true })),
  on(comicsImporting, state => ({ ...state, starting: false })),
  on(importComicsFailed, state => ({ ...state, starting: false }))
);

export function reducer(state: ImportComicsState | undefined, action: Action) {
  return importComicsReducer(state, action);
}
