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
import { UserService } from './user.service';
import { USER_READER } from '@app/user/user.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ApiResponse, interpolate } from '@app/core';
import { User } from '@app/user/models/user';
import {
  LOAD_CURRENT_USER_URL,
  LOGIN_USER_URL
} from '@app/user/user.constants';
import { LoggerModule } from '@angular-ru/logger';
import { LoginResponse } from '@app/user/models/net/login-response';

describe('UserService', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';

  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the current user', () => {
    const serviceResponse = { success: true } as ApiResponse<User>;
    service
      .loadCurrentUser()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_CURRENT_USER_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serviceResponse);
  });

  it('can send the user credentials', () => {
    const serviceResponse = { success: true } as ApiResponse<LoginResponse>;
    service
      .loginUser({ email: USER.email, password: PASSWORD })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOGIN_USER_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('email')).toEqual(USER.email);
    expect(req.request.body.get('password')).toEqual(PASSWORD);
    req.flush(serviceResponse);
  });
});
