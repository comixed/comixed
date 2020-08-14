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

import { createAction, props } from '@ngrx/store';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';

/**
 * Loads all task audit log entries after the specified date.
 */
export const loadTaskAuditLogEntries = createAction(
  '[LoadTaskAuditLog] Load task audit log entries',
  props<{ since: number }>()
);

/**
 * Receives additional task audit log entries.
 */
export const taskAuditLogEntriesLoaded = createAction(
  '[LoadTaskAuditLog] Task audit log entries loaded',
  props<{ entries: TaskAuditLogEntry[]; latest: number }>()
);

/**
 * Failed to get task audit log entries.
 */
export const loadTaskAuditLogFailed = createAction(
  '[LoadTaskAuditLog] Failed to load the task audit log entries'
);
