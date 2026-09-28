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
import {
  ACCOUNT_UPDATES_TOPIC,
  CHECK_FOR_ADMIN_ACCOUNT_URL,
  CREATE_ADMIN_ACCOUNT_URL,
  LOAD_USER_URL,
  LOGIN_URL,
  SAVE_USER_PREFERENCE_URL
} from '@app/account/account-constants';
import { User } from '@app/account/models/user';
import { LoginResponse } from '@app/account/models/net/login-response';
import { CheckForAdminResponse } from '@app/account/models/net/check-for-admin-response';
import { CreateAdminAccountRequest } from '@app/account/models/net/create-admin-account-request';
import { Observable } from 'rxjs';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { Store } from '@ngrx/store';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
import { UserActions } from '@app/account/actions/user.actions';
import { SaveUserPreferenceRequest } from '@app/account/models/net/save-user-preference-request';
import selectUserState from '@app/account/selectors/user.selectors';

@Service()
export class AccountService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly store = inject(Store);
  readonly webSocketService = inject(WebSocketService);

  email = '';

  constructor() {
    this.logger.trace('Subscribing to user users');
    this.store.select(selectUserState).subscribe({
      next: state => {
        if (state.checked) {
          this.email = state.user?.email || '';
        }
      }
    });
    this.logger.trace('Subscribing to account updates');
    this.store.select(selectMessagingStarted).subscribe({
      next: started => {
        if (started) {
          this.webSocketService.subscribe<User>(
            interpolate(ACCOUNT_UPDATES_TOPIC, { email: this.email }),
            user => {
              this.logger.debug('Received user update:', user);
              this.store.dispatch(UserActions.userUpdate({ user }));
            }
          );
        }
      }
    });
  }

  checkForAdminAccount(): Observable<CheckForAdminResponse> {
    this.logger.trace('Checking for existing admin account');
    return this.client.get<CheckForAdminResponse>(
      interpolate(CHECK_FOR_ADMIN_ACCOUNT_URL)
    );
  }

  createAdminAccount(args: {
    email: string;
    password: string;
  }): Observable<void> {
    this.logger.trace('Creating admin account');
    return this.client.post<void>(interpolate(CREATE_ADMIN_ACCOUNT_URL), {
      email: args.email,
      password: args.password
    } as CreateAdminAccountRequest);
  }

  loadUser(): Observable<User | null> {
    this.logger.trace('Loading current user');
    return this.client.get<User>(interpolate(LOAD_USER_URL));
  }

  login(args: { email: string; password: string }): Observable<LoginResponse> {
    this.logger.trace('Sending login credentials');
    return this.client.post<LoginResponse>(
      interpolate(LOGIN_URL),
      new HttpParams().set('email', args.email).set('password', args.password)
    );
  }

  saveUserPreference(args: { name: string; value: string }): Observable<User> {
    this.logger.trace('Saving user preference:', args);
    return this.client.post<User>(
      interpolate(SAVE_USER_PREFERENCE_URL, { preferenceName: args.name }),
      { value: args.value } as SaveUserPreferenceRequest
    );
  }
}
