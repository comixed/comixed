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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Action, createReducer, on } from '@ngrx/store';
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from '../actions/comic-format.actions';
import { ComicFormat } from 'app/comics';

export const COMIC_FORMAT_FEATURE_KEY = 'comic_format_state';

export interface ComicFormatState {
  loading: boolean;
  loaded: boolean;
  formats: ComicFormat[];
}

export const initialState: ComicFormatState = {
  loading: false,
  loaded: false,
  formats: []
};

const comicFormatReducer = createReducer(
  initialState,

  on(loadComicFormats, state => ({ ...state, loading: true, loaded: false })),
  on(comicFormatsLoaded, (state, action) => ({
    ...state,
    loading: false,
    loaded: true,
    formats: action.formats
  })),
  on(loadComicFormatsFailed, state => ({ ...state, loading: false }))
);

export function reducer(state: ComicFormatState | undefined, action: Action) {
  return comicFormatReducer(state, action);
}
