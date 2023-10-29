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
  convertComicBooksFailure,
  convertComicBooksSuccess,
  convertSelectedComicBooks,
  convertSingleComicBook
} from '../actions/convert-comic-books.actions';

export const CONVERT_COMIC_BOOKS_FEATURE_KEY = 'convert_comic_books_state';

export interface ConvertComicBooksState {
  converting: boolean;
}

export const initialState: ConvertComicBooksState = {
  converting: false
};

export const reducer = createReducer(
  initialState,

  on(convertSingleComicBook, state => ({ ...state, converting: true })),
  on(convertSelectedComicBooks, state => ({ ...state, converting: true })),
  on(convertComicBooksSuccess, state => ({ ...state, converting: false })),
  on(convertComicBooksFailure, state => ({ ...state, converting: false }))
);

export const convertComicBooksFeature = createFeature({
  name: CONVERT_COMIC_BOOKS_FEATURE_KEY,
  reducer
});
