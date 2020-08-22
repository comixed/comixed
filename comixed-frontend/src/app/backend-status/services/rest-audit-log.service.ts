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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/logger';
import { GET_REST_AUDIT_LOG_ENTRIES_URL } from 'app/backend-status/backend-status.constants';
import { interpolate } from 'app/app.functions';

@Injectable({
  providedIn: 'root'
})
export class RestAuditLogService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads all entries after the specified cutoff date.
   *
   * @param cutoff the cutoff date
   */
  loadEntries(cutoff: number): Observable<any> {
    this.logger.debug('service: getting REST audit log entries:', cutoff);
    return this.http.get(
      interpolate(GET_REST_AUDIT_LOG_ENTRIES_URL, { cutoff: cutoff })
    );
  }
}
