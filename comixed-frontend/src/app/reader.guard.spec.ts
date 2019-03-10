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
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "./app.state";
import * as UserActions from "./actions/user.actions";
import { userReducer } from "./reducers/user.reducer";
import { READER_USER, BLOCKED_USER } from "./models/user/user.fixtures";

import { ReaderGuard } from "./reader.guard";

describe("ReaderGuard", () => {
  let guard: ReaderGuard;
  let store: Store<AppState>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ user: userReducer })
      ],
      providers: [ReaderGuard]
    });

    guard = TestBed.get(ReaderGuard);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
  });

  describe("when there is no user logged in", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: null }));
      spyOn(router, "navigate");
    });

    it("blocks access", () => {
      expect(guard.canActivate()).toBeFalsy();
    });

    it("redirects the user to the home page", () => {
      guard.canActivate();
      expect(router.navigate).toHaveBeenCalledWith(["/home"]);
    });
  });

  describe("when a user with the reader role is logged in", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: READER_USER }));
    });

    it("grants access", () => {
      expect(guard.canActivate()).toBeTruthy();
    });
  });

  describe("blocks users without the reader role", () => {
    beforeEach(() => {
      store.dispatch(new UserActions.UserLoaded({ user: BLOCKED_USER }));
    });

    it("blocks access", () => {
      expect(guard.canActivate()).toBeFalsy();
    });
  });
});
