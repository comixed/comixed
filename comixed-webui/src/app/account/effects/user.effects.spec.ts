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
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { UserActions } from '@app/account/actions/user.actions';
import { USER_READER } from '@app/account/account-fixtures';
import { provideTranslateService } from '@ngx-translate/core';
import { UserEffects } from '@app/account/effects/user.effects';
import { LoginResponse } from '@app/account/models/net/login-response';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { vi } from 'vitest';

describe('UserEffects', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'th3!p455w0Rd';
  const TEST_TOKEN = 'The Auth Token';
  const TEST_PREFERENCE_NAME = 'preference.name';
  const TEST_PREFERENCE_VALUE = 'preference.value';
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState
  };

  let actions$: Observable<unknown>;
  let effects: UserEffects;
  let accountService: AccountService;
  let tokenService: TokenService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        AccountService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(UserEffects);
    accountService = TestBed.inject(AccountService);
    tokenService = TestBed.inject(TokenService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('logging into the app', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        email: TEST_EMAIL,
        token: TEST_TOKEN
      } as LoginResponse;
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = UserActions.loginSuccess();

      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockReturnValue(of(serviceResponse));
      const setAuthSpy = vi.spyOn(tokenService, 'setAuthToken');

      actions$ = of(action);
      await expect(firstValueFrom(effects.login$)).resolves.toEqual(outcome);
      expect(loginSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      expect(setAuthSpy).toHaveBeenCalledWith(TEST_TOKEN);
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = UserActions.loginFailure();

      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.login$)).resolves.toEqual(outcome);
      expect(loginSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = UserActions.loginFailure();

      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.login$)).resolves.toEqual(outcome);

      expect(loginSpy).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('loading the current user', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_USER;
      const action = UserActions.load();
      const outcome = UserActions.loadSuccess({ user: TEST_USER });

      const loadSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadUser$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = UserActions.load();
      const outcome = UserActions.loadFailure();

      const loadSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadUser$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = UserActions.load();
      const outcome = UserActions.loadFailure();

      const loadSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadUser$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('saving a user preference', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_USER;
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceSuccess({ user: TEST_USER });

      const saveSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.savePreference$)).resolves.toEqual(
        outcome
      );
      expect(saveSpy).toHaveBeenCalledWith({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceFailure();

      const saveSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.savePreference$)).resolves.toEqual(
        outcome
      );

      expect(saveSpy).toHaveBeenCalledWith({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceFailure();

      const saveSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.savePreference$)).resolves.toEqual(
        outcome
      );

      expect(saveSpy).toHaveBeenCalledWith({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
