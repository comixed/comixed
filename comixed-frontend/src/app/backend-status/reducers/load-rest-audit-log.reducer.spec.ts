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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  initialState,
  LoadRestAuditLogEntriesState,
  reducer
} from './load-rest-audit-log.reducer';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/backend-status.fixtures';
import {
  getRestAuditLogEntries,
  getRestAuditLogEntriesFailed,
  restAuditLogEntriesReceived,
  startLoadingRestAuditLogEntries,
  stopGettingRestAuditLogEntries
} from 'app/backend-status/actions/load-rest-audit-log.actions';

describe('LoadRestAuditLog Reducer', () => {
  const ENTRIES = [REST_AUDIT_LOG_ENTRY_1];
  const LATEST = new Date().getTime();

  let state: LoadRestAuditLogEntriesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('clears the stopped flag', () => {
      expect(state.stopped).toBeFalsy();
    });

    it('has an empty list', () => {
      expect(state.entries).toEqual([]);
    });

    it('has the default latest date', () => {
      expect(state.latest).toEqual(0);
    });
  });

  describe('starting the loading process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, stopped: true, entries: ENTRIES },
        startLoadingRestAuditLogEntries()
      );
    });

    it('clears the stopped flag', () => {
      expect(state.stopped).toBeFalsy();
    });

    it('resets the entry list', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('getting entries', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: false
        },
        getRestAuditLogEntries({ cutoff: 0 })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('receiving entries', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          entries: ENTRIES,
          latest: 0
        },
        restAuditLogEntriesReceived({ entries: ENTRIES, latest: LATEST })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('merges the entries', () => {
      expect(state.entries).toEqual(ENTRIES.concat(ENTRIES));
    });

    it('sets the latest value', () => {
      expect(state.latest).toEqual(LATEST);
    });
  });

  describe('failure to receive entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true },
        getRestAuditLogEntriesFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });

  describe('stopping', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, stopped: false },
        stopGettingRestAuditLogEntries()
      );
    });

    it('sets the stopped flag', () => {
      expect(state.stopped).toBeTruthy();
    });
  });
});
