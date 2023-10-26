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
  COMIC_BOOK_LIST_FEATURE_KEY,
  ComicBookListState
} from '../reducers/comic-book-list.reducer';
import { ComicState } from '@app/comic-books/models/comic-state';

export const selectComicBookListState =
  createFeatureSelector<ComicBookListState>(COMIC_BOOK_LIST_FEATURE_KEY);

export const selectComicBookList = createSelector(
  selectComicBookListState,
  state => state.comicBooks
);

export const selectComicBookListCount = createSelector(
  selectComicBookListState,
  state => state.comicBooks.length
);

export const selectComicBookListDeletedCount = createSelector(
  selectComicBookListState,
  state =>
    state.comicBooks.filter(
      comicBook => comicBook.comicState === ComicState.DELETED
    ).length
);
