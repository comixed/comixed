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
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


import { AlertService } from './alert.service';
import { User } from '../models/user/user';

@Injectable()
export class UserService {
  api_url = '/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alert_service: AlertService,
  ) { }

  login(email: string, password: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('password', password);
    return this.http.post(`${this.api_url}/token/generate-token`, params);
  }

  get_user(): Observable<any> {
    return this.http.get(`${this.api_url}/user`);
  }

  get_user_list(): Observable<any> {
    return this.http.get(`${this.api_url}/admin/users/list`);
  }

  set_user_preference(name: string, value: string): Observable<any> {
    const params = new HttpParams().set('name', name).set('value', value);

    return this.http.post(`${this.api_url}/user/preferences`, params);
  }

  get_user_preference(name: string, defvalue: string): string {
    return defvalue;
  }
}
