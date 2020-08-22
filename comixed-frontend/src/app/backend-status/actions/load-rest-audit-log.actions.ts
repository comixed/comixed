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

import { createAction, props } from '@ngrx/store';
import { RestAuditLogEntry } from 'app/backend-status/models/rest-audit-log-entry';

export const startLoadingRestAuditLogEntries = createAction(
  '[Load REST Audit Log]'
);

export const getRestAuditLogEntries = createAction(
  '[Load REST Audit Log] Get REST audit log entries',
  props<{ cutoff: number }>()
);

export const restAuditLogEntriesReceived = createAction(
  '[Load REST Audit Log] REST audit log entries received',
  props<{ entries: RestAuditLogEntry[]; latest: number }>()
);

export const getRestAuditLogEntriesFailed = createAction(
  '[Load REST Audit Log] Failed to get REST audit log entries'
);

export const stopGettingRestAuditLogEntries = createAction(
  '[Load REST Audit Log] Stop getting REST audit log entries'
);
