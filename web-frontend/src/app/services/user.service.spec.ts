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
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { RouterModule, Routes } from "@angular/router";

import { AlertService } from "./alert.service";
import { User } from "../models/user/user";

import { UserService } from "./user.service";

describe("UserService", () => {
  let injector;
  let service: UserService;
  let http_mock: HttpTestingController;

  const routes = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [AlertService, UserService]
    });

    injector = getTestBed();
    service = injector.get(UserService);
    http_mock = injector.get(HttpTestingController);
  });
});
