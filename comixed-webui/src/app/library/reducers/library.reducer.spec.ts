/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { initialState, LibraryState, reducer } from './library.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3
} from '@app/comic-books/comic-books.fixtures';
import {
  deselectComics,
  editMultipleComics,
  editMultipleComicsFailed,
  multipleComicsEdited,
  selectComics
} from '@app/library/actions/library.actions';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';

describe('Library Reducer', () => {
  const COMIC = COMIC_BOOK_1;
  const COMICS = [COMIC_BOOK_1, COMIC_BOOK_2, COMIC_BOOK_3];
  const READ = Math.random() > 0.5;

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no selected comic', () => {
      expect(state.selected).toEqual([]);
    });

    it('is not busy', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('selecting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: [] },
        selectComics({ comicBooks: COMICS })
      );
    });

    it('sets the selected comics', () => {
      expect(state.selected).toEqual(COMICS);
    });

    describe('reselecting the same comic', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, selected: COMICS },
          selectComics({ comicBooks: COMICS })
        );
      });

      it('does not reselect the same comics', () => {
        expect(state.selected).toEqual(COMICS);
      });
    });
  });

  describe('deselecting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: COMICS },
        deselectComics({ comicBooks: [COMIC] })
      );
    });

    it('removes the deselected comics', () => {
      expect(state.selected).not.toContain(COMIC);
    });

    it('leaves the remaining comics selected', () => {
      expect(state.selected).not.toEqual([]);
    });

    describe('deselecting all comics', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, selected: COMICS },
          deselectComics({ comicBooks: COMICS })
        );
      });

      it('clears the selected comics', () => {
        expect(state.selected).toEqual([]);
      });
    });
  });

  describe('editing multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        editMultipleComics({
          comicBooks: COMICS,
          details: {} as EditMultipleComics
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('successfully editing multiple comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, multipleComicsEdited());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('failure editing multiple comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, editMultipleComicsFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
