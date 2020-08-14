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

import {
  initialState,
  LoadTaskAuditLogState,
  reducer
} from './load-task-audit-log.reducer';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogFailed,
  taskAuditLogEntriesLoaded
} from 'app/backend-status/actions/load-task-audit-log.actions';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/backend-status.fixtures';

describe('LoadTaskAuditLog Reducer', () => {
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  const LATEST = new Date().getTime();

  let state: LoadTaskAuditLogState;

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

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has a default latest date', () => {
      expect(state.latest).toEqual(0);
    });
  });

  describe('when loading the entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadTaskAuditLogEntries({ since: new Date().getTime() })
      );
    });

    it('sets the load flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('when the entries were loaded', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          entries: []
        },
        taskAuditLogEntriesLoaded({
          entries: LOG_ENTRIES,
          latest: LATEST
        })
      );
    });

    it('clears the load flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('updates the list of entries', () => {
      expect(state.entries).toEqual(LOG_ENTRIES);
    });

    it('updates the latest date', () => {
      expect(state.latest).toEqual(LATEST);
    });
  });

  describe('loading the entries', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadTaskAuditLogFailed());
    });

    it('clears the load flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });
});
