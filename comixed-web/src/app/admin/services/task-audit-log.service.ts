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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/logger';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  LOAD_TASK_AUDIT_LOG_ENTRIES_URL,
  MAXIMUM_TASK_AUDIT_LOG_RECORDS
} from '@app/admin/admin.constants';
import { LoadTaskAuditLogEntriesRequest } from '@app/admin/models/net/load-task-audit-log-entries-request';

@Injectable({
  providedIn: 'root'
})
export class TaskAuditLogService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadEntries(args: { latest: number }): Observable<any> {
    this.logger.debug('Service: loading task audit log entries:', args);
    return this.http.post(interpolate(LOAD_TASK_AUDIT_LOG_ENTRIES_URL), {
      latest: args.latest,
      maximum: MAXIMUM_TASK_AUDIT_LOG_RECORDS
    } as LoadTaskAuditLogEntriesRequest);
  }
}
