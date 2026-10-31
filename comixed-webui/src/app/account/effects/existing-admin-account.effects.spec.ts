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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { hot } from 'vitest-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ExistingAdminAccountEffects } from '@app/account/effects/existing-admin-account.effects';
import { expect, it, vi } from 'vitest';
import { AccountService } from '@app/account/services/account-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { ExistingAdminAccountActions } from '@app/account/actions/existing-admin-account.actions';
import { CheckForAdminResponse } from '@app/account/models/net/check-for-admin-response';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import { provideTranslateService } from '@ngx-translate/core';

describe('ExistingAdminAccountEffects', () => {
  const TEST_EXISTS = Math.random() > 0.5;
  const TEST_EMAIL = 'reader@comixedproject.org';
  const TEST_PASSWORD = 'th3!p455w0Rd';
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState
  };

  let actions$: Observable<unknown>;
  let effects: ExistingAdminAccountEffects;
  let accountService: AccountService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExistingAdminAccountEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        AccountService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(ExistingAdminAccountEffects);
    accountService = TestBed.inject(AccountService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    actions$ = hot('', {});
    expect(effects).toBeTruthy();
  });

  describe('checking for an existing admin account', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        hasExisting: TEST_EXISTS
      } as CheckForAdminResponse;
      const action = ExistingAdminAccountActions.check();
      const outcome = ExistingAdminAccountActions.checkSuccess({
        exists: TEST_EXISTS
      });

      const checkSpy = vi
        .spyOn(accountService, 'checkForAdminAccount')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.hasExisting$)).resolves.toEqual(
        outcome
      );
      expect(checkSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ExistingAdminAccountActions.check();
      const outcome = ExistingAdminAccountActions.checkFailure();

      const checkSpy = vi
        .spyOn(accountService, 'checkForAdminAccount')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.hasExisting$)).resolves.toEqual(
        outcome
      );

      expect(checkSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ExistingAdminAccountActions.check();
      const outcome = ExistingAdminAccountActions.checkFailure();

      const checkSpy = vi
        .spyOn(accountService, 'checkForAdminAccount')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.hasExisting$)).resolves.toEqual(
        outcome
      );

      expect(checkSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('creating the admin account', () => {
    it('should dispatch an action on success', async () => {
      const action = ExistingAdminAccountActions.create({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = ExistingAdminAccountActions.createSuccess();

      const createSpy = vi
        .spyOn(accountService, 'createAdminAccount')
        .mockReturnValue(of(undefined));

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.createAdminAccount$)
      ).resolves.toEqual(outcome);
      expect(createSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ExistingAdminAccountActions.create({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = ExistingAdminAccountActions.createFailure();

      const createSpy = vi
        .spyOn(accountService, 'createAdminAccount')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.createAdminAccount$)
      ).resolves.toEqual(outcome);

      expect(createSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ExistingAdminAccountActions.create({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = ExistingAdminAccountActions.createFailure();

      const createSpy = vi
        .spyOn(accountService, 'createAdminAccount')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.createAdminAccount$)
      ).resolves.toEqual(outcome);

      expect(createSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
