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
import { LoggerService } from '@angular-ru/logger';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  LOAD_CURRENT_USER_URL,
  LOGIN_USER_URL
} from '@app/user/user.constants';

/**
 * Provides methods for interacting the backend REST APIs for working with users.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Retrieve the current user's details.
   */
  loadCurrentUser(): Observable<any> {
    this.logger.trace('Service: load current user');
    return this.http.get(interpolate(LOAD_CURRENT_USER_URL));
  }

  /**
   * Sends the user's login credentials to the server.
   *
   * @param args.email the user's email address
   * @param args.password the user's password
   */
  loginUser(args: { email: string; password: string }): Observable<any> {
    this.logger.trace('Service: logging in user:', args.email);
    return this.http.post(
      interpolate(LOGIN_USER_URL),
      new HttpParams().set('email', args.email).set('password', args.password)
    );
  }
}
