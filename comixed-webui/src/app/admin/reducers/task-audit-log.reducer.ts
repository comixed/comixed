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

import { createReducer, on } from '@ngrx/store';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogEntriesFailed,
  resetTaskAuditLog,
  taskAuditLogEntriesLoaded,
  taskAuditLogEntryReceived
} from '../actions/task-audit-log.actions';
import { TaskAuditLogEntry } from '@app/admin/models/task-audit-log-entry';

export const TASK_AUDIT_LOG_FEATURE_KEY = 'task_audit_log_state';

export interface TaskAuditLogState {
  loading: boolean;
  entries: TaskAuditLogEntry[];
  latest: number;
  lastPage: boolean;
}

export const initialState: TaskAuditLogState = {
  loading: false,
  entries: [],
  latest: 0,
  lastPage: false
};

export const reducer = createReducer(
  initialState,

  on(resetTaskAuditLog, state => ({
    ...state,
    entries: [],
    latest: 0,
    lastPage: false
  })),
  on(loadTaskAuditLogEntries, state => ({ ...state, loading: true })),
  on(taskAuditLogEntriesLoaded, (state, action) => ({
    ...action,
    loading: false,
    entries: state.entries.concat(action.entries),
    latest: action.latest,
    lastPage: action.lastPage
  })),
  on(loadTaskAuditLogEntriesFailed, state => ({ ...state, loading: false })),
  on(taskAuditLogEntryReceived, (state, action) => ({
    ...state,
    entries: state.entries.concat(action.entry)
  }))
);
