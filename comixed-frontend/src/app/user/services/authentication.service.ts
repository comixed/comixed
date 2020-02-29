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

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interpolate } from 'app/app.functions';
import {
  AUTH_SET_PREFERENCE_URL,
  AUTH_SUBMIT_LOGIN_DATA_URL,
  GET_AUTHENTICATED_USER_URL
} from 'app/services/url.constants';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private logger: NGXLogger, private http: HttpClient) {}

  getAuthenticatedUser(): Observable<any> {
    this.logger.debug('[GET] http request: get authenticated user');
    return this.http.get(interpolate(GET_AUTHENTICATED_USER_URL));
  }

  submitLoginData(email: string, password: string): Observable<any> {
    this.logger.debug(`[POST] http request: submit login data: email=${email}`);
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.post(interpolate(AUTH_SUBMIT_LOGIN_DATA_URL), params);
  }

  setPreference(name: string, value: string): Observable<any> {
    const url = interpolate(AUTH_SET_PREFERENCE_URL, { name: name });

    if (!value) {
      this.logger.debug(
        `[DELETE] http request: delete user preference: name=${name}`
      );
      return this.http.delete(url);
    } else {
      this.logger.debug(
        `[PUT] http request: set user preference: name=${name} value=${value}`
      );
      return this.http.put(url, value);
    }
  }
}
