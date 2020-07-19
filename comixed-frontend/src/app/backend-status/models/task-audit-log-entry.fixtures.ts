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

import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';

export const TASK_AUDIT_LOG_ENTRY_1: TaskAuditLogEntry = {
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  description: 'The first task'
};

export const TASK_AUDIT_LOG_ENTRY_2: TaskAuditLogEntry = {
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  description: 'The second task'
};

export const TASK_AUDIT_LOG_ENTRY_3: TaskAuditLogEntry = {
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  description: 'The third task'
};

export const TASK_AUDIT_LOG_ENTRY_4: TaskAuditLogEntry = {
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  description: 'The fourth task'
};

export const TASK_AUDIT_LOG_ENTRY_5: TaskAuditLogEntry = {
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  description: 'The fifth task'
};
