/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { TestBed, inject } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";
import { AlertService } from "./alert.service";
import { AlertServiceMock } from "./alert.service.mock";
import { UserService } from "./user.service";
import { UserServiceMock } from "./user.service.mock";
import { ComicService } from "./comic.service";

describe("ComicService", () => {
  let server: ComicService;
  let alert_service: AlertService;
  let user_service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        ComicService,
        { provide: AlertService, useClass: AlertServiceMock },
        { provide: UserService, userClass: UserServiceMock }
      ]
    });

    server = TestBed.get(ComicService);
    alert_service = TestBed.get(AlertService);
    user_service = TestBed.get(UserService);
  });

  it("should be created", inject([ComicService], (service: ComicService) => {
    expect(service).toBeTruthy();
  }));
});
