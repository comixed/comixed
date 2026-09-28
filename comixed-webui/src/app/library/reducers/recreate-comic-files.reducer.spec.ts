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

import {
  initialRecreateComicFilesState,
  recreateComicFilesReducer,
  RecreateComicFilesState
} from './recreate-comic-files.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { RecreateComicFilesActions } from '@app/library/actions/recreate-comic-files.actions';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ArchiveType } from '@app/library/models/archive-type';

describe('RecreateComicFiles Reducer', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_ARCHIVE_TYPE = ArchiveType.CB7;

  let state: RecreateComicFilesState;

  beforeEach(() => {
    state = { ...initialRecreateComicFilesState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = recreateComicFilesReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('recreating a single file', () => {
    beforeEach(() => {
      state = recreateComicFilesReducer(
        {
          ...state,
          busy: false
        },
        RecreateComicFilesActions.recreateComic({
          comic: TEST_COMIC,
          targetArchiveType: TEST_ARCHIVE_TYPE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = recreateComicFilesReducer(
          { ...state, busy: true },
          RecreateComicFilesActions.recreateComicSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = recreateComicFilesReducer(
          { ...state, busy: true },
          RecreateComicFilesActions.recreateComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('recreating selected files', () => {
    beforeEach(() => {
      state = recreateComicFilesReducer(
        {
          ...state,
          busy: false
        },
        RecreateComicFilesActions.recreateSelectedComics({
          targetArchiveType: TEST_ARCHIVE_TYPE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = recreateComicFilesReducer(
          { ...state, busy: true },
          RecreateComicFilesActions.recreateSelectedComicsSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = recreateComicFilesReducer(
          { ...state, busy: true },
          RecreateComicFilesActions.recreateSelectedComicsFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
