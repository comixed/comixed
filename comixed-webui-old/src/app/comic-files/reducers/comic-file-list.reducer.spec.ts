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
  loadComicFileListFailure,
  loadComicFileLists,
  loadComicFileListSuccess,
  loadComicFilesFromSession,
  resetComicFileList,
  toggleComicFileSelections,
  toggleComicFileSelectionsFailure,
  toggleComicFileSelectionsSuccess,
  updateCurrentPath
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
  const TEST_SINGLE = Math.random() > 0.5;

  let state: ComicFileListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has an empty set of files', () => {
      expect(state.files).toEqual([]);
    });
  });

  describe('resetting the comic file list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, files: FILES, groups: GROUPS },
        resetComicFileList()
      );
    });

    it('clears the list of comic files', () => {
      expect(state.files).toEqual([]);
    });

    it('clears the group list', () => {
      expect(state.groups).toEqual([]);
    });
  });

  describe('loading files from the user session', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadComicFilesFromSession());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading files in a directory', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadComicFileLists({ directory: ROOT_DIRECTORY, maximum: 100 })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, groups: [], files: [] },
          loadComicFileListSuccess({ groups: GROUPS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the comic file groups', () => {
        expect(state.groups).toEqual(GROUPS);
      });

      it('sets the comic files', () => {
        expect(state.files).toEqual([COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_2]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, files: FILES },
          loadComicFileListFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('clears the comic files', () => {
        expect(state.files).toEqual([]);
      });
    });
  });

  describe('setting the comic file group filter', () => {
    describe('using a specific value', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, currentPath: null },
          updateCurrentPath({ path: GROUPS[0].directory })
        );
      });

      it('sets the path', () => {
        expect(state.currentPath).toEqual(GROUPS[0].directory);
      });
    });

    describe('clearing the current value', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, currentPath: GROUPS[0].directory },
          updateCurrentPath({ path: null })
        );
      });

      it('sets the path', () => {
        expect(state.currentPath).toBeNull();
      });
    });
  });

  describe('toggling selections', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        toggleComicFileSelections({
          filename: COMIC_FILE_1.filename,
          selected: Math.random() > 0.5,
          single: TEST_SINGLE
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            groups: GROUPS,
            files: []
          },
          toggleComicFileSelectionsSuccess({ groups: GROUPS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the comic file groups', () => {
        expect(state.groups).toEqual(GROUPS);
      });

      it('sets the comic files', () => {
        expect(state.files).toEqual([COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_2]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          toggleComicFileSelectionsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
