/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';
import { COMIC_FILE_1 } from '@app/library/library-fixtures';
import { ComicFileGroup } from '@app/library/models/comic-file-group';
import {
  comicFileListAdapter,
  comicFileListReducer,
  ComicFileListState,
  initialComicFileListState
} from '@app/library/reducers/comic-file-list.reducer';

describe('ComicFileList Reducer', () => {
  const TEST_COMIC_FILE = COMIC_FILE_1;
  const TEST_PATH = '/Users/comixed/Library/Comics/import';
  const TEST_COMIC_FILE_GROUP_LIST: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [TEST_COMIC_FILE]
    }
  ];
  const TEST_DIRECTORY = '/Users/comixed/library/import';
  const TEST_MAXIMUM = 0;
  let state: ComicFileListState;

  beforeEach(() => {
    state = { ...initialComicFileListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = comicFileListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not set a directory', () => {
      expect(state.currentPath).toBe('');
    });

    it('should not have any comic groups', () => {
      expect(
        comicFileListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });
  });

  describe('loading comic files from the session', () => {
    beforeEach(() => {
      state = comicFileListReducer(
        { ...state, busy: false },
        ComicFileListActions.loadFromSession()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true, currentPath: TEST_PATH },
          ComicFileListActions.loadFromSessionSuccess({
            groups: TEST_COMIC_FILE_GROUP_LIST
          })
        );
      });

      it('should the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the group list', () => {
        expect(
          comicFileListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_COMIC_FILE_GROUP_LIST);
      });

      it('should reset the current path', () => {
        expect(state.currentPath).toStrictEqual('');
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true },
          ComicFileListActions.loadFromSessionFailure()
        );
      });

      it('should the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('loading comic files from disk', () => {
    beforeEach(() => {
      state = comicFileListReducer(
        { ...state, busy: false },
        ComicFileListActions.loadFromDisk({
          directory: TEST_DIRECTORY,
          maximum: TEST_MAXIMUM
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true, currentPath: TEST_PATH },
          ComicFileListActions.loadFromDiskSuccess({
            groups: TEST_COMIC_FILE_GROUP_LIST
          })
        );
      });

      it('should the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the group list', () => {
        expect(
          comicFileListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_COMIC_FILE_GROUP_LIST);
      });

      it('should reset the current path', () => {
        expect(state.currentPath).toStrictEqual('');
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true },
          ComicFileListActions.loadFromDiskFailure()
        );
      });

      it('should the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('setting the select state on comic files', () => {
    beforeEach(() => {
      state = comicFileListReducer(
        { ...state, busy: false },
        ComicFileListActions.select({
          filename: TEST_COMIC_FILE.filename,
          selected: true,
          single: true
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true },
          ComicFileListActions.selectSuccess({
            groups: TEST_COMIC_FILE_GROUP_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the group list', () => {
        expect(
          comicFileListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_COMIC_FILE_GROUP_LIST);
      });
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          { ...state, busy: true },
          ComicFileListActions.selectFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('importing comic files', () => {
    beforeEach(() => {
      state = comicFileListReducer(
        { ...state, busy: false },
        ComicFileListActions.import()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          comicFileListAdapter.setAll(TEST_COMIC_FILE_GROUP_LIST, {
            ...state,
            busy: true,
            currentPath: TEST_PATH
          }),
          ComicFileListActions.importSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should reset the current path', () => {
        expect(state.currentPath).toStrictEqual('');
      });

      it('should clear the comic file list', () => {
        expect(
          comicFileListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual([]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicFileListReducer(
          {
            ...state,
            busy: true
          },
          ComicFileListActions.importFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
