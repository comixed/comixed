/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { provideRouter } from '@angular/router';
import { adminGuard } from './admin-guard';
import {
  CURRENT_USER_FEATURE_KEY,
  initialCurrentUserState
} from '@app/account/reducers/current-user.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { beforeEach } from 'vitest';
import { USER_ADMIN } from '@app/account/account-fixtures';
import { Component } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({ template: '<h1>Protected page</h1>' })
class Protected {}

describe('adminGuard', () => {
  const initialState = { [CURRENT_USER_FEATURE_KEY]: initialCurrentUserState };

  let store: MockStore;
  let routerHarness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'protected',
            component: Protected,
            canActivate: [adminGuard]
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });

    store = TestBed.inject(MockStore);
    routerHarness = await RouterTestingHarness.create();
  });

  it('should grant access to an admin', async () => {
    store.setState({
      ...initialCurrentUserState,
      [CURRENT_USER_FEATURE_KEY]: {
        ...initialCurrentUserState,
        checked: true,
        user: USER_ADMIN
      }
    });
    await routerHarness.navigateByUrl('/protected', Protected);
    expect(routerHarness.routeNativeElement?.textContent).toContain(
      'Protected'
    );
  });

  it('should deny access to a non-admin', async () => {
    store.setState({
      ...initialCurrentUserState,
      [CURRENT_USER_FEATURE_KEY]: {
        ...initialCurrentUserState,
        checked: true,
        user: { ...USER_ADMIN, roles: [] }
      }
    });
    await routerHarness.navigateByUrl('/protected');
    expect(routerHarness.routeNativeElement).toBeNull();
  });
});
