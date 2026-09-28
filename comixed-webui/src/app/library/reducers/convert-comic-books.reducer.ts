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
  convertComicsFailure,
  convertComicsSuccess,
  convertSelectedComics,
  convertSingleComic
} from '../actions/convert-comic-books.actions';

export const CONVERT_COMICS_FEATURE_KEY = 'convert_comics_state';

export interface ConvertComicsState {
  converting: boolean;
}

export const initialState: ConvertComicsState = {
  converting: false
};

export const reducer = createReducer(
  initialState,

  on(convertSingleComic, state => ({ ...state, converting: true })),
  on(convertSelectedComics, state => ({ ...state, converting: true })),
  on(convertComicsSuccess, state => ({ ...state, converting: false })),
  on(convertComicsFailure, state => ({ ...state, converting: false }))
);

export const convertComicsFeature = createFeature({
  name: CONVERT_COMICS_FEATURE_KEY,
  reducer
});
