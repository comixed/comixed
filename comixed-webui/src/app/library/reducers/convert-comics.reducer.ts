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
  comicsConverting,
  convertComics,
  convertComicsFailed
} from '../actions/convert-comics.actions';

export const CONVERT_COMICS_FEATURE_KEY = 'convert_comics_state';

export interface ConvertComicsState {
  converting: boolean;
}

export const initialState: ConvertComicsState = {
  converting: false
};

export const reducer = createReducer(
  initialState,

  on(convertComics, state => ({ ...state, converting: true })),
  on(comicsConverting, state => ({ ...state, converting: false })),
  on(convertComicsFailed, state => ({ ...state, converting: false }))
);
