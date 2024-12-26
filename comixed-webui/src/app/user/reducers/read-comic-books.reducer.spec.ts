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

import {
  initialState,
  ReadComicBooksState,
  reducer
} from './read-comic-books.reducer';
import {
  resetReadComicBooks,
  setReadComicBooks
} from '@app/user/actions/read-comic-books.actions';
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  READ_COMIC_BOOK_4,
  READ_COMIC_BOOK_5
} from '@app/user/user.fixtures';

describe('ReadComicBooks Reducer', () => {
  const READ_COMIC_BOOKS = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3,
    READ_COMIC_BOOK_4,
    READ_COMIC_BOOK_5
  ];

  let state: ReadComicBooksState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('setting the list of read comic entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: [] },
        setReadComicBooks({ entries: READ_COMIC_BOOKS })
      );
    });

    it('updates the list of read comic books', () => {
      expect(state.entries).toEqual(READ_COMIC_BOOKS);
    });
  });

  describe('resetting the list of read comic entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: READ_COMIC_BOOKS },
        resetReadComicBooks()
      );
    });

    it('updates the list of read comic books', () => {
      expect(state.entries).toEqual([]);
    });
  });
});
