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
  DELETE_USER_PREFERENCE_URL,
  LOAD_CURRENT_USER_URL,
  LOGIN_USER_URL,
  SAVE_CURRENT_USER_URL,
  SAVE_USER_PREFERENCE_URL,
  USER_SELF_TOPIC
} from '@app/user/user.constants';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { Subscription } from 'webstomp-client';
import { WebSocketService } from '@app/messaging';
import { currentUserLoaded } from '@app/user/actions/user.actions';
import { SaveCurrentUserRequest } from '@app/user/models/net/save-current-user-request';
import { SaveUserPreferenceRequest } from '@app/user/models/net/save-user-preference-request';
import { User } from '@app/user/models/user';

/**
 * Provides methods for interacting the backend REST APIs for working with users.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Subscribing to self updates');
        this.subscription = this.webSocketService.subscribe<User>(
          USER_SELF_TOPIC,
          user => {
            this.logger.debug('Received user update:', user);
            this.store.dispatch(currentUserLoaded({ user }));
          }
        );
      }
      if (!state.started && !!this.subscription) {
        this.logger.debug('Stopping user subscription');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }

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

  /**
   * Saves a user preference.
   * @param args.name the preference name
   * @param args.value the preference value
   */
  saveUserPreference(args: { name: string; value: string }): Observable<any> {
    if (!!args.value && args.value.length > 0) {
      this.logger.trace('Service: saving user preference:', args);
      return this.http.post(
        interpolate(SAVE_USER_PREFERENCE_URL, { name: args.name }),
        { value: args.value } as SaveUserPreferenceRequest
      );
    } else {
      this.logger.trace('Service: deleting user preference:', args);
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
    this.logger.debug('Service: saving user:', args);
    return this.http.put(
      interpolate(SAVE_CURRENT_USER_URL, { id: args.user.id }),
      {
        email: args.user.email,
        password: args.password
      } as SaveCurrentUserRequest
    );
  }
}
