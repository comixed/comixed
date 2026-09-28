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
import { USER_READER } from '@app/user/user-fixtures';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LOAD_CURRENT_USER_URL, LOGIN_URL } from '@app/user/user-constants';
import { interpolate } from '@app/app-functions';
import { LoginResponse } from '@app/user/models/net/login-response';
import { AuthenticationService } from '@app/user/services/authentication-service';

describe('AuthenticationService', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = USER_READER.email;
  const TEST_PASSWORD = 'the!password';
  const TEST_TOKEN = 'the!returned!token';

  let service: AuthenticationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the current user', () => {
    const serverResponse = TEST_USER;

    service
      .loadCurrentUser()
      .subscribe(response => expect(response).toBe(TEST_USER));

    const req = httpController.expectOne(interpolate(LOAD_CURRENT_USER_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should login the user', () => {
    const serverResponse = {
      email: TEST_EMAIL,
      token: TEST_TOKEN
    } as LoginResponse;

    service
      .login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
      .subscribe(response => expect(response).toBe(serverResponse));

    const req = httpController.expectOne(
      interpolate(LOGIN_URL),
      'send login credentials'
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('email')).toEqual(TEST_EMAIL);
    expect(req.request.body.get('password')).toEqual(TEST_PASSWORD);
    req.flush(serverResponse);
    httpController.verify();
  });
});
