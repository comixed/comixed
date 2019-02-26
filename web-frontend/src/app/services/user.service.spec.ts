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

import { TestBed, getTestBed } from "@angular/core/testing";
import { HttpRequest, HttpParams } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { AlertService } from "./alert.service";
import { AlertServiceMock } from "./alert.service.mock";
import { User } from "../models/user/user";
import { UserService, USER_SERVICE_API_URL } from "./user.service";

describe("UserService", () => {
  const EMAIL = "testinguser@comixedreader.org";
  const PASSWORD = "awesomesauce";
  const TOKEN = "thisisareallylongstringthatisatoken";

  let service: UserService;
  let http_mock: HttpTestingController;
  let alert_service: AlertService;

  const routes = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: AlertService, useClass: AlertServiceMock }
      ]
    });

    service = TestBed.get(UserService);
    http_mock = TestBed.get(HttpTestingController);
    alert_service = TestBed.get(AlertService);
  });

  afterEach(() => {
    http_mock.verify();
  });

  describe("when logging in", () => {
    it("submits the given email and password", () => {
      service.login(EMAIL, PASSWORD).subscribe((token: string) => {
        expect(token).toEqual(TOKEN);
      });

      const req = http_mock.expectOne(
        `${USER_SERVICE_API_URL}/token/generate-token`
      );
      expect(req.request.method).toEqual("POST");
      expect(req.request.body.get("email")).toEqual(EMAIL);
      expect(req.request.body.get("password")).toEqual(PASSWORD);

      req.flush(TOKEN);
    });

    xit("handles a failed login attempt", () => {});
  });

  xdescribe("retrieving the current user's details", () => {});

  xdescribe("creating a new user account", () => {});

  xdescribe("deleting an existing user account", () => {});

  xdescribe("getting the list of users", () => {});
});
