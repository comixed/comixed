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

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { UserAdmin } from "../../../../models/actions/user-admin";
import * as UserAdminActions from "../../../../actions/user-admin.actions";
import { Observable, Subscription } from "rxjs";
import { Role } from "../../../../models/user/role";

@Component({
  selector: "app-user-details-editor",
  templateUrl: "./user-details-editor.component.html",
  styleUrls: ["./user-details-editor.component.css"]
})
export class UserDetailsEditorComponent implements OnInit, OnDestroy {
  private user_admin$: Observable<UserAdmin>;
  private user_admin_subscription: Subscription;
  public user_admin: UserAdmin;

  public email: string;
  public password: string;
  public password_verify: string;
  public is_admin: boolean;

  constructor(private store: Store<AppState>) {
    this.user_admin$ = store.select("user_admin");
    this.email = "";
    this.password = "";
    this.password_verify = "";
    this.is_admin = false;
  }

  ngOnInit() {
    this.user_admin_subscription = this.user_admin$.subscribe(
      (user_admin: UserAdmin) => {
        this.user_admin = user_admin;
        this.reset_user();
      }
    );
  }

  ngOnDestroy() {
    this.user_admin_subscription.unsubscribe();
  }

  save_user(): void {
    const id =
      !!this.user_admin.current_user && !!this.user_admin.current_user.id
        ? this.user_admin.current_user.id
        : null;

    this.store.dispatch(
      new UserAdminActions.UserAdminSaveUser({
        id: id,
        email: this.email,
        password: this.password,
        is_admin: this.is_admin
      })
    );
  }

  reset_user(): void {
    if (this.user_admin.current_user !== null) {
      this.email = this.user_admin.current_user.email;
    } else {
      this.email = "";
    }
    this.password = "";
    this.password_verify = "";
    this.is_admin = this.has_admin_role();
  }

  can_save(): boolean {
    if (!this.email || this.email.length === 0) {
      return false;
    }
    if (!!this.user_admin.current_user.id) {
      if (this.password === this.password_verify) {
        return true;
      }
    } else {
      if (
        this.password !== null &&
        this.password.length > 0 &&
        this.password === this.password_verify
      ) {
        return true;
      }
    }

    return false;
  }

  private has_admin_role(): boolean {
    if (this.user_admin.current_user && this.user_admin.current_user.roles) {
      return (
        this.user_admin.current_user.roles.findIndex((role: Role) => {
          return role.name === "ADMIN";
        }) != -1
      );
    }

    return false;
  }
}
