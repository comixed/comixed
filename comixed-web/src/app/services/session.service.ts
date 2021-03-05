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
import { TaskCountService } from '@app/services/state/task-count.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private taskCountService: TaskCountService
  ) {}

  /**
   * Invoked to start subscriptions.
   */
  startSubscriptions(): void {
    this.logger.debug('Starting session services');
    this.taskCountService.start();
  }

  /**
   * Invoked to stop subscriptions.
   */
  stopSubscriptions(): void {
    this.logger.debug('Stopping session services');
    this.taskCountService.stop();
  }

  /**
   * Loads a server-side session update for the user.
   *
   * @param args.timestamp the timestamp of the latest previous update
   * @param args.maximumRecords the maximum records to return
   * @param args.timeout the time (in ms) to wait for an update
   */
  loadSessionUpdate(args: {
    timestamp: number;
    maximumRecords: number;
    timeout: number;
  }): Observable<any> {
    this.logger.trace('Service: loading session update:', args);
    return this.http.post(interpolate(LOAD_SESSION_UPDATE_URL), {
      timestamp: args.timestamp,
      maximumRecords: args.maximumRecords,
      timeout: args.timeout
    } as SessionUpdateRequest);
  }
}
