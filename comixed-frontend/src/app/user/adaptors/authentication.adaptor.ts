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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
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
  authToken$ = new BehaviorSubject<string>(null);
  _showLogin$ = new BehaviorSubject<boolean>(false);
  _user$ = new BehaviorSubject<User>(null);
  _role$ = new BehaviorSubject<Roles>({
    admin: false,
    reader: false
  });
  constructor(private store: Store<AppState>) {
    this.store
      .select('auth_state')
      .pipe(filter(state => !!state))
      .subscribe((auth_state: AuthenticationState) => {
        this._initialized$.next(auth_state.initialized);
        this._authenticated$.next(auth_state.authenticated);
        this.authToken$.next(auth_state.auth_token);
        this._showLogin$.next(auth_state.show_login);
        this._role$.next({
          reader:
            this.hasRole(auth_state.user, 'READER') ||
            this.hasRole(auth_state.user, 'ADMIN'),
          admin: this.hasRole(auth_state.user, 'ADMIN')
        });
        this._user$.next(auth_state.user);
      });
  }

  private hasRole(user: User, name: string): boolean {
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

  get showLogin$(): Observable<boolean> {
    return this._showLogin$.asObservable();
  }

  get user$(): Observable<User> {
    return this._user$.asObservable();
  }

  get role$(): Observable<Roles> {
    return this._role$.asObservable();
  }

  getCurrentUser(): void {
    this.store.dispatch(new AuthActions.AuthCheckState());
  }

  get authenticated(): boolean {
    return this._authenticated$.getValue();
  }

  get isReader(): boolean {
    return this._role$.getValue().reader;
  }

  get isAdmin(): boolean {
    return this._role$.getValue().admin;
  }

  get hasAuthToken(): boolean {
    return !!this.authToken$.getValue();
  }

  get authToken(): string {
    return this.authToken$.getValue();
  }

  get showingLogin(): boolean {
    return this._showLogin$.getValue();
  }

  startLogin(): void {
    this.store.dispatch(new AuthActions.AuthShowLogin());
  }

  sendLoginData(email: string, password: string): void {
    this.store.dispatch(
      new AuthActions.AuthSubmitLogin({ email: email, password: password })
    );
  }

  cancelLogin(): void {
    this.store.dispatch(new AuthActions.AuthHideLogin());
  }

  startLogout(): void {
    this.store.dispatch(new AuthActions.AuthLogout());
  }

  setPreference(name: string, value: string): void {
    this.store.dispatch(
      new AuthActions.AuthSetPreference({ name: name, value: value })
    );
  }

  getPreference(name: string): string {
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
