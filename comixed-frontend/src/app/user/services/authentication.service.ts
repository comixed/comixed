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
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AUTH_SET_PREFERENCE_URL,
  AUTH_SUBMIT_LOGIN_DATA_URL,
  GET_AUTHENTICATED_USER_URL
} from 'app/services/url.constants';
import { interpolate } from 'app/app.functions';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  get_authenticated_user(): Observable<any> {
    return this.http.get(interpolate(GET_AUTHENTICATED_USER_URL));
  }

  submit_login_data(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.post(interpolate(AUTH_SUBMIT_LOGIN_DATA_URL), params);
  }

  set_preference(name: string, value: string): Observable<any> {
    const url = interpolate(AUTH_SET_PREFERENCE_URL, { name: name });

    if (!value) {
      return this.http.delete(url);
    } else {
      return this.http.put(url, value);
    }
  }
}
