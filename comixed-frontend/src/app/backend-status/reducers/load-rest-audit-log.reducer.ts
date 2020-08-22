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

import { Action, createReducer, on } from '@ngrx/store';
import {
  getRestAuditLogEntries,
  getRestAuditLogEntriesFailed,
  restAuditLogEntriesReceived,
  startLoadingRestAuditLogEntries,
  stopGettingRestAuditLogEntries
} from '../actions/load-rest-audit-log.actions';
import { RestAuditLogEntry } from 'app/backend-status/models/rest-audit-log-entry';

export const LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY =
  'load_rest_audit_log_state';

export interface LoadRestAuditLogEntriesState {
  loading: boolean;
  stopped: boolean;
  entries: RestAuditLogEntry[];
  latest: number;
}

export const initialState: LoadRestAuditLogEntriesState = {
  loading: false,
  stopped: false,
  entries: [],
  latest: 0
};

const loadRestAuditLogReducer = createReducer(
  initialState,

  on(startLoadingRestAuditLogEntries, state => ({
    ...state,
    stopped: false,
    entries: [],
    latest: 0
  })),
  on(getRestAuditLogEntries, state => ({
    ...state,
    loading: true
  })),
  on(restAuditLogEntriesReceived, (state, action) => ({
    ...state,
    loading: false,
    entries: state.entries.concat(action.entries),
    latest: action.latest
  })),
  on(getRestAuditLogEntriesFailed, state => ({ ...state, loading: false })),
  on(stopGettingRestAuditLogEntries, state => ({ ...state, stopped: true }))
);

export function reducer(
  state: LoadRestAuditLogEntriesState | undefined,
  action: Action
) {
  return loadRestAuditLogReducer(state, action);
}
