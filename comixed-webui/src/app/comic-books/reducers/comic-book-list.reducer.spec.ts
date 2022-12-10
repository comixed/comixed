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

import {
  ComicBookListState,
  initialState,
  reducer
} from './comic-book-list.reducer';
import {
  comicBookListRemovalReceived,
  comicBookListUpdateReceived,
  comicBooksReceived,
  loadComicBooks,
  loadComicBooksFailed,
  resetComicBookList
} from '@app/comic-books/actions/comic-book-list.actions';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';

describe('ComicBook List Reducer', () => {
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];

  let state: ComicBookListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the last id', () => {
      expect(state.lastId).toEqual(0);
    });

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });

    it('has no comics', () => {
      expect(state.comicBooks).toEqual([]);
    });

    it('has no unprocessed comics', () => {
      expect(state.unprocessed).toEqual([]);
    });

    it('has no unscraped comics', () => {
      expect(state.unscraped).toEqual([]);
    });

    it('has no changed comics', () => {
      expect(state.changed).toEqual([]);
    });

    it('has no deleted comics', () => {
      expect(state.deleted).toEqual([]);
    });
  });

  describe('resetting the comic state', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          lastId: LAST_ID,
          lastPayload: true,
          comicBooks: [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5],
          unprocessed: [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5],
          unscraped: [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5],
          changed: [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5],
          deleted: [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5]
        },
        resetComicBookList()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the last id', () => {
      expect(state.lastId).toEqual(0);
    });

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });

    it('clears the existing set of comics', () => {
      expect(state.comicBooks).toEqual([]);
    });

    it('has no unprocessed comics', () => {
      expect(state.unprocessed).toEqual([]);
    });

    it('has no unscraped comics', () => {
      expect(state.unscraped).toEqual([]);
    });

    it('has no changed comics', () => {
      expect(state.changed).toEqual([]);
    });

    it('has no deleted comics', () => {
      expect(state.deleted).toEqual([]);
    });
  });

  describe('loading a batch of comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicBooks({ lastId: LAST_ID })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a batch of comics', () => {
    const EXISTING_COMIC_BOOK = COMIC_BOOKS[0];
    const UPDATED_COMIC_BOOK = {
      ...EXISTING_COMIC_BOOK,
      filename: EXISTING_COMIC_BOOK.filename.substr(1)
    };
    const BATCH = [UPDATED_COMIC_BOOK, COMIC_BOOK_2, COMIC_BOOK_4];
    const LAST_PAGE = Math.random() > 0.5;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          lastId: 0,
          lastPayload: !LAST_PAGE,
          comicBooks: COMIC_BOOKS
        },
        comicBooksReceived({
          comicBooks: BATCH,
          lastId: LAST_ID,
          lastPayload: LAST_PAGE
        })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('updates the last id', () => {
      expect(state.lastId).toEqual(LAST_ID);
    });

    it('sets the last payload flag', () => {
      expect(state.lastPayload).toEqual(LAST_PAGE);
    });

    it('adds the received comics', () => {
      BATCH.every(comicBook => expect(state.comicBooks).toContain(comicBook));
    });

    it('replaces existing comics', () => {
      expect(state.comicBooks).not.toContain(EXISTING_COMIC_BOOK);
      expect(state.comicBooks).toContain(UPDATED_COMIC_BOOK);
    });
  });

  describe('failure to load a batch of comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicBooksFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('receiving a new comic', () => {
    const EXISTING = COMIC_BOOK_1;
    const NEW = COMIC_BOOK_2;

    beforeEach(() => {
      state = reducer(
        { ...state, comicBooks: [EXISTING] },
        comicBookListUpdateReceived({ comicBook: NEW })
      );
    });

    it('retains the existing comic', () => {
      expect(state.comicBooks).toContain(EXISTING);
    });

    it('adds the new comic', () => {
      expect(state.comicBooks).toContain(NEW);
    });
  });

  describe('updating an existing comic', () => {
    const EXISTING = COMIC_BOOK_1;
    const UPDATED = { ...EXISTING, filename: EXISTING.filename.substr(1) };

    beforeEach(() => {
      state = reducer(
        { ...state, comicBooks: [EXISTING] },
        comicBookListUpdateReceived({ comicBook: UPDATED })
      );
    });

    it('removes the existing comic', () => {
      expect(state.comicBooks).not.toContain(EXISTING);
    });

    it('adds the updated comic', () => {
      expect(state.comicBooks).toContain(UPDATED);
    });
  });

  describe('removing an existing comic', () => {
    const REMOVED = COMIC_BOOKS[0];

    beforeEach(() => {
      state = reducer(
        { ...state, comicBooks: COMIC_BOOKS },
        comicBookListRemovalReceived({ comicBook: REMOVED })
      );
    });

    it('removes the comic', () => {
      expect(state.comicBooks).not.toContain(REMOVED);
    });
  });
});
