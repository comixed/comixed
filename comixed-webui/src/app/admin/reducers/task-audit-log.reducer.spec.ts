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
  reducer,
  initialState,
  TaskAuditLogState
} from './task-audit-log.reducer';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from '@app/admin/admin.fixtures';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogEntriesFailed,
  resetTaskAuditLog,
  taskAuditLogEntriesLoaded,
  taskAuditLogEntryReceived
} from '@app/admin/actions/task-audit-log.actions';

describe('TaskAuditLog Reducer', () => {
  const ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  const ENTRY = TASK_AUDIT_LOG_ENTRY_2;
  const LATEST = Math.abs(Math.ceil(Math.random() * 1000));

  let state: TaskAuditLogState;

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

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has a latest of 0', () => {
      expect(state.latest).toEqual(0);
    });

    it('clears the last page flag', () => {
      expect(state.lastPage).toBeFalse();
    });
  });

  describe('resetting the state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES, latest: LATEST, lastPage: true },
        resetTaskAuditLog()
      );
    });

    it('resets the entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('resets the latest', () => {
      expect(state.latest).toEqual(0);
    });

    it('clears the last page flag', () => {
      expect(state.lastPage).toBeFalse();
    });
  });

  describe('loading entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadTaskAuditLogEntries({ latest: LATEST })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving entries', () => {
    const RECEIVED_ENTRIES = [TASK_AUDIT_LOG_ENTRY_2, TASK_AUDIT_LOG_ENTRY_4];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          entries: ENTRIES,
          latest: 0,
          lastPage: false
        },
        taskAuditLogEntriesLoaded({
          entries: RECEIVED_ENTRIES,
          latest: LATEST,
          lastPage: true
        })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('updates the entries', () => {
      expect(state.entries).toEqual(ENTRIES.concat(RECEIVED_ENTRIES));
    });

    it('updates the latest', () => {
      expect(state.latest).toEqual(LATEST);
    });

    it('sets the lastPage flag', () => {
      expect(state.lastPage).toBeTrue();
    });
  });

  describe('failure to load entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true },
        loadTaskAuditLogEntriesFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('receiving an entry', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        taskAuditLogEntryReceived({ entry: ENTRY })
      );
    });

    it('appends the received entry', () => {
      expect(state.entries).toContain(ENTRY);
    });
  });
});
