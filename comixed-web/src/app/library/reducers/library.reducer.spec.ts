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

import { LibraryState, initialState, reducer } from './library.reducer';
import { COMIC_1 } from '@app/library/library.fixtures';
import {
  comicLoaded,
  loadComic,
  loadComicFailed
} from '@app/library/actions/library.actions';

describe('Library Reducer', () => {
  const COMIC = COMIC_1;

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('has no current comic', () => {
      expect(state.comic).toBeNull();
    });
  });

  describe('loading a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComic({ id: COMIC.id })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('receiving a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, comic: null },
        comicLoaded({ comic: COMIC })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('failure to load a comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });
});
