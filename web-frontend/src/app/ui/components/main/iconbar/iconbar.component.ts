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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../../models/user/user";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import * as UserActions from "../../../../actions/user.actions";

@Component({
  selector: "app-iconbar",
  templateUrl: "./iconbar.component.html",
  styleUrls: ["./iconbar.component.css"]
})
export class IconbarComponent implements OnInit {
  @Input() user: User;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {}

  do_login(): void {
    this.store.dispatch(new UserActions.UserStartLogin());
  }

  do_logout(): void {
    this.store.dispatch(new UserActions.UserLogout());
  }
}
