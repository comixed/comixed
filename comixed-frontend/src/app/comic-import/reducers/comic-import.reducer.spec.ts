/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  reducer,
  initialState,
  ComicImportState
} from './comic-import.reducer';
import {
  ComicImportDeselectFiles,
  ComicImportFilesReceived,
  ComicImportGetFiles,
  ComicImportGetFilesFailed,
  ComicImportReset,
  ComicImportSelectFiles,
  ComicImportSetDirectory,
  ComicImportStart,
  ComicImportStarted,
  ComicImportStartFailed
} from 'app/comic-import/actions/comic-import.actions';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from 'app/comic-import/models/comic-file.fixtures';

describe('ComicImport Reducer', () => {
  const DIRECTORY = '/Users/comixedreader/Library';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_3];

  let state: ComicImportState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('has no directory set', () => {
      expect(state.directory).toEqual('');
    });

    it('clears the fetching files flag', () => {
      expect(state.fetchingFiles).toBeFalsy();
    });

    it('has an empty set of comic files', () => {
      expect(state.comicFiles).toEqual([]);
    });

    it('has an empty set of selected comic files', () => {
      expect(state.selectedComicFiles).toEqual([]);
    });

    it('clears the starting import process', () => {
      expect(state.startingImport).toBeFalsy();
    });
  });

  describe('setting the directory', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, directory: '' },
        new ComicImportSetDirectory({ directory: DIRECTORY })
      );
    });

    it('sets the directory', () => {
      expect(state.directory).toEqual(DIRECTORY);
    });
  });

  describe('getting comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFiles: false },
        new ComicImportGetFiles({ directory: DIRECTORY })
      );
    });

    it('sets the fetching files flag', () => {
      expect(state.fetchingFiles).toBeTruthy();
    });
  });

  describe('receiving comic files', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingFiles: true,
          comicFiles: null,
          selectedComicFiles: COMIC_FILES
        },
        new ComicImportFilesReceived({ comicFiles: COMIC_FILES })
      );
    });

    it('clears the fetching files flag', () => {
      expect(state.fetchingFiles).toBeFalsy();
    });

    it('sets the comic files list', () => {
      expect(state.comicFiles).toEqual(COMIC_FILES);
    });

    it('clears the selected comic files list', () => {
      expect(state.selectedComicFiles).toEqual([]);
    });
  });

  describe('failing to get comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFiles: true },
        new ComicImportGetFilesFailed()
      );
    });

    it('clears the fetching files flag', () => {
      expect(state.fetchingFiles).toBeFalsy();
    });
  });

  describe('selecting comic files', () => {
    const NEW_COMIC_FILE = COMIC_FILE_2;

    beforeEach(() => {
      state = reducer(
        { ...state, comicFiles: COMIC_FILES },
        new ComicImportSelectFiles({ comicFiles: [NEW_COMIC_FILE] })
      );
    });

    it('adds the provided comic files', () => {
      expect(state.selectedComicFiles).toContain(NEW_COMIC_FILE);
    });

    it('does not select a comic file twice', () => {
      state = reducer(
        state,
        new ComicImportSelectFiles({ comicFiles: [NEW_COMIC_FILE] })
      );
      expect(
        state.selectedComicFiles.filter(entry => entry.id === NEW_COMIC_FILE.id)
          .length
      ).toEqual(1);
    });
  });

  describe('deselecting comic files', () => {
    const REMOVED_COMIC_FILE = COMIC_FILES[0];

    beforeEach(() => {
      state = reducer(
        { ...state, selectedComicFiles: COMIC_FILES },
        new ComicImportDeselectFiles({ comicFiles: [REMOVED_COMIC_FILE] })
      );
    });

    it('removes the provided comic files', () => {
      expect(state.selectedComicFiles).not.toContain(REMOVED_COMIC_FILE);
    });

    it('does not deselect the same comic file twice', () => {
      state = reducer(
        state,
        new ComicImportDeselectFiles({ comicFiles: [REMOVED_COMIC_FILE] })
      );
      expect(state.selectedComicFiles).not.toContain(REMOVED_COMIC_FILE);
    });

    it('does not deselect a', () => {
      state = reducer(
        state,
        new ComicImportDeselectFiles({ comicFiles: [REMOVED_COMIC_FILE] })
      );
      expect(state.selectedComicFiles).not.toContain(REMOVED_COMIC_FILE);
    });
  });

  describe('resetting the selected comic files list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selectedComicFiles: COMIC_FILES },
        new ComicImportReset()
      );
    });

    it('has an clears the selected comic files', () => {
      expect(state.selectedComicFiles).toEqual([]);
    });
  });

  describe('starting the import process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingImport: false },
        new ComicImportStart({
          comicFiles: COMIC_FILES,
          ignoreMetadata: true,
          deleteBlockedPages: false
        })
      );
    });

    it('sets the starting import flag', () => {
      expect(state.startingImport).toBeTruthy();
    });
  });

  describe('when the import is started', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          startingImport: true,
          selectedComicFiles: COMIC_FILES
        },
        new ComicImportStarted()
      );
    });

    it('clears the starting import process', () => {
      expect(state.startingImport).toBeFalsy();
    });

    it('clears the fetching files flag', () => {
      expect(state.fetchingFiles).toBeFalsy();
    });

    it('has an empty set of selected comic files', () => {
      expect(state.selectedComicFiles).toEqual([]);
    });
  });

  describe('when the import fails to start', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingImport: true },
        new ComicImportStartFailed()
      );
    });

    it('clears the starting import process', () => {
      expect(state.startingImport).toBeFalsy();
    });
  });
});
