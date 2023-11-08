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
  loadComicFileListFailure,
  loadComicFileLists,
  loadComicFileListSuccess,
  resetComicFileList,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

describe('ComicFileList Reducer', () => {
  const GROUPS: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [COMIC_FILE_1, COMIC_FILE_3]
    },
    {
      directory: 'directory2',
      files: [COMIC_FILE_2]
    }
  ];
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
        loadComicFileLists({ directory: ROOT_DIRECTORY, maximum: 100 })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, groups: [], files: [], selections: FILES },
          loadComicFileListSuccess({ groups: GROUPS })
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });

      it('sets the comic file groups', () => {
        expect(state.groups).toEqual(GROUPS);
      });

      it('sets the comic files', () => {
        expect(state.files).toEqual([COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_2]);
      });

      it('clears any previous selections', () => {
        expect(state.selections).toEqual([]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, files: FILES, selections: FILES },
          loadComicFileListFailure()
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
  });

  describe('clearing the list of comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, files: FILES, selections: FILES, groups: GROUPS },
        resetComicFileList()
      );
    });

    it('clears the list of comic files', () => {
      expect(state.files).toEqual([]);
    });

    it('clears the groups', () => {
      expect(state.groups).toEqual([]);
    });

    it('clears the list of selections', () => {
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
    const DESELECTED_FILE = FILES[0];

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
        { ...state, files: FILES, selections: FILES },
        clearComicFileSelections()
      );
    });

    it('clears the selections', () => {
      expect(state.selections).toEqual([]);
    });
  });
});
