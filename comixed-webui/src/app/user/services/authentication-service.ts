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

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import { LOAD_CURRENT_USER_URL, LOGIN_URL } from '@app/user/user-constants';
import { LoginResponse } from '@app/user/models/net/login-response';
import { User } from '@app/user/models/user';

@Service()
export class AuthenticationService {
  private logger = inject(LoggerService);
  private client = inject(HttpClient);

  loadCurrentUser(): Observable<User> {
    this.logger.debug('Loading current user');
    return this.client.get(
      interpolate(LOAD_CURRENT_USER_URL)
    ) as Observable<User>;
  }

  login(args: { email: string; password: string }): Observable<LoginResponse> {
    this.logger.debug('Sending login credentials');
    return this.client.post(
      interpolate(LOGIN_URL),
      new HttpParams().set('email', args.email).set('password', args.password)
    ) as Observable<LoginResponse>;
  }
}
