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
import * as AuthActions from 'app/actions/authentication.actions';
import { AuthenticationState } from 'app/models/state/authentication-state';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'app/models/user';
import { Roles } from 'app/models/ui/roles';

@Injectable()
export class AuthenticationAdaptor {
  auth_state$: Observable<AuthenticationState>;
  auth_state: AuthenticationState;

  _authenticated$ = new BehaviorSubject<boolean>(false);
  _user$ = new BehaviorSubject<User>(null);
  _role$ = new BehaviorSubject<Roles>({
    is_admin: false,
    is_reader: false
  });

  constructor(private store: Store<AppState>) {
    this.auth_state$ = this.store.select('auth_state');

    this.auth_state$.subscribe((auth_state: AuthenticationState) => {
      this.auth_state = auth_state;
      this._authenticated$.next(this.auth_state.authenticated);
      this._user$.next(this.auth_state.user);
      this._role$.next({ is_reader: this.is_reader, is_admin: this.is_admin });
    });
  }

  get authenticated$(): Observable<boolean> {
    return this._authenticated$.asObservable();
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

  get initialized(): boolean {
    return this.auth_state && this.auth_state.initialized;
  }

  get authenticated(): boolean {
    return !!this.auth_state && this.auth_state.authenticated;
  }

  private has_role(name: string): boolean {
    if (this.auth_state.user && this.auth_state.user.roles.length > 0) {
      return this.auth_state.user.roles.some(role => role.name === name);
    }

    return false;
  }

  get is_reader(): boolean {
    return (
      (this.authenticated && this.has_role('READER')) || this.has_role('ADMIN')
    );
  }

  get is_admin(): boolean {
    return this.authenticated && this.has_role('ADMIN');
  }

  get has_auth_token(): boolean {
    if (this.authenticated) {
      return (
        this.auth_state.auth_token && this.auth_state.auth_token.length > 0
      );
    }

    return false;
  }

  get auth_token(): string {
    if (this.authenticated) {
      return this.auth_state.auth_token;
    }
    return null;
  }

  get showing_login(): boolean {
    return this.auth_state.show_login;
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
    if (this.auth_state.user) {
      const preference = this.auth_state.user.preferences.find(
        entry => entry.name === name
      );

      if (preference) {
        return preference.value;
      }
    }

    return null;
  }
}
