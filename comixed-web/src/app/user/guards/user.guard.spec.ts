/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { TestBed } from '@angular/core/testing';

import { UserGuard } from './user.guard';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/logger';
import { Observable } from 'rxjs';
import { USER_ADMIN } from '@app/user/user.fixtures';

describe('UserGuard', () => {
  const USER = USER_ADMIN;
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState
  };

  let guard: UserGuard;
  let store: MockStore<any>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot()
      ],
      providers: [provideMockStore({ initialState })]
    });
    guard = TestBed.inject(UserGuard);
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when the authentication system is not initialized', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          initializing: true,
          authenticated: false,
          user: null
        }
      });
    });

    it('defers access', () => {
      (guard.canActivate(null, null) as Observable<boolean>).subscribe(
        response => expect(response).toBeTrue()
      );
    });

    afterEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          initializing: false,
          authenticated: true,
          user: USER_ADMIN
        }
      });
    });
  });

  describe('when the user is not authenticated', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          initializing: false,
          authenticated: false,
          user: null
        }
      });
    });

    it('redirects the browser to the login form', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('denies access', () => {
      expect(guard.canActivate(null, null)).toBeFalse();
    });
  });

  describe('when the user is authenticated', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          initializing: false,
          authenticated: true,
          user: USER
        }
      });
    });

    it('allows access', () => {
      expect(guard.canActivate(null, null)).toBeTrue();
    });
  });
});
