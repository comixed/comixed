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

import { Action, createReducer, on } from '@ngrx/store';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogFailed,
  startLoadingTaskAuditLogEntries,
  stopLoadingTaskAuditLogEntries,
  taskAuditLogEntriesLoaded
} from 'app/backend-status/actions/load-task-audit-log.actions';

export const LOAD_TASK_AUDIT_LOG_FEATURE_KEY = 'load_task_audit_log_state';

export interface LoadTaskAuditLogState {
  loading: boolean;
  stopped: boolean;
  entries: TaskAuditLogEntry[];
  latest: number;
}

export const initialState: LoadTaskAuditLogState = {
  loading: false,
  stopped: false,
  entries: [],
  latest: 0
};

const loadTaskAuditLogReducer = createReducer(
  initialState,

  on(startLoadingTaskAuditLogEntries, state => ({
    ...state,
    stopped: false,
    entries: [],
    latest: 0
  })),
  on(loadTaskAuditLogEntries, state => ({ ...state, loading: true })),
  on(taskAuditLogEntriesLoaded, (state, action) => {
    const entries = state.entries.concat(action.entries);
    return {
      ...state,
      loading: false,
      entries: entries,
      latest: action.latest
    };
  }),
  on(loadTaskAuditLogFailed, state => ({ ...state, loading: false })),
  on(stopLoadingTaskAuditLogEntries, state => ({ ...state, stopped: true }))
);

export function reducer(
  state: LoadTaskAuditLogState | undefined,
  action: Action
) {
  return loadTaskAuditLogReducer(state, action);
}
