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

import { API_ROOT_URL } from '../core';

export const LOAD_WEB_AUDIT_LOG_ENTRIES_URL = `${API_ROOT_URL}/admin/web/audit/entries/\${timestamp}`;
export const CLEAR_WEB_AUDIT_LOG_ENTRIES_URL = `${API_ROOT_URL}/admin/web/audit/entries`;

export const MAXIMUM_TASK_AUDIT_LOG_RECORDS = 100;
export const LOAD_TASK_AUDIT_LOG_ENTRIES_URL = `${API_ROOT_URL}/admin/tasks/audit/entries`;
