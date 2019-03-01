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
import * as UserActions from "./actions/user.actions";
import { userReducer } from "./reducers/user.reducer";
import { ADMIN_USER, READER_USER } from "./models/user/user.fixtures";

import { AdminGuard } from "./Admin.guard";

describe("AdminGuard", () => {
  let guard: AdminGuard;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ user: userReducer })],
      providers: [AdminGuard]
    });

    guard = TestBed.get(AdminGuard);
    store = TestBed.get(Store);
  });

  describe("when there is no user logged in", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: null }));
    });

    it("blocks access", () => {
      expect(guard.canActivate()).toBeFalsy();
    });
  });

  describe("when a user with the admin role is logged in", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: ADMIN_USER }));
    });

    it("grants access", () => {
      expect(guard.canActivate()).toBeTruthy();
    });
  });

  describe("blocks users without the admin role", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: READER_USER }));
    });

    it("blocks access", () => {
      expect(guard.canActivate()).toBeFalsy();
    });
  });
});
