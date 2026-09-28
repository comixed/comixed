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
} from './delete-comics.reducer';
import {
  deleteComicsFailure,
  deleteComicsSuccess,
  deleteSelectedComics,
  deleteSingleComic,
  undeleteSelectedComics,
  undeleteSingleComic
} from '@app/comic-books/actions/delete-comic-books.actions';

describe('DeleteComics Reducer', () => {
  const COMIC_ID = 710129;

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
        deleteSingleComic({ comicId: COMIC_ID })
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
        undeleteSingleComic({ comicId: COMIC_ID })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('deleting the selected comic books', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: false }, deleteSelectedComics());
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('undeleting the selected comic books', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: false }, undeleteSelectedComics());
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, deleteComicsSuccess());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, deleteComicsFailure());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
