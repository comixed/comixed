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
  ComicFileListState,
  initialState,
  reducer
} from './comic-file-list.reducer';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  ROOT_DIRECTORY
} from '@app/comic-files/comic-file.fixtures';
import {
  clearComicFileSelections,
  comicFilesLoaded,
  loadComicFiles,
  loadComicFilesFailed,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';

describe('ComicFileList Reducer', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];

  let state: ComicFileListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has an empty set of files', () => {
      expect(state.files).toEqual([]);
    });

    it('has an empty set of selections', () => {
      expect(state.selections).toEqual([]);
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
      expect(state.loading).toBeTrue();
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
      expect(state.loading).toBeFalse();
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
      expect(state.loading).toBeFalse();
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
      FILES.forEach(file => expect(state.selections).toContain(file));
    });
  });

  describe('deselecting comic files', () => {
    const DESELECTED_FILE = FILES[1];

    beforeEach(() => {
      state = reducer(
        { ...state, selections: FILES },
        setComicFilesSelectedState({
          files: [DESELECTED_FILE],
          selected: false
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
});
