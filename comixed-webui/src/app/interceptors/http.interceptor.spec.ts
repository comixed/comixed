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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { AUTHENTICATION_TOKEN } from '@app/core/core.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {
  HTTP_AUTHORIZATION_HEADER,
  HTTP_REQUESTED_WITH_HEADER,
  HTTP_XML_REQUEST
} from '@app/app.constants';
import { TokenService } from '@app/core/services/token.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('HttpInterceptor', () => {
  const initialState = {};

  let interceptor: HttpInterceptor;
  let tokenService: jasmine.SpyObj<TokenService>;
  let httpMock: HttpTestingController;
  let store: MockStore<any>;
  let router: Router;
  let handler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: '**',
            redirectTo: ''
          }
        ]),
        LoggerModule.forRoot()
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true },
        {
          provide: TokenService,
          useValue: {
            hasAuthToken: jasmine.createSpy('TokenService.hasAuthToken()'),
            getAuthToken: jasmine.createSpy('TokenService.getAuthToken()')
          }
        },
        HttpInterceptor
      ]
    });

    interceptor = TestBed.inject(HttpInterceptor);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    handler = jasmine.createSpyObj<HttpHandler>(['handle']);
  });

  describe('when no authentication token is present', () => {
    let request: HttpRequest<any>;
    let requestClone: HttpRequest<any>;
    const response = new BehaviorSubject<HttpEvent<any>>(null);

    beforeEach(() => {
      request = new HttpRequest<any>('POST', '', {}, {});
      response.next(new HttpResponse({ status: 200 }));
      handler.handle.and.callFake(clone => {
        requestClone = clone;
        return response.asObservable();
      });
      tokenService.hasAuthToken.and.returnValue(false);
      interceptor.intercept(request, handler);
    });

    it('does not contain an authorization header', () => {
      expect(requestClone.headers.get(HTTP_AUTHORIZATION_HEADER)).toBeNull();
    });

    it('attaches a requested with header', () => {
      expect(requestClone.headers.get(HTTP_REQUESTED_WITH_HEADER)).toEqual(
        HTTP_XML_REQUEST
      );
    });
  });

  describe('when an authentication token is present', () => {
    let request: HttpRequest<any>;
    let requestClone: HttpRequest<any>;
    const response = new BehaviorSubject<HttpEvent<any>>(null);

    beforeEach(() => {
      request = new HttpRequest<any>('POST', '', {}, {});
      handler.handle.and.callFake(clone => {
        requestClone = clone;
        return response.asObservable();
      });
      tokenService.hasAuthToken.and.returnValue(true);
      tokenService.getAuthToken.and.returnValue(AUTHENTICATION_TOKEN);
      interceptor.intercept(request, handler);
    });

    it('attaches the token as a request header', () => {
      expect(requestClone.headers.get(HTTP_AUTHORIZATION_HEADER)).toEqual(
        `Bearer ${AUTHENTICATION_TOKEN}`
      );
    });

    it('attaches a requested with header', () => {
      expect(requestClone.headers.get(HTTP_REQUESTED_WITH_HEADER)).toEqual(
        HTTP_XML_REQUEST
      );
    });
  });
});
