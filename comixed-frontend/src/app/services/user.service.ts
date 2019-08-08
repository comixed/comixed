/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const USER_SERVICE_API_URL = '/api';

@Injectable()
export class UserService {
  USER_SERVICE_API_URL = '/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.http.post(
      `${this.USER_SERVICE_API_URL}/token/generate-token`,
      params
    );
  }

  get_user(): Observable<any> {
    return this.http.get(`${this.USER_SERVICE_API_URL}/user`);
  }

  save_user(
    id: number,
    email: string,
    password: string,
    is_admin: boolean
  ): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)
      .set('is_admin', `${is_admin}`);

    if (id !== null) {
      return this.http.put(
        `${this.USER_SERVICE_API_URL}/admin/users/${id}`,
        params
      );
    } else {
      return this.http.post(`${this.USER_SERVICE_API_URL}/admin/users`, params);
    }
  }

  delete_user(id: number): Observable<any> {
    return this.http.delete(`${this.USER_SERVICE_API_URL}/admin/users/${id}`);
  }

  get_user_list(): Observable<any> {
    return this.http.get(`${this.USER_SERVICE_API_URL}/admin/users/list`);
  }

  set_user_preference(name: string, value: string): Observable<any> {
    const params = new HttpParams().set('name', name).set('value', value);

    return this.http.post(
      `${this.USER_SERVICE_API_URL}/user/preferences`,
      params
    );
  }

  get_user_preference(name: string, defvalue: string): string {
    return defvalue;
  }
}
