/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGuard } from './admin.guard';
import { AuthenticationAdaptor } from 'app/user';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let router: Router;
  let authenticationAdaptor: AuthenticationAdaptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'home', redirectTo: '' }]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [AdminGuard, AuthenticationAdaptor]
    });

    guard = TestBed.get(AdminGuard);
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    router = TestBed.get(Router);
  });

  describe('when there is no user logged in', () => {
    beforeEach(() => {
      authenticationAdaptor._initialized$.next(true);
      authenticationAdaptor._authenticated$.next(false);
      spyOn(router, 'navigate');
    });

    it('blocks access', () => {
      expect(guard.canActivate()).toBeFalsy();
    });

    it('redirects the user to the home page', () => {
      guard.canActivate();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('when a user with the admin role is logged in', () => {
    beforeEach(() => {
      authenticationAdaptor._initialized$.next(true);
      authenticationAdaptor._authenticated$.next(true);
      authenticationAdaptor._role$.next({ admin: true, reader: false });
    });

    it('grants access', () => {
      expect(guard.canActivate()).toBeTruthy();
    });
  });

  describe('blocks users without the admin role', () => {
    beforeEach(() => {
      authenticationAdaptor._initialized$.next(true);
      authenticationAdaptor._authenticated$.next(true);
      authenticationAdaptor._role$.next({ admin: false, reader: false });
    });

    it('blocks access', () => {
      expect(guard.canActivate()).toBeFalsy();
    });
  });
});
