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
import { ExistingAdminAccountEffects } from './existing-admin-account.effects';
import { hot } from 'vitest-marbles';
import {
  checkForExistingAdminAccount,
  checkForExistingAdminAccountSuccess,
  createInitialAdminAccount,
  createInitialAdminAccountSuccess
} from '@app/account/actions/existing-admin-account.actions';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { CheckForAdminResponse } from '@app/account/models/net/check-for-admin-response';
import { HttpResponse } from '@angular/common/http';

describe('ExistingAdminAccountEffects', () => {
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';

  let actions$: Observable<unknown>;
  let effects: ExistingAdminAccountEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExistingAdminAccountEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ExistingAdminAccountEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('checking for the initial admin account', () => {
    it('should fire an action on success', () => {
      const serviceResponse = { hasExisting: true } as CheckForAdminResponse;
      const action = checkForExistingAdminAccount();
      const outcome = checkForExistingAdminAccountSuccess({ exists: true });

      actions$ = hot('-a', { a: action });
      const checkForAdminSpy = vitest
        .spyOn(effects.accountService, 'checkForAdminAccount')
        .mockReturnValue(of(serviceResponse));
      effects.loadExistingAdminAccounts$;
    });
  });

  describe('creating the initial admin account', () => {
    it('should fire an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = createInitialAdminAccount({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = createInitialAdminAccountSuccess();

      actions$ = hot('-a', { a: action });
      const checkForAdminSpy = vitest
        .spyOn(effects.accountService, 'createAdminAccount')
        .mockReturnValue(of(serviceResponse));
      effects.createAdminAccount$;
    });
  });
});
