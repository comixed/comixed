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
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  CLEAR_WEB_AUDIT_LOG_ENTRIES_URL,
  LOAD_WEB_AUDIT_LOG_ENTRIES_URL
} from '@app/admin/admin.constants';

@Injectable({
  providedIn: 'root'
})
export class WebAuditLogService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads web audit log entries added since the given timestamp.
   *
   * @param args.timestamp the timestamp
   */
  load(args: { timestamp: number }): Observable<any> {
    this.logger.debug('Service: loading web audit log entries:', args);
    return this.http.get(
      interpolate(LOAD_WEB_AUDIT_LOG_ENTRIES_URL, { timestamp: args.timestamp })
    );
  }

  /**
   * Clears the web audit log.
   */
  clear(): Observable<any> {
    this.logger.debug('Service: clearing web audit log');
    return this.http.delete(interpolate(CLEAR_WEB_AUDIT_LOG_ENTRIES_URL));
  }
}
