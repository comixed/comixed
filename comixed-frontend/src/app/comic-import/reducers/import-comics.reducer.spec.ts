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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  ImportComicsState,
  initialState,
  reducer
} from './import-comics.reducer';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/comic-import.fixtures';
import {
  comicsImporting,
  importComics,
  importComicsFailed
} from 'app/comic-import/actions/import-comics.actions';

describe('ImportComics Reducer', () => {
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let state: ImportComicsState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });
  });

  describe('starting the import process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting: false },
        importComics({
          files: COMIC_FILES,
          ignoreMetadata: true,
          deleteBlockedPages: true
        })
      );
    });

    it('sets the starting flag', () => {
      expect(state.starting).toBeTruthy();
    });
  });

  describe('when the import process starts', () => {
    beforeEach(() => {
      state = reducer({ ...state, starting: true }, comicsImporting());
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });
  });

  describe('when the import process fails', () => {
    beforeEach(() => {
      state = reducer({ ...state, starting: true }, importComicsFailed());
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });
  });
});
