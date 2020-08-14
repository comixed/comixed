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
  TaskAuditLogActions,
  TaskAuditLogActionTypes
} from '../actions/task-audit-log.actions';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';

export const TASK_AUDIT_LOG_FEATURE_KEY = 'task_audit_log_state';

export interface TaskAuditLogState {
  fetchingEntries: boolean;
  entries: TaskAuditLogEntry[];
  lastEntryDate: number;
}

export const initialState: TaskAuditLogState = {
  fetchingEntries: false,
  entries: [],
  lastEntryDate: 0
};

export function reducer(
  state = initialState,
  action: TaskAuditLogActions
): TaskAuditLogState {
  switch (action.type) {
    case TaskAuditLogActionTypes.GetEntries:
      return { ...state, fetchingEntries: true };

    case TaskAuditLogActionTypes.ReceivedEntries: {
      const entries = state.entries.concat(action.payload.entries);
      let lastEntryDate = state.lastEntryDate;
      entries.forEach(entry => {
        if (entry.startTime > lastEntryDate) {
          lastEntryDate = entry.startTime;
        }
      });
      return {
        ...state,
        fetchingEntries: false,
        entries: entries,
        lastEntryDate: lastEntryDate
      };
    }

    case TaskAuditLogActionTypes.GetEntriesFailed:
      return { ...state, fetchingEntries: false };

    default:
      return state;
  }
}
