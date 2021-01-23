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
  clearWebAuditLog,
  clearWebAuditLogFailed,
  initializeWebAuditLog,
  loadWebAuditLogEntries,
  loadWebAuditLogEntriesFailed,
  webAuditLogCleared,
  webAuditLogEntriesLoaded
} from '../actions/web-audit-log.actions';
import { WebAuditLogEntry } from '@app/admin/models/web-audit-log-entry';

export const WEB_AUDIT_LOG_FEATURE_KEY = 'web_audit_log_state';

export interface WebAuditLogState {
  loading: boolean;
  latest: number;
  entries: WebAuditLogEntry[];
}

export const initialState: WebAuditLogState = {
  loading: false,
  latest: 0,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(initializeWebAuditLog, state => ({
    ...state,
    loading: false,
    latest: 0,
    entries: []
  })),
  on(loadWebAuditLogEntries, state => ({ ...state, loading: true })),
  on(webAuditLogEntriesLoaded, (state, action) => ({
    ...state,
    loading: false,
    latest: action.latest,
    entries: state.entries.concat(action.entries)
  })),
  on(loadWebAuditLogEntriesFailed, state => ({ ...state, loading: false })),
  on(clearWebAuditLog, state => ({ ...state, loading: true })),
  on(webAuditLogCleared, state => ({
    ...state,
    loading: false,
    latest: 0,
    entries: []
  })),
  on(clearWebAuditLogFailed, state => ({ ...state, loading: false }))
);
