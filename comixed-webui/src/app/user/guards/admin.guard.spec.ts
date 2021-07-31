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

import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin.guard';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/logger';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import { Observable } from 'rxjs';

describe('AdminGuard', () => {
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState
  };

  let guard: AdminGuard;
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
    guard = TestBed.inject(AdminGuard);
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
          authenticated: true,
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

  describe('when the user is not an admin', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          authenticated: true,
          user: USER_READER
        }
      });
    });

    it('redirects the browser to the root page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('denies access', () => {
      expect(guard.canActivate(null, null)).toBeFalse();
    });
  });

  describe('when the user is an admin', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          authenticated: true,
          user: USER_ADMIN
        }
      });
    });

    it('allows access', () => {
      expect(guard.canActivate(null, null)).toBeTrue();
    });
  });
});
