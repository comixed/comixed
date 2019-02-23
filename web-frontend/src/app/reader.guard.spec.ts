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

import { TestBed, async, inject } from "@angular/core/testing";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "./app.state";
import { userReducer } from "./reducers/user.reducer";

import { ReaderGuard } from "./reader.guard";

describe("ReaderGuard", () => {
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ user: userReducer })],
      providers: [ReaderGuard]
    });

    store = TestBed.get(Store);
  });

  it("should ...", inject([ReaderGuard], (guard: ReaderGuard) => {
    expect(guard).toBeTruthy();
  }));
});
