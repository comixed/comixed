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

import { reducer } from './import.reducer';
import { ImportState, initial_state } from 'app/library/models/import-state';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/library/models/comic-file.fixtures';
import {
  ImportFilesReceived,
  ImportGetFiles,
  ImportGetFilesFailed,
  ImportSetDirectory,
  ImportStarted,
  ImportStart,
  ImportFailedToStart,
  ImportAddComicFiles,
  ImportRemoveComicFiles,
  ImportClearSelections
} from 'app/library/actions/import.actions';

describe('Import Reducer', () => {
  const DIRECTORY = '/Users/comixed/Documents/comics';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_3];

  let state: ImportState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('has no directory', () => {
      expect(state.directory).toEqual('');
    });

    it('clears the fetching files flag', () => {
      expect(state.fetching_files).toBeFalsy();
    });

    it('has an empty set of comic files', () => {
      expect(state.comic_files).toEqual([]);
    });

    it('has an empty set of selected comic files', () => {
      expect(state.selected_comic_files).toEqual([]);
    });

    it('clears the starting import flag', () => {
      expect(state.starting_import).toBeFalsy();
    });
  });

  describe('when setting the directory', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, directory: '' },
        new ImportSetDirectory({ directory: DIRECTORY })
      );
    });

    it('sets the directory', () => {
      expect(state.directory).toEqual(DIRECTORY);
    });
  });

  describe('when fetching files for import', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_files: false, directory: '' },
        new ImportGetFiles({ directory: DIRECTORY })
      );
    });

    it('sets the fetching files flag', () => {
      expect(state.fetching_files).toBeTruthy();
    });

    it('updates the directory', () => {
      expect(state.directory).toEqual(DIRECTORY);
    });
  });

  describe('when receiving files for import', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetching_files: true,
          comic_files: [],
          selected_comic_files: [COMIC_FILE_1]
        },
        new ImportFilesReceived({ comic_files: COMIC_FILES })
      );
    });

    it('clears the fetching files flag', () => {
      expect(state.fetching_files).toBeFalsy();
    });

    it('sets the list of comic files', () => {
      expect(state.comic_files).toEqual(COMIC_FILES);
    });

    it('clears the selected comic files', () => {
      expect(state.selected_comic_files).toEqual([]);
    });
  });

  describe('when an error occurs while getting files for import', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_files: true },
        new ImportGetFilesFailed()
      );
    });

    it('clears the fetching files flag', () => {
      expect(state.fetching_files).toBeFalsy();
    });
  });

  describe('when starting to import files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_import: false },
        new ImportStart({
          comic_files: COMIC_FILES,
          delete_blocked_pages: true,
          ignore_metadata: true
        })
      );
    });

    it('sets the starting import flag', () => {
      expect(state.starting_import).toBeTruthy();
    });
  });

  describe('when the import has started', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_import: true },
        new ImportStarted({ import_comic_count: 17 })
      );
    });

    it('clears the starting import flag', () => {
      expect(state.starting_import).toBeFalsy();
    });

    it('clears the selected comic files list', () => {
      expect(state.selected_comic_files).toEqual([]);
    });
  });

  describe('when the import fails to start', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_import: true },
        new ImportFailedToStart()
      );
    });

    it('clears the starting import flag', () => {
      expect(state.starting_import).toBeFalsy();
    });
  });

  describe('adding selected comics', () => {
    const PREVIOUS = [COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_4];
    const EXPECTED = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

    beforeEach(() => {
      state = reducer(
        { ...state, selected_comic_files: PREVIOUS },
        new ImportAddComicFiles({ comic_files: [COMIC_FILE_2] })
      );
    });

    it('adds the comics to the selection set', () => {
      expect(state.selected_comic_files).toEqual(
        jasmine.arrayContaining(EXPECTED)
      );
    });
  });

  describe('when removing selected comics', () => {
    const PREVIOUS = [COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_4];
    const EXPECTED = [COMIC_FILE_1];

    beforeEach(() => {
      state = reducer(
        { ...state, selected_comic_files: PREVIOUS },
        new ImportRemoveComicFiles({
          comic_files: [COMIC_FILE_3, COMIC_FILE_4]
        })
      );
    });

    it('removes the comic files', () => {
      expect(state.selected_comic_files).toEqual(EXPECTED);
    });
  });

  describe('when clearing the selected comics', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          selected_comic_files: [
            COMIC_FILE_1,
            COMIC_FILE_2,
            COMIC_FILE_3,
            COMIC_FILE_4
          ]
        },
        new ImportClearSelections()
      );
    });

    it('removes all selected comics', () => {
      expect(state.selected_comic_files).toEqual([]);
    });
  });
});
