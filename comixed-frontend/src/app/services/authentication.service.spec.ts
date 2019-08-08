/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { User } from 'app/models/user';
import { USER_READER } from 'app/models/user.fixtures';
import {
  AUTH_DELETE_PREFERENCE_URL,
  AUTH_SET_PREFERENCE_URL,
  AUTH_SUBMIT_LOGIN_DATA_URL,
  GET_AUTHENTICATED_USER_URL,
  interpolate
} from 'app/services/url.constants';

describe('AuthenticationService', () => {
  const USER = USER_READER;
  const EMAIL = USER.email;
  const PASSWORD = 'abc!123';
  const PREFERENCE_NAME = 'pref.name';
  const PREFERENCE_VALUE = 'pref-value';

  let auth_service: AuthenticationService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService]
    });

    auth_service = TestBed.get(AuthenticationService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(auth_service).toBeTruthy();
  });

  it('gets data during an authentication check', () => {
    auth_service.get_authenticated_user().subscribe((response: User) => {
      expect(response).toEqual(USER);
    });

    const req = http_mock.expectOne(interpolate(GET_AUTHENTICATED_USER_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(USER);
  });

  it('posts data on login', () => {
    auth_service
      .submit_login_data(EMAIL, PASSWORD)
      .subscribe((response: User) => {
        expect(response).toEqual(USER);
      });

    const req = http_mock.expectOne(interpolate(AUTH_SUBMIT_LOGIN_DATA_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('email')).toEqual(EMAIL);
    expect(req.request.body.get('password')).toEqual(PASSWORD);
    req.flush(USER);
  });

  it('posts when setting a preference', () => {
    auth_service
      .set_preference(PREFERENCE_NAME, PREFERENCE_VALUE)
      .subscribe((response: User) => {
        expect(response).toEqual(USER);
      });

    const req = http_mock.expectOne(
      interpolate(AUTH_SET_PREFERENCE_URL, {
        name: PREFERENCE_NAME
      })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(PREFERENCE_VALUE);
    req.flush(USER);
  });

  it('deletes when removing a preference', () => {
    auth_service
      .set_preference(PREFERENCE_NAME, null)
      .subscribe((response: User) => {
        expect(response).toEqual(USER);
      });

    const req = http_mock.expectOne(
      interpolate(AUTH_DELETE_PREFERENCE_URL, {
        name: PREFERENCE_NAME
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(USER);
  });
});
