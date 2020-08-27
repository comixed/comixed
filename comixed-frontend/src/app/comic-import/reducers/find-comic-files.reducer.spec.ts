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
  FindComicFilesState,
  initialState,
  reducer
} from './find-comic-files.reducer';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/comic-import.fixtures';
import {
  comicFilesFound,
  findComicFiles,
  findComicFilesFailed
} from 'app/comic-import/actions/find-comic-files.actions';

describe('FindComicFiles reducer', () => {
  const DIRECTORY = '/Users/comixedreader/Documents/comics';
  const MAXIMUM = 17;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let state: FindComicFilesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the finding flag', () => {
      expect(state.finding).toBeFalsy();
    });

    it('has no comic files', () => {
      expect(state.files).toEqual([]);
    });
  });

  describe('fetching the list of comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, finding: false, files: COMIC_FILES },
        findComicFiles({ directory: DIRECTORY, maximum: MAXIMUM })
      );
    });

    it('sets the finding flag', () => {
      expect(state.finding).toBeTruthy();
    });

    it('resets the comic files', () => {
      expect(state.files).toEqual([]);
    });
  });

  describe('receiving comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, finding: true, files: [] },
        comicFilesFound({ comicFiles: COMIC_FILES })
      );
    });

    it('clears the finding flag', () => {
      expect(state.finding).toBeFalsy();
    });

    it('sets the comic files', () => {
      expect(state.files).toEqual(COMIC_FILES);
    });
  });

  describe('when finding comic files fails', () => {
    beforeEach(() => {
      state = reducer({ ...state, finding: true }, findComicFilesFailed());
    });

    it('clears the finding flag', () => {
      expect(state.finding).toBeFalsy();
    });
  });
});
