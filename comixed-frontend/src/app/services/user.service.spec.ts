/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { USER_ADMIN, USER_READER } from 'app/user/models/user.fixtures';
import { USER_SERVICE_API_URL, UserService } from './user.service';
import { User } from 'app/user';

describe('UserService', () => {
  const USER_ID = 717;
  const EMAIL = 'testinguser@comixedreader.org';
  const PASSWORD = 'awesomesauce';
  const TOKEN = 'thisisareallylongstringthatisatoken';

  let service: UserService;
  let http_mock: HttpTestingController;

  const routes = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.get(UserService);
    http_mock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    http_mock.verify();
  });

  describe('when logging in', () => {
    it('submits the given email and password', () => {
      service.login(EMAIL, PASSWORD).subscribe((token: string) => {
        expect(token).toEqual(TOKEN);
      });

      const req = http_mock.expectOne(
        `${USER_SERVICE_API_URL}/token/generate-token`
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('email')).toEqual(EMAIL);
      expect(req.request.body.get('password')).toEqual(PASSWORD);

      req.flush(TOKEN);
    });
  });

  describe('retrieving the current user details', () => {
    it('fetches the user object from the backend', () => {
      service.get_user().subscribe((user: User) => {
        expect(user).toBe(USER_READER);
      });

      const req = http_mock.expectOne(`${USER_SERVICE_API_URL}/user`);
      expect(req.request.method).toEqual('GET');

      req.flush(USER_READER);
    });
  });
});
