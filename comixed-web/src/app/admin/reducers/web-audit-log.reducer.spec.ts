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
  initialState,
  reducer,
  WebAuditLogState
} from './web-audit-log.reducer';
import {
  WEB_AUDIT_LOG_ENTRY_1,
  WEB_AUDIT_LOG_ENTRY_2,
  WEB_AUDIT_LOG_ENTRY_3,
  WEB_AUDIT_LOG_ENTRY_4,
  WEB_AUDIT_LOG_ENTRY_5
} from '@app/admin/admin.fixtures';
import {
  clearWebAuditLog,
  clearWebAuditLogFailed,
  initializeWebAuditLog,
  loadWebAuditLogEntries,
  loadWebAuditLogEntriesFailed,
  webAuditLogCleared,
  webAuditLogEntriesLoaded
} from '@app/admin/actions/web-audit-log.actions';

describe('WebAuditLog Reducer', () => {
  const ENTRIES = [
    WEB_AUDIT_LOG_ENTRY_1,
    WEB_AUDIT_LOG_ENTRY_2,
    WEB_AUDIT_LOG_ENTRY_3
  ];
  const TIMESTAMP = new Date().getTime();

  let state: WebAuditLogState;

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

    it('has the default latest timestamp', () => {
      expect(state.latest).toEqual(0);
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('initialization', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: ENTRIES },
        initializeWebAuditLog()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the latest timestamp', () => {
      expect(state.latest).toEqual(0);
    });

    it('clears the entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadWebAuditLogEntries({ timestamp: TIMESTAMP })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving entries', () => {
    const RECEIVED = [WEB_AUDIT_LOG_ENTRY_4, WEB_AUDIT_LOG_ENTRY_5];

    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: ENTRIES, latest: 0 },
        webAuditLogEntriesLoaded({
          entries: RECEIVED,
          latest: TIMESTAMP
        })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('update the latest timestamp', () => {
      expect(state.latest).toEqual(TIMESTAMP);
    });

    it('updates the entries', () => {
      expect(state.entries).toEqual(ENTRIES.concat(RECEIVED));
    });
  });

  describe('failure to load entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: ENTRIES, latest: TIMESTAMP },
        loadWebAuditLogEntriesFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('leaves the latest timestamp unchanged', () => {
      expect(state.latest).toEqual(TIMESTAMP);
    });

    it('leaves the entries unchanged', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('clearing the web audit log', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, clearWebAuditLog());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('success clearing the web audit log', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: ENTRIES, latest: TIMESTAMP },
        webAuditLogCleared()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the latest timestamp', () => {
      expect(state.latest).toEqual(0);
    });

    it('clears the entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('failure to load entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: ENTRIES, latest: TIMESTAMP },
        clearWebAuditLogFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('leaves the latest timestamp unchanged', () => {
      expect(state.latest).toEqual(TIMESTAMP);
    });

    it('leaves the entries unchanged', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });
});
