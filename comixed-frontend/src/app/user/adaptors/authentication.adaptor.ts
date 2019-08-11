/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as AuthActions from 'app/user/actions/authentication.actions';
import { AuthenticationState } from 'app/user/models/authentication-state';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'app/user';
import { Roles } from 'app/models/ui/roles';
import { filter } from 'rxjs/operators';

@Injectable()
export class AuthenticationAdaptor {
  _initialized$ = new BehaviorSubject<boolean>(false);
  _authenticated$ = new BehaviorSubject<boolean>(false);
  _auth_token$ = new BehaviorSubject<string>(null);
  _show_login$ = new BehaviorSubject<boolean>(false);
  _user$ = new BehaviorSubject<User>(null);
  _role$ = new BehaviorSubject<Roles>({
    is_admin: false,
    is_reader: false
  });
  constructor(private store: Store<AppState>) {
    this.store
      .select('auth_state')
      .pipe(filter(state => !!state))
      .subscribe((auth_state: AuthenticationState) => {
        this._initialized$.next(auth_state.initialized);
        this._authenticated$.next(auth_state.authenticated);
        this._auth_token$.next(auth_state.auth_token);
        this._show_login$.next(auth_state.show_login);
        this._user$.next(auth_state.user);
        this._role$.next({
          is_reader:
            this.has_role(auth_state.user, 'READER') ||
            this.has_role(auth_state.user, 'ADMIN'),
          is_admin: this.has_role(auth_state.user, 'ADMIN')
        });
      });
  }

  private has_role(user: User, name: string): boolean {
    if (user) {
      return user.roles.some(role => role.name === name);
    }
    return false;
  }

  get initialized$(): Observable<boolean> {
    return this._initialized$.asObservable();
  }

  get authenticated$(): Observable<boolean> {
    return this._authenticated$.asObservable();
  }

  get show_login$(): Observable<boolean> {
    return this._show_login$.asObservable();
  }

  get user$(): Observable<User> {
    return this._user$.asObservable();
  }

  get role$(): Observable<Roles> {
    return this._role$.asObservable();
  }

  get_current_user(): void {
    this.store.dispatch(new AuthActions.AuthCheckState());
  }

  get authenticated(): boolean {
    return this._authenticated$.getValue();
  }

  get is_reader(): boolean {
    return this._role$.getValue().is_reader;
  }

  get is_admin(): boolean {
    return this._role$.getValue().is_admin;
  }

  get has_auth_token(): boolean {
    return !!this._auth_token$.getValue();
  }

  get auth_token(): string {
    return this._auth_token$.getValue();
  }

  get showing_login(): boolean {
    return this._show_login$.getValue();
  }

  start_login(): void {
    this.store.dispatch(new AuthActions.AuthShowLogin());
  }

  send_login_data(email: string, password: string): void {
    this.store.dispatch(
      new AuthActions.AuthSubmitLogin({ email: email, password: password })
    );
  }

  cancel_login(): void {
    this.store.dispatch(new AuthActions.AuthHideLogin());
  }

  start_logout(): void {
    this.store.dispatch(new AuthActions.AuthLogout());
  }

  set_preference(name: string, value: string): void {
    this.store.dispatch(
      new AuthActions.AuthSetPreference({ name: name, value: value })
    );
  }

  get_preference(name: string): string {
    if (this._user$.getValue()) {
      const preference = this._user$
        .getValue()
        .preferences.find(entry => entry.name === name);

      if (preference) {
        return preference.value;
      }
    }

    return null;
  }
}
