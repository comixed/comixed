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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import {
  CLEAR_TASK_AUDIT_LOG_URL,
  GET_TASK_LOG_ENTRIES_URL
} from 'app/backend-status/backend-status.constants';
import { interpolate } from 'app/app.functions';

@Injectable({
  providedIn: 'root'
})
export class TaskAuditLogService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  getLogEntries(timestamp: number): Observable<any> {
    this.logger.debug('service: get task audit log entries:', timestamp);
    return this.http.get(
      interpolate(GET_TASK_LOG_ENTRIES_URL, { timestamp: timestamp })
    );
  }

  /**
   * Sends a request to clear the task audit log.
   */
  clearAuditLog(): Observable<any> {
    this.logger.debug('service: send request to clear the task audit log');
    return this.http.delete(interpolate(CLEAR_TASK_AUDIT_LOG_URL));
  }
}
