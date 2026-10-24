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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  HttpParams,
  HttpResponse,
  provideHttpClient
} from '@angular/common/http';
import { AccountService } from '@app/account/services/account-service';
import {
  CHECK_FOR_ADMIN_ACCOUNT_URL,
  CREATE_ADMIN_ACCOUNT_URL,
  LOAD_USER_URL,
  LOGIN_URL,
  SAVE_USER_PREFERENCE_URL
} from '@app/account/account-constants';
import { interpolate } from '@app/app-functions';
import { USER_READER } from '@app/account/account-fixtures';
import { LoginResponse } from '@app/account/models/net/login-response';
import { CheckForAdminResponse } from '@app/account/models/net/check-for-admin-response';
import { CreateAdminAccountRequest } from '@app/account/models/net/create-admin-account-request';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';

describe('AccountService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [USER_FEATURE_KEY]: initialUserState
  };
  const TEST_USER = USER_READER;
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';
  const TEST_TOKEN = '!t35t!t0k3n!';
  const TEST_PREFERENCE_NAME = 'preference.name';
  const TEST_PREFERENCE_VALUE = 'preference.value';

  let service: AccountService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });

    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check for the existing admin account', () => {
    const serverResponse = { hasExisting: true } as CheckForAdminResponse;

    service.checkForAdminAccount().subscribe({
      next: response => expect(response).toBe(serverResponse)
    });

    const req = httpController.expectOne(
      interpolate(CHECK_FOR_ADMIN_ACCOUNT_URL)
    );
    expect(req.request.method).toEqual('GET');
    httpController.verify();
    req.flush(serverResponse);
  });

  it('should create for the initial admin account', () => {
    const serverResponse = new HttpResponse({ status: 200 });

    service
      .createAdminAccount({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .subscribe({
        next: response => expect(response).toBe(serverResponse)
      });

    const req = httpController.expectOne(interpolate(CREATE_ADMIN_ACCOUNT_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    } as CreateAdminAccountRequest);
    httpController.verify();
    req.flush(serverResponse);
  });

  it('should load the user', () => {
    const serverResponse = TEST_USER;

    service.loadUser().subscribe({
      next: response => expect(response).toBe(serverResponse)
    });

    const req = httpController.expectOne(interpolate(LOAD_USER_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(TEST_USER);
    httpController.verify();
  });

  it('should login the user', () => {
    const serverResponse = {
      token: TEST_TOKEN,
      email: TEST_EMAIL
    } as LoginResponse;

    service.login({ email: TEST_EMAIL, password: TEST_PASSWORD }).subscribe({
      next: response => expect(response).toBe(serverResponse)
    });

    const req = httpController.expectOne(interpolate(LOGIN_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(
      new HttpParams().set('email', TEST_EMAIL).set('password', TEST_PASSWORD)
    );
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should save a user preference', () => {
    const serverResponse = TEST_USER;

    service
      .saveUserPreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(SAVE_USER_PREFERENCE_URL, {
        preferenceName: TEST_PREFERENCE_NAME
      })
    );
    expect(req.request.method).toBe('POST');
    req.flush(serverResponse);
    httpController.verify();
  });
});
