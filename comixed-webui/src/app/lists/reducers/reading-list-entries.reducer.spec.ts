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
  initialState,
  ReadingListEntriesState,
  reducer
} from './reading-list-entries.reducer';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';
import {
  addComicBooksToReadingListFailure,
  addComicBooksToReadingListSuccess,
  addSelectedComicBooksToReadingList,
  removeComicBooksFromReadingListFailure,
  removeComicBooksFromReadingListSuccess,
  removeSelectedComicBooksFromReadingList
} from '@app/lists/actions/reading-list-entries.actions';

describe('ReadingListEntries Reducer', () => {
  const READING_LIST = READING_LIST_3;
  const COMIC_DETAIL = COMIC_DETAIL_1;

  let state: ReadingListEntriesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });

  describe('adding selected comic books to a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, working: false },
        addSelectedComicBooksToReadingList({ list: READING_LIST })
      );
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, working: true },
          addComicBooksToReadingListSuccess()
        );
      });

      it('clears the working flag', () => {
        expect(state.working).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, working: true },
          addComicBooksToReadingListFailure()
        );
      });

      it('clears the working flag', () => {
        expect(state.working).toBeFalse();
      });
    });
  });

  describe('removing selected comic books from a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, working: false },
        removeSelectedComicBooksFromReadingList({
          list: READING_LIST
        })
      );
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, working: true },
          removeComicBooksFromReadingListSuccess()
        );
      });

      it('clears the working flag', () => {
        expect(state.working).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, working: true },
          removeComicBooksFromReadingListFailure()
        );
      });

      it('clears the working flag', () => {
        expect(state.working).toBeFalse();
      });
    });
  });
});
