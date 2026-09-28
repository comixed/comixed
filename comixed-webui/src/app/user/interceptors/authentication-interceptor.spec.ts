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
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { beforeEach, Mock } from 'vitest';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { TokenService } from '@app/user/services/token-service';
import { provideRouter, Router } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest
} from '@angular/common/http/testing';
import {
  HTTP_AUTHORIZATION_HEADER,
  LOGIN_PAGE_URL
} from '@app/user/user-constants';
import { authenticationInterceptor } from '@app/user/interceptors/authentication-interceptor';

describe('authenticationInterceptor', () => {
  const TEST_URL = 'http://localhost/test/url';
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authenticationInterceptor(req, next));

  let authenticationService: TokenService;
  let router: Router;
  let httpController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: TEST_URL, redirectTo: '' }]),
        TokenService
      ]
    });

    authenticationService = TestBed.inject(TokenService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
    httpController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('intercepting requests', () => {
    let authServiceSpy: Mock<() => string>;

    describe('without an auth token', () => {
      beforeEach(() => {
        authServiceSpy = vi
          .spyOn(authenticationService, 'getAuthToken')
          .mockReturnValue('');
        httpClient
          .get(TEST_URL)
          .subscribe(response => console.log('Response:', response));

        const req = httpController.expectOne(TEST_URL);
        req.flush('');
        httpController.verify();
      });

      it('checks for the auth token', () => {
        expect(authServiceSpy).toHaveBeenCalled();
      });
    });

    describe('with an auth token', () => {
      const AUTH_TOKEN = 'the.auth.token';

      describe('handling a 401 response', () => {
        let routerSpy: Mock;
        let request: TestRequest;

        beforeEach(() => {
          routerSpy = vi.spyOn(router, 'navigateByUrl');
          authServiceSpy = vi
            .spyOn(authenticationService, 'getAuthToken')
            .mockReturnValue(AUTH_TOKEN);
          httpClient.get(TEST_URL).subscribe();

          request = httpController.expectOne(TEST_URL);
          request.flush('', { status: 401, statusText: 'not today pal' });
          httpController.verify();
        });

        it('submits the auth token', () => {
          expect(
            request.request.headers.get(HTTP_AUTHORIZATION_HEADER)
          ).toEqual(`Bearer ${AUTH_TOKEN}`);
        });

        it('redirects to the login page', () => {
          expect(routerSpy).toHaveBeenCalledWith(LOGIN_PAGE_URL);
        });
      });

      describe('handling a 404 response', () => {
        let request: TestRequest;

        beforeEach(() => {
          authServiceSpy = vi
            .spyOn(authenticationService, 'getAuthToken')
            .mockReturnValue(AUTH_TOKEN);
          httpClient.get(TEST_URL).subscribe();

          request = httpController.expectOne(TEST_URL);
          request.flush('', {
            status: 404,
            statusText: 'im sorry dave I cant do that'
          });
          httpController.verify();
        });

        it('submits the auth token', () => {
          expect(
            request.request.headers.get(HTTP_AUTHORIZATION_HEADER)
          ).toEqual(`Bearer ${AUTH_TOKEN}`);
        });
      });
    });
  });
});
