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

import { WebAuditLogEntry } from './models/web-audit-log-entry';
import { TaskAuditLogEntry } from '@app/admin/models/task-audit-log-entry';
import { PersistedTaskType } from '@app/admin/models/persisted-task-type.enum';

export const WEB_AUDIT_LOG_ENTRY_1: WebAuditLogEntry = {
  id: 1,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_2: WebAuditLogEntry = {
  id: 2,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_3: WebAuditLogEntry = {
  id: 3,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_4: WebAuditLogEntry = {
  id: 4,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_5: WebAuditLogEntry = {
  id: 5,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const TASK_AUDIT_LOG_ENTRY_1: TaskAuditLogEntry = {
  id: 1,
  taskType: PersistedTaskType.ADD_COMIC,
  startTime: new Date().getTime() - 1 * 60 * 60 * 1000,
  endTime: new Date().getTime(),
  description: 'First task audit log entry',
  successful: Math.random() > 0.5,
  exception: null
};

export const TASK_AUDIT_LOG_ENTRY_2: TaskAuditLogEntry = {
  id: 2,
  taskType: PersistedTaskType.ADD_COMIC,
  startTime: new Date().getTime() - 1 * 60 * 60 * 1000,
  endTime: new Date().getTime(),
  description: 'Second task audit log entry',
  successful: Math.random() > 0.5,
  exception: null
};

export const TASK_AUDIT_LOG_ENTRY_3: TaskAuditLogEntry = {
  id: 3,
  taskType: PersistedTaskType.ADD_COMIC,
  startTime: new Date().getTime() - 1 * 60 * 60 * 1000,
  endTime: new Date().getTime(),
  description: 'Third task audit log entry',
  successful: Math.random() > 0.5,
  exception: null
};

export const TASK_AUDIT_LOG_ENTRY_4: TaskAuditLogEntry = {
  id: 4,
  taskType: PersistedTaskType.ADD_COMIC,
  startTime: new Date().getTime() - 1 * 60 * 60 * 1000,
  endTime: new Date().getTime(),
  description: 'Fourth task audit log entry',
  successful: Math.random() > 0.5,
  exception: null
};

export const TASK_AUDIT_LOG_ENTRY_5: TaskAuditLogEntry = {
  id: 5,
  taskType: PersistedTaskType.ADD_COMIC,
  startTime: new Date().getTime() - 1 * 60 * 60 * 1000,
  endTime: new Date().getTime(),
  description: 'Fifth task audit log entry',
  successful: Math.random() > 0.5,
  exception: null
};
