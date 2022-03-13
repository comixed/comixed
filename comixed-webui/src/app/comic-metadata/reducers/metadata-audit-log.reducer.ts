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

import { createReducer, on } from '@ngrx/store';
import {
  clearMetadataAuditLog,
  clearMetadataAuditLogFailed,
  loadMetadataAuditLog,
  loadMetadataAuditLogFailed,
  metadataAuditLogCleared,
  metadataAuditLogLoaded
} from '../actions/metadata-audit-log.actions';
import { MetadataAuditLogEntry } from '@app/comic-metadata/models/metadata-audit-log-entry';

export const METADATA_AUDIT_LOG_FEATURE_KEY = 'metadata_audit_log_state';

export interface MetadataAuditLogState {
  busy: boolean;
  entries: MetadataAuditLogEntry[];
}

export const initialState: MetadataAuditLogState = {
  busy: false,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadMetadataAuditLog, state => ({ ...state, busy: true })),
  on(metadataAuditLogLoaded, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries
  })),
  on(loadMetadataAuditLogFailed, state => ({ ...state, busy: false })),
  on(clearMetadataAuditLog, state => ({ ...state, busy: true })),
  on(metadataAuditLogCleared, state => ({
    ...state,
    busy: false,
    entries: []
  })),
  on(clearMetadataAuditLogFailed, state => ({ ...state, busy: false }))
);
