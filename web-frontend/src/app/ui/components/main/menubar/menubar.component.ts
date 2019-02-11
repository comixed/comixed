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
import { MenuItem } from "primeng/api";
import { Observable, Subscription } from "rxjs";
import { AppState } from "../../../../app.state";
import { User } from "../../../../models/user/user";
import { Store } from "@ngrx/store";
import * as UserActions from "../../../../actions/user.actions";
import * as lodash from "lodash";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-menubar",
  templateUrl: "./menubar.component.html",
  styleUrls: ["./menubar.component.css"]
})
export class MenubarComponent implements OnInit, OnDestroy {
  private user$: Observable<User>;
  private user_subscription: Subscription;
  private user: User;

  protected menu_items: Array<MenuItem>;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.user$ = store.select("user");
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe((user: User) => {
      const update = !lodash.isEqual(this.user, user);

      this.user = user;
      if (update) {
        this.update_menu();
      }
    });
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
  }

  do_login(): void {
    this.store.dispatch(new UserActions.UserStartLogin());
  }

  do_logout(): void {
    this.store.dispatch(new UserActions.UserLogout());
  }

  private update_menu() {
    this.menu_items = [
      {
        label: this.translate.instant("menu.home.root"),
        icon: "fa fa-fw fa-home",
        routerLink: ["/"]
      }
    ];
    this.menu_items = this.menu_items.concat(this.add_comics_menu());
    if (this.user && this.user.is_admin) {
      this.menu_items = this.menu_items.concat(this.add_admin_menu());
    }
  }

  private add_comics_menu(): Array<MenuItem> {
    return [
      {
        label: this.translate.instant("menu.library.root"),
        icon: "fa fa-fw fa-book",
        visible: this.user && this.user.authenticated,
        items: [
          {
            label: this.translate.instant("menu.library.comics"),
            icon: "fa fa-fw fa-book",
            routerLink: ["/comics"],
            visible: this.user && this.user.authenticated
          },
          {
            label: this.translate.instant("menu.library.publishers"),
            icon: "fa fa-fw fa-book",
            routerLink: ["/publishers"],
            visible: this.user && this.user.authenticated
          },
          {
            label: this.translate.instant("menu.library.series"),
            icon: "fa fa-fw fa-book",
            routerLink: ["/series"],
            visible: this.user && this.user.authenticated
          },
          {
            label: this.translate.instant("menu.library.characters"),
            icon: "fa fa-fw fa-user",
            routerLink: ["/characters"],
            visible: this.user && this.user.authenticated
          },
          {
            label: this.translate.instant("menu.library.teams"),
            icon: "fa fa-fw fa-user",
            routerLink: ["/teams"],
            visible: this.user && this.user.authenticated
          },
          {
            label: this.translate.instant("menu.library.locations"),
            icon: "fa fa-fw fa-location-arrow",
            routerLink: ["/locations"],
            visible: this.user && this.user.authenticated
          },
          { separator: true, visible: this.user && this.user.is_admin },
          {
            label: this.translate.instant("menu.library.import"),
            icon: "fa fa-fw fa-upload",
            routerLink: ["/import"],
            visible: this.user && this.user.is_admin
          },
          {
            label: this.translate.instant("menu.library.duplicate-pages"),
            icon: "fa fa-fw fa-minus",
            routerLink: ["/pages/duplicates"],
            visible: this.user && this.user.is_admin
          }
        ]
      }
    ];
  }

  private add_admin_menu(): Array<MenuItem> {
    return [
      {
        label: this.translate.instant("menu.admin.root"),
        icon: "fa fa-fw fa-user-times",
        visible: this.user && this.user.is_admin,
        items: [
          {
            label: this.translate.instant("menu.admin.users"),
            icon: "fa fa-fw fa-users",
            visible: this.user && this.user.is_admin,
            routerLink: ["/admin/users"]
          }
        ]
      }
    ];
  }
}
