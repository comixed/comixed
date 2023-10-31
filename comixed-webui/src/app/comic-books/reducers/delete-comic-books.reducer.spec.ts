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
  MarkComicsDeletedState,
  reducer
} from './delete-comic-books.reducer';
import {
  deleteComicBooksFailure,
  deleteComicBooksSuccess,
  deleteSelectedComicBooks,
  deleteSingleComicBook,
  undeleteSelectedComicBooks,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';

describe('DeleteComicBooks Reducer', () => {
  const COMIC_DETAIL = COMIC_DETAIL_1;
  const DELETED = Math.random() > 0.5;

  let state: MarkComicsDeletedState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('deleting a single comic book', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        deleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('undeleting a single comic book', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        undeleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('deleting the selected comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        deleteSelectedComicBooks()
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('undeleting the selected comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        undeleteSelectedComicBooks()
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, deleteComicBooksSuccess());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, deleteComicBooksFailure());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
