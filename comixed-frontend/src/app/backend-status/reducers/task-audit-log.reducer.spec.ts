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
  reducer,
  TaskAuditLogState
} from './task-audit-log.reducer';
import {
  GetTaskAuditLogEntries,
  GetTaskAuditLogEntriesFailed,
  ReceivedTaskAuditLogEntries
} from 'app/backend-status/actions/task-audit-log.actions';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/models/task-audit-log-entry.fixtures';

describe('TaskAuditLog Reducer', () => {
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];

  let state: TaskAuditLogState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });

    it('has an empty set of entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has a last entry date of 0', () => {
      expect(state.lastEntryDate).toEqual(0);
    });
  });

  describe('fetching a set of entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntries: false },
        new GetTaskAuditLogEntries({ cutoff: 0 })
      );
    });

    it('sets the fetching flag', () => {
      expect(state.fetchingEntries).toBeTruthy();
    });
  });

  describe('receiving a set of entries', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingEntries: true,
          entries: [TASK_AUDIT_LOG_ENTRY_2],
          lastEntryDate: null
        },
        new ReceivedTaskAuditLogEntries({ entries: LOG_ENTRIES })
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });

    it('merges the set of entries', () => {
      expect(
        LOG_ENTRIES.every(entry => state.entries.includes(entry))
      ).toBeTruthy();
    });

    it('updates the last entry date', () => {
      expect(state.lastEntryDate).not.toBeNull();
    });
  });

  describe('failure to receive audit log entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntries: true },
        new GetTaskAuditLogEntriesFailed()
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });
  });
});
