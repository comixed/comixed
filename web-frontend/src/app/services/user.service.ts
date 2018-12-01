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
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AlertService } from './alert.service';
import { User } from '../models/user/user';

@Injectable()
export class UserService {
  api_url = '/api';
  user: User;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alert_service: AlertService,
  ) {
    this.monitor_authentication_status();
  }

  monitor_authentication_status(): void {
    setInterval(() => {
      const headers = new HttpHeaders();
      this.http.get(`${this.api_url}/user`, { headers: headers }).subscribe(
        (user: User) => {
          this.user = user;
        },
        error => {
          console.log('ERROR: ' + error.message);
          this.user = null;
        });
    }, 250);
  }

  login(email: string, password: string, callback) {
    const headers = new HttpHeaders({ authorization: 'Basic ' + btoa(email + ':' + password) });
    this.http.get(`${this.api_url}/user`, { headers: headers }).subscribe(
      (user: User) => {
        if (user.name) {
          this.user = user;
        } else {
          this.user = null;
        }

        callback && callback();
      },
      error => {
        this.alert_service.show_error_message('Login failure', error);
        this.user = null;
      });
  }

  logout(): Observable<any> {
    return this.http.post('logout', {}).finally(() => {
      this.user = null;
      this.router.navigate(['home']);
    });
  }

  get_user(): User {
    return this.user;
  }

  get_username(): string {
    return this.user !== null ? this.user.name : null;
  }

  is_authenticated(): boolean {
    return this.user != null && this.user.authenticated;
  }

  change_username(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.post(`${this.api_url}/user/username`, params);
  }

  change_password(password: string): Observable<any> {
    const params = new HttpParams().set('password', password);
    return this.http.post(`${this.api_url}/user/password`, params);
  }

  get_user_preference(name: String, default_value: string): string {
    if (this.user) {
      for (const preference of this.user.preferences) {
        if (preference.name === name) {
          return preference.value;
        }
      }
    }
    return default_value;
  }

  set_user_preference(name: string, value: string): Observable<any> {
    const params = new HttpParams().set('name', name).set('value', value);
    return this.http.post(`${this.api_url}/user/property`, params);
  }
}
