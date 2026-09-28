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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { CurrentUserEffects } from './current-user.effects';
import { USER_READER } from '@app/account/account-fixtures';
import {
  loadCurrentUser,
  loadCurrentUserSuccess,
  login,
  loginSuccess
} from '@app/account/actions/current-user.actions';
import { hot } from 'vitest-marbles';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { AccountService } from '@app/account/services/account-service';
import { LoginResponse } from '@app/account/models/net/login-response';

describe('CurrentUserEffects', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';
  const TEST_TOKEN = '!t35t!t0k3n!';

  let actions$: Observable<unknown>;
  let effects: CurrentUserEffects;
  let accountService: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CurrentUserEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        AccountService
      ]
    });

    effects = TestBed.inject(CurrentUserEffects);
    accountService = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current user', () => {
    it('fires an action on success', () => {
      const serviceResponse = TEST_USER;
      const action = loadCurrentUser();
      const outcome = loadCurrentUserSuccess({ user: TEST_USER });

      actions$ = hot('-a', { a: action });
      const loadCurrentAccountSpy = vi
        .spyOn(accountService, 'loadCurrentUser')
        .mockReturnValue(of(serviceResponse));
      effects.loadCurrentUser$.pipe();
    });
  });

  describe('login', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        email: TEST_EMAIL,
        token: TEST_TOKEN
      } as LoginResponse;
      const action = login({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const outcome1 = loginSuccess();
      const outcome2 = loadCurrentUser();

      actions$ = hot('-a', { a: action });
      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockReturnValue(of(serviceResponse));
      effects.login$.pipe();
    });
  });
});
