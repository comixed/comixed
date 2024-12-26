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
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  CHECK_FOR_ADMIN_ACCOUNT_URL,
  CREATE_ADMIN_ACCOUNT_URL,
  CREATE_USER_ACCOUNT_URL,
  DELETE_USER_ACCOUNT_URL,
  DELETE_USER_PREFERENCE_URL,
  LOAD_COMICS_READ_STATISTICS_URL,
  LOAD_CURRENT_USER_URL,
  LOAD_USER_LIST_URL,
  LOGIN_USER_URL,
  LOGOUT_USER_URL,
  SAVE_CURRENT_USER_URL,
  SAVE_USER_ACCOUNT_URL,
  SAVE_USER_PREFERENCE_URL,
  USER_SELF_TOPIC
} from '@app/user/user.constants';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import { loadCurrentUserSuccess } from '@app/user/actions/user.actions';
import { User } from '@app/user/models/user';
import { SaveCurrentUserRequest } from '@app/user/models/net/save-current-user-request';
import { SaveUserPreferenceRequest } from '@app/user/models/net/save-user-preference-request';
import { CreateAccountRequest } from '@app/user/models/net/create-account-request';
import { CreateUserAccountRequest } from '@app/user/models/net/create-user-account-request';
import { setReadComicBooks } from '@app/user/actions/read-comic-books.actions';
import { selectUser } from '@app/user/selectors/user.selectors';

/**
 * Provides methods for interacting the backend REST APIs for working with users.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  userUpdateSubscriptions: Subscription;
  email: string | null = null;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.userUpdateSubscriptions) {
        this.subscribeToUserUpdates();
      }
      this.store.select(selectUser).subscribe(user => {
        this.email = user?.email;
        this.subscribeToUserUpdates();
      });
      if (!state.started && !!this.userUpdateSubscriptions) {
        this.logger.debug('Stopping user subscription');
        this.userUpdateSubscriptions.unsubscribe();
        this.userUpdateSubscriptions = null;
      }
    });
  }

  checkForAdminAccount(): Observable<any> {
    this.logger.debug('Checking if there are existing user accounts');
    return this.http.get(interpolate(CHECK_FOR_ADMIN_ACCOUNT_URL));
  }

  createAdminAccount(args: {
    email: string;
    password: string;
  }): Observable<any> {
    this.logger.debug('Creating admin account:', args);
    return this.http.post(interpolate(CREATE_ADMIN_ACCOUNT_URL), {
      email: args.email,
      password: args.password
    } as CreateAccountRequest);
  }

  /**
   * Retrieve the current user's details.
   */
  loadCurrentUser(): Observable<any> {
    this.logger.debug('Load current user');
    return this.http.get(interpolate(LOAD_CURRENT_USER_URL));
  }

  /**
   * Sends the user's login credentials to the server.
   *
   * @param args.email the user's email address
   * @param args.password the user's password
   */
  loginUser(args: { email: string; password: string }): Observable<any> {
    this.logger.debug('Logging in user:', args.email);
    return this.http.post(
      interpolate(LOGIN_USER_URL),
      new HttpParams().set('email', args.email).set('password', args.password)
    );
  }

  logoutUser(): Observable<any> {
    this.logger.debug('Logout user out');
    return this.http.post(interpolate(LOGOUT_USER_URL), {});
  }

  /**
   * Saves a user preference.
   * @param args.name the preference name
   * @param args.value the preference value
   */
  saveUserPreference(args: { name: string; value: string }): Observable<any> {
    if (!!args.value && args.value.length > 0) {
      this.logger.debug('Saving user preference:', args);
      return this.http.post(
        interpolate(SAVE_USER_PREFERENCE_URL, { name: args.name }),
        { value: args.value } as SaveUserPreferenceRequest
      );
    } else {
      this.logger.debug('Deleting user preference:', args);
      return this.http.delete(
        interpolate(DELETE_USER_PREFERENCE_URL, { name: args.name })
      );
    }
  }

  /**
   * Saves the specified user and password.
   *
   * If the password is excluded the the user's password is not updated.
   *
   * @param args.user the user
   * @param args.password the password
   */
  saveUser(args: { user: User; password: string }): Observable<any> {
    this.logger.debug('Saving user:', args);
    return this.http.put(
      interpolate(SAVE_CURRENT_USER_URL, { id: args.user.id }),
      {
        email: args.user.email,
        password: args.password
      } as SaveCurrentUserRequest
    );
  }

  loadComicsReadStatistics(): Observable<any> {
    this.logger.debug('Loading comics read statistics');
    return this.http.get(interpolate(LOAD_COMICS_READ_STATISTICS_URL));
  }

  loadUserAccounts(): Observable<any> {
    this.logger.debug('Loading user accounts');
    return this.http.get(interpolate(LOAD_USER_LIST_URL));
  }

  saveUserAccount(args: {
    id: number | null;
    email: string;
    password: string;
    admin: boolean;
  }): Observable<any> {
    if (!!args.id) {
      this.logger.debug('Saving user account:', args);
      return this.http.put(
        interpolate(SAVE_USER_ACCOUNT_URL, { userId: args.id }),
        {
          email: args.email,
          password: args.password,
          admin: args.admin
        } as CreateUserAccountRequest
      );
    } else {
      this.logger.debug('Creating user account:', args);
      return this.http.post(interpolate(CREATE_USER_ACCOUNT_URL), {
        email: args.email,
        password: args.password,
        admin: args.admin
      } as CreateUserAccountRequest);
    }
  }

  deleteUserAccount(args: { id: number }): Observable<any> {
    this.logger.debug('Deleting user account:', args);
    return this.http.delete(
      interpolate(DELETE_USER_ACCOUNT_URL, { userId: args.id })
    );
  }

  private subscribeToUserUpdates(): void {
    if (!!this.email) {
      const topic = interpolate(USER_SELF_TOPIC, { email: this.email });
      this.logger.debug('Subscribing to self updates:', topic);
      this.userUpdateSubscriptions = this.webSocketService.subscribe<User>(
        topic,
        user => {
          this.logger.debug('Received user update:', user);
          this.store.dispatch(loadCurrentUserSuccess({ user }));
          this.store.dispatch(
            setReadComicBooks({ entries: user.readComicBooks })
          );
        }
      );
    }
  }
}
