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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interpolate } from 'app/app.functions';
import {
  GET_ALL_DUPLICATE_PAGES_URL,
  SET_BLOCKING_STATE_URL
} from 'app/library/library.constants';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { SetBlockingStateRequest } from 'app/library/models/net/set-blocking-state-request';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DuplicatePagesService {
  constructor(private http: HttpClient, private logger: NGXLogger) {}

  getAll(): Observable<any> {
    this.logger.debug('getting all duplicate pages');
    return this.http.get(interpolate(GET_ALL_DUPLICATE_PAGES_URL));
  }

  setBlocking(pages: DuplicatePage[], blocking: boolean): Observable<any> {
    this.logger.debug(
      `setting blocked state for pages: pages=${pages} blocking=${blocking}`
    );
    return this.http.post(interpolate(SET_BLOCKING_STATE_URL), {
      hashes: pages.map(page => page.hash),
      blocked: blocking
    } as SetBlockingStateRequest);
  }
}
