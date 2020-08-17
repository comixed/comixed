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
import { interpolate } from 'app/app.functions';
import { GET_BUILD_DETAILS_URL } from 'app/app.constants';

@Injectable({
  providedIn: 'root'
})
export class BuildDetailsService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves the build detail from the backend.
   */
  getBuildDetails(): Observable<any> {
    return this.http.get(interpolate(GET_BUILD_DETAILS_URL));
  }
}
