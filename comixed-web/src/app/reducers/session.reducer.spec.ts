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

describe('Session Reducer', () => {
  const IMPORT_COUNT = Math.abs(Math.round(Math.random() * 25));

  let state: SessionState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initialize state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the initialized flag', () => {
      expect(state.initialized).toBeFalsy();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('has as import count of zero', () => {
      expect(state.importCount).toEqual(0);
    });
  });

  describe('loading a user session updates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadSessionUpdate({ reset: false, timeout: 1000 })
      );
    });

    it('sets the loading session flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('receiving a user session update', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, initialized: false, importCount: 0 },
        sessionUpdateLoaded({ update: { importCount: IMPORT_COUNT } })
      );
    });

    it('clears the loading session flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTruthy();
    });

    it('sets the import count', () => {
      expect(state.importCount).toEqual(IMPORT_COUNT);
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
      expect(state.loading).toBeFalsy();
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTruthy();
    });
  });
});
