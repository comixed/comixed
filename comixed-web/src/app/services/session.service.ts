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
import { interpolate } from '@app/core';
import { SessionUpdateRequest } from '@app/models/net/session-update-request';
import { LOAD_SESSION_UPDATE_URL } from '@app/app.constants';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/logger';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads a server-side session update for the user.
   *
   * @param args.reset the reset session flag
   * @param args.timeout the time (in ms) to wait for an update
   */
  loadSessionUpdate(args: {
    reset: boolean;
    timeout: number;
  }): Observable<any> {
    this.logger.trace('Service: loading session update:', args);
    return this.http.post(interpolate(LOAD_SESSION_UPDATE_URL), {
      reset: args.reset,
      timeout: args.timeout
    } as SessionUpdateRequest);
  }
}
