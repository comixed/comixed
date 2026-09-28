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
import { LoggerService } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import { LOAD_CURRENT_USER_URL, LOGIN_URL } from '@app/account/user-constants';
import { CurrentUserStore } from '@app/account/stores/current-user-store';
import { User } from '@app/account/models/user';
import { LoginResponse } from '@app/account/models/net/login-response';
import { TokenService } from '@app/account/services/token-service';

@Service()
export class AccountService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly tokenService = inject(TokenService);
  readonly currentUserStore = inject(CurrentUserStore);

  loadCurrentUser(): void {
    this.logger.trace('Loading current user');
    this.currentUserStore.loading();
    this.client.get(interpolate(LOAD_CURRENT_USER_URL)).subscribe({
      next: value => {
        this.logger.debug('User loaded:', value);
        this.currentUserStore.loaded(value as User);
      },
      error: error => {
        this.logger.error('Failed to load user:', error);
        this.currentUserStore.loaded(null);
      }
    });
  }

  login(args: { email: string; password: string }) {
    this.logger.trace('Sending login credentials');
    this.currentUserStore.login();
    this.client
      .post(
        interpolate(LOGIN_URL),
        new HttpParams().set('email', args.email).set('password', args.password)
      )
      .subscribe({
        next: value => {
          this.logger.debug('Login successful:', value);
          this.tokenService.setAuthToken((value as LoginResponse).token);
          this.currentUserStore.loginSuccess();
        },
        error: error => {
          this.logger.error('Failed to login user:', error);
          this.currentUserStore.loginFailure();
        }
      });
  }
}
