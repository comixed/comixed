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
import {
  clearTaskAuditLog,
  cleartaskAuditLogFailed,
  taskAuditLogCleared
} from 'app/backend-status/actions/clear-task-audit-log.actions';

export const CLEAR_TASK_AUDIT_LOG_FEATURE_KEY = 'clear_task_audit_log_state';

export interface ClearTaskAuditLogState {
  working: boolean;
}

export const initialState: ClearTaskAuditLogState = {
  working: false
};

const clearTaskAuditLogReducer = createReducer(
  initialState,

  on(clearTaskAuditLog, state => ({ ...state, working: true })),
  on(taskAuditLogCleared, state => ({ ...state, working: false })),
  on(cleartaskAuditLogFailed, state => ({ ...state, working: false }))
);

export function reducer(
  state: ClearTaskAuditLogState | undefined,
  action: Action
) {
  return clearTaskAuditLogReducer(state, action);
}
