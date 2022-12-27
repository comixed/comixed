/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import { LOAD_PUBLISHERS_URL } from '@app/collections/collections.constants';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadPublishers(): Observable<any> {
    this.logger.debug('Loading all publishers');
    return this.http.get(interpolate(LOAD_PUBLISHERS_URL));
  }
}
