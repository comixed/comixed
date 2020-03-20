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
import { AppState, User } from 'app/user';
import {
  UserAdminClearCurrent,
  UserAdminCreateNew,
  UserAdminDeleteUser,
  UserAdminGetAll,
  UserAdminSave,
  UserAdminSetCurrent
} from 'app/user/actions/user-admin.actions';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import { USER_ADMIN_FEATURE_KEY } from 'app/user/reducers/user-admin.reducer';
import * as _ from 'lodash';
import { LoggerService } from '@angular-ru/logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class UserAdminAdaptor {
  private _user$ = new BehaviorSubject<User[]>([]);
  private _fetchingUser$ = new BehaviorSubject<boolean>(false);
  private _current$ = new BehaviorSubject<User>(null);
  private _saving$ = new BehaviorSubject<boolean>(false);
  private _saved$ = new BehaviorSubject<boolean>(false);
  private _deleting$ = new BehaviorSubject<boolean>(false);

  constructor(private logger: LoggerService, private store: Store<AppState>) {
    this.store
      .select(USER_ADMIN_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.debug('user admin state updated:', state);
        if (!_.isEqual(state.users, this._user$.getValue())) {
          this._user$.next(state.users);
        }
        if (state.fetchingAll !== this._fetchingUser$.getValue()) {
          this._fetchingUser$.next(state.fetchingAll);
        }
        if (!_.isEqual(state.current, this._current$.getValue())) {
          this._current$.next(state.current);
        }
        if (state.saving !== this._saving$.getValue()) {
          this._saving$.next(state.saving);
        }
        if (state.saved !== this._saved$.getValue()) {
          this._saved$.next(state.saved);
        }
        if (state.deleting !== this._deleting$.getValue()) {
          this._deleting$.next(state.deleting);
        }
      });
  }

  getAllUsers() {
    this.logger.debug('action: get all users');
    this.store.dispatch(new UserAdminGetAll());
  }

  get allUser$(): Observable<User[]> {
    return this._user$.asObservable();
  }

  get fetchingUser$(): Observable<boolean> {
    return this._fetchingUser$.asObservable();
  }

  createNewUser(): void {
    this.logger.debug('action: create new user');
    this.store.dispatch(new UserAdminCreateNew());
  }

  saveUser(details: SaveUserDetails): void {
    this.logger.debug('action: saving user:', details);
    this.store.dispatch(new UserAdminSave({ details: details }));
  }

  get current$(): Observable<User> {
    return this._current$.asObservable();
  }

  get saving$(): Observable<boolean> {
    return this._saving$.asObservable();
  }

  get saved$(): Observable<boolean> {
    return this._saved$.asObservable();
  }

  setCurrent(user: User): void {
    this.logger.debug('action: set current user:', user);
    this.store.dispatch(new UserAdminSetCurrent({ user: user }));
  }

  clearCurrent(): void {
    this.logger.debug('action: clear current user');
    this.store.dispatch(new UserAdminClearCurrent());
  }

  deleteUser(user: User): void {
    this.logger.debug('action: delete user:', user);
    this.store.dispatch(new UserAdminDeleteUser({ user: user }));
  }

  get deleting$(): Observable<boolean> {
    return this._deleting$.asObservable();
  }
}
