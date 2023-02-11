/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  DuplicateComicState,
  initialState,
  reducer
} from './duplicate-comic.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import {
  duplicateComicsLoaded,
  loadDuplicateComics,
  loadDuplicateComicsFailed
} from '@app/library/actions/duplicate-comic.actions';

describe('DuplicateComic Reducer', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];

  let state: DuplicateComicState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clear the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('loading the duplicate comics', () => {
    beforeEach(() => {
      state = reducer({ ...initialState, busy: false }, loadDuplicateComics());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the duplicate comics', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...initialState,
          busy: true,
          comics: COMIC_BOOKS.reverse()
        },
        duplicateComicsLoaded({ comics: COMIC_BOOKS })
      );
    });

    it('clear the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list of comic books', () => {
      expect(state.comics).toEqual(COMIC_BOOKS);
    });
  });

  describe('failure loading the duplicate comics', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...initialState,
          busy: true
        },
        loadDuplicateComicsFailed()
      );
    });

    it('clear the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
