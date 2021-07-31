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
import { HttpInterceptor } from './http.interceptor';
import { LoggerModule } from '@angular-ru/logger';
import { AUTHENTICATION_TOKEN } from '@app/core/core.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HTTP_AUTHORIZATION_HEADER,
  HTTP_REQUESTED_WITH_HEADER,
  HTTP_XML_REQUEST
} from '@app/app.constants';
import { TokenService } from '@app/core/services/token.service';

const TEST_REQUEST_URL = 'http://localhost';

@Injectable()
class TestService {
  constructor(private http: HttpClient) {}

  request(): Observable<any> {
    return this.http.get(TEST_REQUEST_URL);
  }
}

describe('HttpInterceptor', () => {
  let tokenService: jasmine.SpyObj<TokenService>;
  let httpMock: HttpTestingController;
  let testService: TestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true },
        TestService,
        {
          provide: TokenService,
          useValue: {
            hasAuthToken: jasmine.createSpy('TokenService.hasAuthToken()'),
            getAuthToken: jasmine.createSpy('TokenService.getAuthToken()')
          }
        }
      ]
    });

    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    httpMock = TestBed.inject(HttpTestingController);
    testService = TestBed.inject(TestService);
  });

  describe('when no authentication token is present', () => {
    let req: TestRequest;

    beforeEach(() => {
      tokenService.hasAuthToken.and.returnValue(false);
      testService.request().subscribe(() => {});
      req = httpMock.expectOne(TEST_REQUEST_URL);
    });

    it('does not contain an authorization header', () => {
      expect(req.request.headers.get(HTTP_AUTHORIZATION_HEADER)).toBeNull();
    });

    it('attaches a requested with header', () => {
      expect(req.request.headers.get(HTTP_REQUESTED_WITH_HEADER)).toEqual(
        HTTP_XML_REQUEST
      );
    });
  });

  describe('when an authentication token is present', () => {
    let req: TestRequest;

    beforeEach(() => {
      tokenService.hasAuthToken.and.returnValue(true);
      tokenService.getAuthToken.and.returnValue(AUTHENTICATION_TOKEN);
      testService.request().subscribe(() => {});
      req = httpMock.expectOne(TEST_REQUEST_URL);
    });

    it('attaches the token as a request header', () => {
      expect(req.request.headers.get(HTTP_AUTHORIZATION_HEADER)).toEqual(
        `Bearer ${AUTHENTICATION_TOKEN}`
      );
    });

    it('attaches a requested with header', () => {
      expect(req.request.headers.get(HTTP_REQUESTED_WITH_HEADER)).toEqual(
        HTTP_XML_REQUEST
      );
    });
  });
});
