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

import { Action } from '@ngrx/store';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';

export enum TaskAuditLogActionTypes {
  GetEntries = '[TASK AUDIT LOG] Get task audit log entries',
  ReceivedEntries = '[TASK AUDIT LOG] Task audit log entries received',
  GetEntriesFailed = '[TASK AUDIT LOG] Failed to get task audit log entries'
}

export class GetTaskAuditLogEntries implements Action {
  readonly type = TaskAuditLogActionTypes.GetEntries;

  constructor(
    public payload: {
      cutoff: number;
    }
  ) {}
}

export class ReceivedTaskAuditLogEntries implements Action {
  readonly type = TaskAuditLogActionTypes.ReceivedEntries;

  constructor(public payload: { entries: TaskAuditLogEntry[] }) {}
}

export class GetTaskAuditLogEntriesFailed implements Action {
  readonly type = TaskAuditLogActionTypes.GetEntriesFailed;

  constructor() {}
}

export type TaskAuditLogActions =
  | GetTaskAuditLogEntries
  | ReceivedTaskAuditLogEntries
  | GetTaskAuditLogEntriesFailed;
