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
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { AccountService } from '@app/account/services/account-service';
import { CurrentUserStore } from '@app/account/stores/current-user-store';
import { LOAD_CURRENT_USER_URL, LOGIN_URL } from '@app/account/user-constants';
import { interpolate } from '@app/app-functions';
import { USER_READER } from '@app/account/user-fixtures';
import { LoginResponse } from '@app/account/models/net/login-response';
import { TokenService } from '@app/account/services/token-service';

describe('AccountService', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = 'user@domain.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';
  const TEST_TOKEN = '!t35t!t0k3n!';

  let service: AccountService;
  let httpController: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideHttpClient(),
        provideHttpClientTesting(),
        CurrentUserStore,
        { provide: TokenService, useValue: { setAuthToken: vi.fn() } }
      ]
    });

    tokenService = TestBed.inject(TokenService);
    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading the current user', () => {
    it('success', async () => {
      const loadedSpy = vi.spyOn(service.currentUserStore, 'loaded');
      await service.loadCurrentUser();
      const req = httpController.expectOne(interpolate(LOAD_CURRENT_USER_URL));
      expect(req.request.method).toEqual('GET');
      req.flush(TEST_USER);
      httpController.verify();
      expect(loadedSpy).toHaveBeenCalledWith(TEST_USER);
    });
  });

  describe('login', () => {
    it('success', async () => {
      const loginSpy = vi.spyOn(service.currentUserStore, 'loginSuccess');

      await service.login({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const req = httpController.expectOne(interpolate(LOGIN_URL));
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(
        new HttpParams().set('email', TEST_EMAIL).set('password', TEST_PASSWORD)
      );
      req.flush({ token: TEST_TOKEN, email: TEST_EMAIL } as LoginResponse);
      httpController.verify();
      expect(loginSpy).toHaveBeenCalled();
      expect(tokenService.setAuthToken).toHaveBeenCalledWith(TEST_TOKEN);
    });
  });
});
