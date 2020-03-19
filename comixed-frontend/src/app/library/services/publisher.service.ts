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
import { HttpClient } from '@angular/common/http';
import { interpolate } from 'app/app.functions';
import { GET_PUBLISHER_BY_NAME_URL } from 'app/library/library.constants';
import { LoggerService } from '@angular-ru/logger';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  getPublisherByName(name: string): Observable<any> {
    this.logger.debug('[GET] http request: getting publisher name name:', name);
    return this.http.get(
      interpolate(GET_PUBLISHER_BY_NAME_URL, { name: name })
    );
  }
}
