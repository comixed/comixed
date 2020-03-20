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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { interpolate } from 'app/app.functions';
import { USER_ADMIN, USER_READER } from 'app/user';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import {
  DELETE_USER_URL,
  GET_USERS_URL,
  SAVE_NEW_USER_URL,
  SAVE_USER_URL
} from 'app/user/user.constants';
import { LoggerModule } from '@angular-ru/logger';

import { UserAdminService } from './user-admin.service';

describe('UserAdminService', () => {
  const USERS = [USER_READER, USER_ADMIN];
  const USER = USER_ADMIN;

  let service: UserAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [UserAdminService]
    });

    service = TestBed.get(UserAdminService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get all users', () => {
    service.getAll().subscribe(response => expect(response).toEqual(USERS));

    const req = httpMock.expectOne(interpolate(GET_USERS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(USERS);
  });

  describe('saving a new user', () => {
    const NEW_USER_DETAILS: SaveUserDetails = {
      id: undefined,
      email: USER.email,
      password: '12345678',
      isAdmin: true
    };
    const EXISTING_USER_DETAILS = { ...NEW_USER_DETAILS, id: USER.id };

    it('can save a user', () => {
      service
        .save(NEW_USER_DETAILS)
        .subscribe(response => expect(response).toEqual(USER));

      const req = httpMock.expectOne(interpolate(SAVE_NEW_USER_URL));
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        email: NEW_USER_DETAILS.email,
        password: NEW_USER_DETAILS.password,
        isAdmin: NEW_USER_DETAILS.isAdmin
      });
      req.flush(USER);
    });

    it('save save an existing user', () => {
      service
        .save(EXISTING_USER_DETAILS)
        .subscribe(response => expect(response).toEqual(USER));

      const req = httpMock.expectOne(
        interpolate(SAVE_USER_URL, { id: USER.id })
      );
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual({
        email: EXISTING_USER_DETAILS.email,
        password: EXISTING_USER_DETAILS.password,
        isAdmin: EXISTING_USER_DETAILS.isAdmin
      });
      req.flush(USER);
    });
  });

  it('can delete a user', () => {
    service
      .deleteUser(USER)
      .subscribe(response => expect(response).not.toBeNull());

    const req = httpMock.expectOne(
      interpolate(DELETE_USER_URL, { id: USER.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });
});
