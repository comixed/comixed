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

import {
  ComicImportState,
  initialState,
  reducer,
} from './comic-import.reducer';
import {
  clearComicFileSelections,
  comicFilesLoaded,
  comicFilesSent,
  loadComicFiles,
  loadComicFilesFailed,
  sendComicFiles,
  sendComicFilesFailed,
  setComicFilesSelectedState,
  setImportingComicsState,
} from '@app/comic-import/actions/comic-import.actions';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  ROOT_DIRECTORY,
} from '@app/comic-import/comic-import.fixtures';

describe('ComicImport Reducer', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];

  let state: ComicImportState;

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

    it('has an empty set of files', () => {
      expect(state.files).toEqual([]);
    });

    it('has an empty set of selections', () => {
      expect(state.selections).toEqual([]);
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalsy();
    });

    it('clears the importing flag', () => {
      expect(state.importing).toBeFalsy();
    });
  });

  describe('loading files in a directory', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicFiles({ directory: ROOT_DIRECTORY, maximum: 100 })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('comic files received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, files: [], selections: FILES },
        comicFilesLoaded({ files: FILES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the comic files', () => {
      expect(state.files).toEqual(FILES);
    });

    it('clears any previous selections', () => {
      expect(state.selections).toEqual([]);
    });
  });

  describe('failure to load comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, files: FILES, selections: FILES },
        loadComicFilesFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('clears the comic files', () => {
      expect(state.files).toEqual([]);
    });

    it('clears any previous selections', () => {
      expect(state.selections).toEqual([]);
    });
  });

  describe('selecting comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selections: [FILES[0]] },
        setComicFilesSelectedState({ files: FILES, selected: true })
      );
    });

    it('adds the comics to the selection list', () => {
      FILES.forEach((file) => expect(state.selections).toContain(file));
    });
  });

  describe('deselecting comic files', () => {
    const DESELECTED_FILE = FILES[1];

    beforeEach(() => {
      state = reducer(
        { ...state, selections: FILES },
        setComicFilesSelectedState({
          files: [DESELECTED_FILE],
          selected: false,
        })
      );
    });

    it('removes the comics from the selection list', () => {
      expect(state.selections).not.toContain(DESELECTED_FILE);
    });
  });

  describe('clearing the selections', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selections: FILES },
        clearComicFileSelections()
      );
    });

    it('removes all selection entries', () => {
      expect(state.selections).toEqual([]);
    });
  });

  describe('sending comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: false },
        sendComicFiles({
          files: FILES,
          ignoreMetadata: true,
          deleteBlockedPages: true,
        })
      );
    });

    it('sets the sending flag', () => {
      expect(state.sending).toBeTruthy();
    });
  });

  describe('successfully sending files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, files: FILES, selections: FILES, sending: true },
        comicFilesSent()
      );
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalsy();
    });

    it('clears the comic file list', () => {
      expect(state.files).toEqual([]);
    });

    it('clears the comic file selection', () => {
      expect(state.selections).toEqual([]);
    });
  });

  describe('failure to send files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, files: FILES, selections: FILES, sending: true },
        sendComicFilesFailed()
      );
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalsy();
    });

    it('leaves the comic file list intact', () => {
      expect(state.files).toEqual(FILES);
    });

    it('leaves the comic file selections intact', () => {
      expect(state.selections).toEqual(FILES);
    });
  });

  describe('the importing comic flag', () => {
    it('can be turned on', () => {
      state = reducer(
        { ...state, importing: false },
        setImportingComicsState({ importing: true })
      );
      expect(state.importing).toBeTruthy();
    });

    it('can be turned off', () => {
      state = reducer(
        { ...state, importing: true },
        setImportingComicsState({ importing: false })
      );
      expect(state.importing).toBeFalsy();
    });
  });
});
