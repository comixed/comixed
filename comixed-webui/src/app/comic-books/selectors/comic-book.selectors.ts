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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMIC_BOOK_FEATURE_KEY,
  ComicBookState
} from '../reducers/comic-book.reducer';

export const selectComicBookState = createFeatureSelector<ComicBookState>(
  COMIC_BOOK_FEATURE_KEY
);

export const selectComicBook = createSelector(
  selectComicBookState,
  state => state.comicBook
);

export const selectComicBookBusy = createSelector(
  selectComicBookState,
  state => state.loading || state.saving
);
