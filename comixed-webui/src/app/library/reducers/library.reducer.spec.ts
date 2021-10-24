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
  COMIC_1,
  COMIC_2,
  COMIC_3
} from '@app/comic-books/comic-books.fixtures';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';

describe('Library Reducer', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
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
  });

  describe('selecting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: [] },
        selectComics({ comics: COMICS })
      );
    });

    it('sets the selected comics', () => {
      expect(state.selected).toEqual(COMICS);
    });

    describe('reselecting the same comic', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, selected: COMICS },
          selectComics({ comics: COMICS })
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
        deselectComics({ comics: [COMIC] })
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
          deselectComics({ comics: COMICS })
        );
      });

      it('clears the selected comics', () => {
        expect(state.selected).toEqual([]);
      });
    });
  });
});
