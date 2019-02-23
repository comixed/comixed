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
import { TestBed, getTestBed, inject } from "@angular/core/testing";

import { AlertService } from "./alert.service";

describe("AlertService", () => {
  let injector;
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertService]
    });

    injector = getTestBed();
    service = injector.get(AlertService);
  });

  describe("#show_error_message()", () => {
    it("sends notifications on a new error message", () => {
      const message = "This is an error message";
      const error = new Error();

      service.error_messages.subscribe((received: string) => {
        expect(received).toEqual(message);
      });

      service.show_error_message(message, error);
    });
  });

  describe("#show_info_message()", () => {
    it("sends notifications on a new info message", () => {
      const message = "This is an info message";

      service.info_messages.subscribe((received: string) => {
        expect(received).toEqual(message);
      });

      service.show_info_message(message);
    });
  });
});
