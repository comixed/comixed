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

import { initialState, reducer, SessionState } from './session.reducer';
import {
  loadSessionUpdate,
  loadSessionUpdateFailed,
  sessionUpdateLoaded
} from '@app/actions/session.actions';
import { COMIC_1, COMIC_2 } from '@app/library/library.fixtures';

describe('Session Reducer', () => {
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;
  const UPDATED_COMICS = [COMIC_1];
  const REMOVED_COMICS = [COMIC_2];

  let state: SessionState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initialize state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the initialized flag', () => {
      expect(state.initialized).toBeFalse();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has a default latest value', () => {
      expect(state.latest).toEqual(0);
    });
  });

  describe('loading a user session updates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadSessionUpdate({
          timestamp: TIMESTAMP,
          maximumRecords: MAXIMUM_RECORDS,
          timeout: TIMEOUT
        })
      );
    });

    it('sets the loading session flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a user session update', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, initialized: false },
        sessionUpdateLoaded({
          latest: TIMESTAMP
        })
      );
    });

    it('clears the loading session flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTrue();
    });

    it('sets the latest timestamp', () => {
      expect(state.latest).toEqual(TIMESTAMP);
    });
  });

  describe('failure to load a user session update', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, initialized: false },
        loadSessionUpdateFailed()
      );
    });

    it('clears the loading session flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTrue();
    });
  });
});
