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
  clearLoadedAuditLog,
  clearRestAuditLog,
  clearRestAuditLogFailed,
  restAuditLogClearSuccess
} from 'app/backend-status/actions/clear-rest-audit-log.actions';
import { RestAuditLogEntry } from 'app/backend-status/models/rest-audit-log-entry';

export const CLEAR_REST_AUDIT_LOG_FEATURE_KEY = 'clear_rest_audit_log_state';

export interface ClearRestAuditLogState {
  working: boolean;
  entries: RestAuditLogEntry[];
  latest: number;
}

export const initalState: ClearRestAuditLogState = {
  working: false,
  entries: [],
  latest: 0
};

const clearRestAuditLogReducer = createReducer(
  initalState,

  on(clearRestAuditLog, state => ({ ...state, working: true })),
  on(clearLoadedAuditLog, state => ({...state, working: true, entries: [], latest: 0})),
  on(restAuditLogClearSuccess, state => ({ ...state, working: false })),
  on(clearRestAuditLogFailed, state => ({ ...state, working: false }))
);

export function reducer(
  state: ClearRestAuditLogState | undefined,
  action: Action
) {
  return clearRestAuditLogReducer(state, action);
}
