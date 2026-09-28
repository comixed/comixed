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
import {
  initialRemoteLibraryState,
  remoteLibraryReducer,
  RemoteLibraryState
} from '@app/library/reducers/remote-library.reducer';
import { RemoteLibraryActions } from '@app/library/actions/remote-library.actions';
import { REMOTE_LIBRARY } from '@app/library/library-fixtures';

describe('RemoteLibrary Reducer', () => {
  const TEST_REMOTE_LIBRARY = REMOTE_LIBRARY;
  let state: RemoteLibraryState;

  beforeEach(() => {
    state = { ...initialRemoteLibraryState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = remoteLibraryReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the loading flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no total comics', () => {
      expect(state.totalComics).toBe(0);
    });

    it('should have no unscraped comics', () => {
      expect(state.unscrapedComics).toBe(0);
    });

    it('should have no deleted comics', () => {
      expect(state.deletedComics).toBe(0);
    });

    it('should have no duplicate comics', () => {
      expect(state.duplicateComics).toBe(0);
    });

    it('should contain no publishers', () => {
      expect(state.publishers).toStrictEqual([]);
    });

    it('should contain no series', () => {
      expect(state.series).toStrictEqual([]);
    });

    it('should contain no characters', () => {
      expect(state.characters).toStrictEqual([]);
    });

    it('should contain no teams', () => {
      expect(state.teams).toStrictEqual([]);
    });

    it('should contain no locations', () => {
      expect(state.locations).toStrictEqual([]);
    });

    it('should contain no stories', () => {
      expect(state.stories).toStrictEqual([]);
    });

    it('should contain no states', () => {
      expect(state.states).toStrictEqual([]);
    });

    it('should contain no archive types', () => {
      expect(state.archiveTypes).toStrictEqual([]);
    });

    it('should contain no comics by publisher and year totals', () => {
      expect(state.byPublisherAndYear).toStrictEqual([]);
    });
  });

  describe('loading the remote library state', () => {
    beforeEach(() => {
      state = remoteLibraryReducer(
        { ...state, busy: false },
        RemoteLibraryActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = remoteLibraryReducer(
          { ...state, busy: true },
          RemoteLibraryActions.loadSuccess({ state: TEST_REMOTE_LIBRARY })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the total comics', () => {
        expect(state.totalComics).toBe(TEST_REMOTE_LIBRARY.totalComics);
      });

      it('should update the unscraped comics', () => {
        expect(state.unscrapedComics).toBe(TEST_REMOTE_LIBRARY.unscrapedComics);
      });

      it('should update the deleted comics', () => {
        expect(state.deletedComics).toBe(TEST_REMOTE_LIBRARY.deletedComics);
      });

      it('should update the duplicate comics', () => {
        expect(state.duplicateComics).toBe(TEST_REMOTE_LIBRARY.duplicateComics);
      });

      it('should update the publishers', () => {
        expect(state.publishers).toStrictEqual(TEST_REMOTE_LIBRARY.publishers);
      });

      it('should update the series', () => {
        expect(state.series).toStrictEqual(TEST_REMOTE_LIBRARY.series);
      });

      it('should update the characters', () => {
        expect(state.characters).toStrictEqual(TEST_REMOTE_LIBRARY.characters);
      });

      it('should update the teams', () => {
        expect(state.teams).toStrictEqual(TEST_REMOTE_LIBRARY.teams);
      });

      it('should update the locations', () => {
        expect(state.locations).toStrictEqual(TEST_REMOTE_LIBRARY.locations);
      });

      it('should update the stories', () => {
        expect(state.stories).toStrictEqual(TEST_REMOTE_LIBRARY.stories);
      });

      it('should update the states', () => {
        expect(state.states).toStrictEqual(TEST_REMOTE_LIBRARY.states);
      });

      it('should update the archive types', () => {
        expect(state.archiveTypes).toStrictEqual(
          TEST_REMOTE_LIBRARY.archiveTypes
        );
      });

      it('should update the comics by publisher and year totals', () => {
        expect(state.byPublisherAndYear).toStrictEqual(
          TEST_REMOTE_LIBRARY.byPublisherAndYear
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = remoteLibraryReducer(
          { ...state, busy: true },
          RemoteLibraryActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
