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
import { TaskAuditLogEntry } from '@app/admin/models/task-audit-log-entry';

export const resetTaskAuditLog = createAction(
  '[Task Audit Log] Reset the task audit log state'
);

export const loadTaskAuditLogEntries = createAction(
  '[Task Audit Log] Load task audit log entries',
  props<{ latest: number }>()
);

export const taskAuditLogEntriesLoaded = createAction(
  '[Task Audit Log] Task audit log entries loaded',
  props<{ entries: TaskAuditLogEntry[]; latest: number; lastPage: boolean }>()
);

export const loadTaskAuditLogEntriesFailed = createAction(
  '[Task Audit Log] Failed to load entries'
);

export const taskAuditLogEntryReceived = createAction(
  '[Task Audit Log] Updated entry received',
  props<{ entry: TaskAuditLogEntry }>()
);
