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
  reducer,
  SetComicsReadState
} from './comic-books-read.reducer';
import { COMIC_DETAIL_4 } from '@app/comic-books/comic-books.fixtures';
import {
  markSelectedComicBooksReadSuccess,
  markSelectedComicBooksReadFailed,
  markSelectedComicBooksRead,
  markSingleComicBookRead
} from '@app/comic-books/actions/comic-books-read.actions';

describe('ComicBooksRead Reducer', () => {
  const COMIC = COMIC_DETAIL_4;
  const READ = Math.random() > 0.5;

  let state: SetComicsReadState;

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

  describe('setting the read status of a single comic book', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        markSingleComicBookRead({ comicBookId: COMIC.comicId, read: READ })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('setting the read status of selected comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        markSelectedComicBooksRead({ read: READ })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success updating the status', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: true },
        markSelectedComicBooksReadSuccess()
      );
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure updating the status', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: true },
        markSelectedComicBooksReadFailed()
      );
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
