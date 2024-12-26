/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  resetReadComicBooks,
  setReadComicBooks
} from '@app/user/actions/read-comic-books.actions';

export const READ_COMIC_BOOKS_FEATURE_KEY = 'read_comic_books_state';

export interface ReadComicBooksState {
  entries: number[];
}

export const initialState: ReadComicBooksState = {
  entries: []
};

export const reducer = createReducer(
  initialState,
  on(setReadComicBooks, (state, action) => ({
    ...state,
    entries: action.entries
  })),
  on(resetReadComicBooks, state => ({ ...state, entries: [] }))
);

export const readComicBooksFeature = createFeature({
  name: READ_COMIC_BOOKS_FEATURE_KEY,
  reducer
});
