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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
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

  describe('saving a user', () => {
    it('can create a new reader user account', () => {
      service
        .save_user(null, EMAIL, PASSWORD, false)
        .subscribe((user: User) => {
          expect(user).toBe(USER_READER);
        });

      const req = http_mock.expectOne(`${USER_SERVICE_API_URL}/admin/users`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('email')).toEqual(EMAIL);
      expect(req.request.body.get('password')).toEqual(PASSWORD);
      expect(req.request.body.get('is_admin')).toEqual(`${false}`);

      req.flush(USER_READER);
    });

    it('can create a new admin user account', () => {
      service.save_user(null, EMAIL, PASSWORD, true).subscribe((user: User) => {
        expect(user).toBe(USER_ADMIN);
      });

      const req = http_mock.expectOne(`${USER_SERVICE_API_URL}/admin/users`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('email')).toEqual(EMAIL);
      expect(req.request.body.get('password')).toEqual(PASSWORD);
      expect(req.request.body.get('is_admin')).toEqual(`${true}`);

      req.flush(USER_ADMIN);
    });

    it('can update an existing user account', () => {
      service
        .save_user(USER_ID, EMAIL, PASSWORD, true)
        .subscribe((user: User) => {
          expect(user).toBe(USER_ADMIN);
        });

      const req = http_mock.expectOne(
        `${USER_SERVICE_API_URL}/admin/users/${USER_ID}`
      );
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body.get('email')).toEqual(EMAIL);
      expect(req.request.body.get('password')).toEqual(PASSWORD);
      expect(req.request.body.get('is_admin')).toEqual(`${true}`);

      req.flush(USER_ADMIN);
    });
  });

  describe('deleting an existing user account', () => {
    it('can delete with just an id', () => {
      service.delete_user(USER_ID).subscribe((success: boolean) => {
        expect(success).toBeTruthy();
      });

      const req = http_mock.expectOne(
        `${USER_SERVICE_API_URL}/admin/users/${USER_ID}`
      );
      expect(req.request.method).toEqual('DELETE');

      req.flush(1);
    });
  });

  it('get get a list of users', () => {
    service.get_user_list().subscribe((users: User[]) => {
      expect(users).toEqual([USER_ADMIN, USER_READER]);
    });

    const req = http_mock.expectOne(`${USER_SERVICE_API_URL}/admin/users/list`);
    expect(req.request.method).toEqual('GET');

    req.flush([USER_ADMIN, USER_READER]);
  });
});
