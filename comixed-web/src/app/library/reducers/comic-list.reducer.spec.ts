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

import { ComicListState, initialState, reducer } from './comic-list.reducer';
import {
  comicListUpdateReceived,
  resetComicList
} from '@app/library/actions/comic-list.actions';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_5
} from '@app/library/library.fixtures';

describe('Comic List Reducer', () => {
  let state: ComicListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('resetting the comic state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: [COMIC_1, COMIC_3, COMIC_5] },
        resetComicList()
      );
    });

    it('clears the existing set of comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('receiving a new comic', () => {
    const EXISTING = COMIC_1;
    const NEW = COMIC_2;

    beforeEach(() => {
      state = reducer(
        { ...state, comics: [EXISTING] },
        comicListUpdateReceived({ comic: NEW })
      );
    });

    it('retains the existing comic', () => {
      expect(state.comics).toContain(EXISTING);
    });

    it('adds the new comic', () => {
      expect(state.comics).toContain(NEW);
    });
  });

  describe('updating an existing comic', () => {
    const EXISTING = COMIC_1;
    const UPDATED = { ...EXISTING, filename: EXISTING.filename.substr(1) };

    beforeEach(() => {
      state = reducer(
        { ...state, comics: [EXISTING] },
        comicListUpdateReceived({ comic: UPDATED })
      );
    });

    it('removes the existing comic', () => {
      expect(state.comics).not.toContain(EXISTING);
    });

    it('adds the updated comic', () => {
      expect(state.comics).toContain(UPDATED);
    });
  });
});
