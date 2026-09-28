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

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import {
  CHECK_FOR_ADMIN_ACCOUNT_URL,
  CREATE_ADMIN_ACCOUNT_URL,
  LOAD_CURRENT_USER_URL,
  LOGIN_URL
} from '@app/account/account-constants';
import { User } from '@app/account/models/user';
import { LoginResponse } from '@app/account/models/net/login-response';
import { CheckForAdminResponse } from '@app/account/models/net/check-for-admin-response';
import { CreateAdminAccountRequest } from '@app/account/models/net/create-admin-account-request';
import { Observable } from 'rxjs';

@Service()
export class AccountService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);

  checkForAdminAccount(): Observable<CheckForAdminResponse> {
    this.logger.trace('Checking for existing admin account');
    return this.client.get<CheckForAdminResponse>(
      interpolate(CHECK_FOR_ADMIN_ACCOUNT_URL)
    );
  }

  createAdminAccount(args: {
    email: string;
    password: string;
  }): Observable<HttpResponse<unknown>> {
    this.logger.trace('Creating admin account');
    return this.client.post<HttpResponse<unknown>>(
      interpolate(CREATE_ADMIN_ACCOUNT_URL),
      {
        email: args.email,
        password: args.password
      } as CreateAdminAccountRequest
    );
  }

  loadCurrentUser(): Observable<User | null> {
    this.logger.trace('Loading current user');
    return this.client.get<User>(interpolate(LOAD_CURRENT_USER_URL));
  }

  login(args: { email: string; password: string }): Observable<LoginResponse> {
    this.logger.trace('Sending login credentials');
    return this.client.post<LoginResponse>(
      interpolate(LOGIN_URL),
      new HttpParams().set('email', args.email).set('password', args.password)
    );
  }
}
