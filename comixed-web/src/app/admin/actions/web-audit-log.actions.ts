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

import { createAction, props } from '@ngrx/store';
import { WebAuditLogEntry } from '@app/admin/models/web-audit-log-entry';

export const initializeWebAuditLog = createAction(
  '[Web Audit Log] Initialize the web audit log state'
);

export const loadWebAuditLogEntries = createAction(
  '[Web Audit Log] Load the web audit log entries',
  props<{ timestamp: number }>()
);

export const webAuditLogEntriesLoaded = createAction(
  '[Web Audit Log] Web audit log entries loaded',
  props<{ entries: WebAuditLogEntry[]; latest: number }>()
);

export const loadWebAuditLogEntriesFailed = createAction(
  '[Web Audit Log] Failed to load the web audit log entries'
);

export const clearWebAuditLog = createAction(
  '[Web Audit Log] Clears the web audit log'
);

export const webAuditLogCleared = createAction(
  '[Web Audit Log] Web audit log cleared'
);

export const clearWebAuditLogFailed = createAction(
  '[Web Audit Log] Failed to clear the web audit log'
);
